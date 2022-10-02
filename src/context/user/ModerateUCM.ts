import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, MessageSelectOptionData, Modal, ModalActionRowComponent, ModalSubmitInteraction, Permissions, SelectMenuInteraction, Snowflake, TextInputComponent, UserContextMenuInteraction } from "discord.js";
import { MessageButtonStyles, TextInputStyles } from "discord.js/typings/enums";
import { UserContextMenu } from "../../base/UserContextMenu";
import { Bot } from "../../Bot";
import { SoftConfig } from "../../config/SoftConfig";
import { Action, ActionType } from "../../entities/Action";
import { Rule } from "../../entities/Rule";
import { I18n } from "../../utils/I18n";
import { ORM } from "../../utils/ORM";

const sanctions = {
    'warn:0': 'Warning',
    'kick:0': 'Kick',
    'to:60': 'Timeout 60 seconds',
    'to:300': 'Timeout 5 minutes',
    'to:600': 'Timeout 10 minutes',
    'to:3600': 'Timeout 1 hour',
    'to:21600': 'Timeout 6 hours',
    'to:86400': 'Timeout 1 day',
    'to:172800': 'Timeout 2 days',
    'to:604800': 'Timeout 1 week',
    'to:1209600': 'Timeout 2 weeks',
    'ban:2419200': 'Ban 1 month',
    'ban:4838400': 'Ban 2 months',
    'ban:7257600': 'Ban 3 months',
    'ban:3124202400': 'Ban'
};

export class ModerateUCM extends UserContextMenu {
    constructor() {
        super();
        Bot.registerSelect('cmr', this.ruleChanged.bind(this));
        Bot.registerSelect('cms', this.sanctionChanged.bind(this));
        Bot.registerButton('cmc', this.submitButton.bind(this))
        Bot.registerModal('cmm', this.submitModal.bind(this))
    }

    getConfigs(): string[] {
        return [
            'moderate.logchannel',
            'moderate.servers'
        ]
    }

    getName() {
        return "moderate";
    }

    getDMPermission(): boolean {
        return false;
    }

    getNeededPermissions(): bigint | null {
        return Permissions.FLAGS.BAN_MEMBERS | Permissions.FLAGS.KICK_MEMBERS | Permissions.FLAGS.MODERATE_MEMBERS;
    }

    private async generateReply(lang: string, id: Snowflake, selected_rules?: number[], selected_sanction?: string) {

        const rules = await Rule.findAll();

        const truncate = (str: string, n: number): string => {
            return (str.length > n) ? str.slice(0, n - 3) + '...' : str;
        };

        return {
            content: I18n.getI18n('context_menu.moderate.reply.content', lang),
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setCustomId(`cmr,${id},${selected_rules?.join(':') ?? ''},${selected_sanction ?? ''}`)
                            .setOptions(rules.map((value: Rule): MessageSelectOptionData => ({
                                label: truncate(`${value.identifier}: ${value.content}`, 100),
                                value: `${value.id}`,
                                default: selected_rules?.includes(value.id) ?? false
                            })))
                            .setMaxValues(rules.length)
                            .setPlaceholder(I18n.getI18n('context_menu.moderate.reply.rule', lang))
                    ),
                new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setCustomId(`cms,${id},${selected_rules?.join(':') ?? ''},${selected_sanction ?? ''}`)
                            .setOptions(Object.entries(sanctions).map((value, index) => ({
                                label: value[1],
                                value: value[0],
                                default: value[0] === selected_sanction
                            })))
                            .setPlaceholder(I18n.getI18n('context_menu.moderate.reply.sanction', lang))
                    ),
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId(`cmc,${id},${selected_rules?.join(':') ?? ''},${selected_sanction ?? ''}`)
                            .setLabel(I18n.getI18n('context_menu.moderate.reply.submit', lang))
                            .setStyle(MessageButtonStyles.PRIMARY)
                    )
            ]
        }
    }

    async submitModal(interaction: ModalSubmitInteraction) {
        console.log(interaction.customId)
        const [, did, sr, ss] = interaction.customId.split(',')
        const discord_id: Snowflake = did;
        const selected_rules: number[] = sr.split(':').map((x) => parseInt(x));
        const [selected_sanction, selected_sanction_duration] = ss.split(':');
        const comment = interaction.fields.getTextInputValue('comment')
        const public_comment = interaction.fields.getTextInputValue('public_comment')

        await ORM.get().transaction(async (t) => {
            const action = await Action.create({
                discordId: discord_id,
                moderatorId: interaction.user.id,
                type: selected_sanction as ActionType,
                until: new Date(Date.now() + parseInt(selected_sanction_duration) * 1000),
                comment: comment,
                publicComment: public_comment
            }, { transaction: t });
            await action.setRules(selected_rules, { transaction: t });
        });

        const rules = await Rule.findAll({ where: { id: selected_rules } });

        await interaction.reply({ content: 'done.', ephemeral: true });

        const channel = await interaction.client.channels.fetch(SoftConfig.get('moderate.logchannel', ''));
        const user = await interaction.client.users.fetch(discord_id);
        const moderator = interaction.user;
        let error = false;

        try {
            await user.send({
                content:
                    `Un message que vous avez envoyé sur un des serveurs Omega vous a valu la sanction suivante: ${(sanctions as any)[ss] ?? '????'}\n` +
                    `Cette sanction est appliquée au titre de la / des règle(s) suivante(s):\n` +
                    `${'```\n'}${rules.map((value: Rule) => `${value.identifier}. ${value.content}`).join('\n')}${'\n```'}\n` +
                    `Commentaire de la modération:\n` +
                    (public_comment.length === 0 ? '*Pas de commentaire*' : (public_comment.split('\n').map((v) => '> ' + v).join('\n'))) + '\n' +
                    `Pour toute plainte ou contestation, veuillez contacter @Quentin#0793.`
            });
        } catch (e: any) { error = true }

        if (channel?.isText()) {
            await channel.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Mod Action")
                        .setDescription(`L'utilisateur <@${user.id}> (${user.id}) a été sanctionné.\n**Sanction:** ${(sanctions as any)[ss] ?? '????'}`)
                        .addField("Règle(s) concernée(s)", `${'```\n'}${rules.map((value: Rule) => `${value.identifier}. ${value.content}`).join('\n')}${'\n```'}`)
                        .addField("Commentaire", public_comment.length === 0 ? '*Pas de commentaire*' : comment.split('\n').map((v) => '> ' + v).join('\n'))
                        .addField("Commentaire publique", public_comment.length === 0 ? '*Pas de commentaire*' : public_comment.split('\n').map((v) => '> ' + v).join('\n'))
                        .addFields(error ? [
                            {
                                name: "Erreur",
                                value: "Impossible de DM l'utilisateur"
                            }
                        ]: [])
                        .setAuthor({
                            name: moderator.tag,
                            iconURL: moderator.avatarURL() ?? undefined,
                            url: `https://discord.com/channels/@me/${moderator.id}`
                        })
                        .setColor('#bd3437')
                ]
            });
        }

        for (const guildid of SoftConfig.get('moderate.servers', '').split(',')) {
            const guild = await interaction.client.guilds.fetch(guildid);

            switch (selected_sanction as ActionType) {
                case "ban":
                    await guild.bans.create(user.id, { reason: public_comment });
                    break;
                case "kick":
                    try {
                        const member = await guild.members.fetch(user.id);
                        await member.kick(public_comment);
                    } catch (e: any) { }
                    break;
                case "to":
                    try {
                        const member = await guild.members.fetch(user.id);
                        await member.timeout(parseInt(selected_sanction_duration) * 1000, public_comment);
                    } catch (e: any) {
                        await guild.bans.create(user.id, { reason: public_comment });
                    }
                    break;
                default:
                    break;
            }
        }

    }

    async submitButton(interaction: ButtonInteraction) {
        console.log(interaction.customId)
        const [, did, sr, ss] = interaction.customId.split(',')

        const discord_id: Snowflake = did;
        const selected_rules: number[] = sr.split(':').map((x) => parseInt(x));
        const selected_sanction: string = ss;

        await interaction.showModal(new Modal()
            .addComponents(
                new MessageActionRow<ModalActionRowComponent>().addComponents(
                    new TextInputComponent()
                        .setCustomId('comment')
                        .setLabel(I18n.getI18n('context_menu.moderate.modal.comment', interaction))
                        .setStyle(TextInputStyles.PARAGRAPH)
                        .setMaxLength(128)
                ),
                new MessageActionRow<ModalActionRowComponent>().addComponents(
                    new TextInputComponent()
                        .setCustomId('public_comment')
                        .setLabel(I18n.getI18n('context_menu.moderate.modal.public_comment', interaction))
                        .setStyle(TextInputStyles.PARAGRAPH)
                        .setMaxLength(128)
                ),
            )
            .setCustomId(`cmm,${discord_id},${selected_rules?.join(':') ?? ''},${selected_sanction ?? ''}`)
            .setTitle(I18n.getI18n('context_menu.moderate.modal.title', interaction))
        );
    }

    async ruleChanged(interaction: SelectMenuInteraction) {
        console.log(interaction.customId)
        await interaction.deferUpdate();
        const [, did, , ss] = interaction.customId.split(',')

        const discord_id: Snowflake = did;
        const selected_rules: number[] = interaction.values.map((x) => parseInt(x));
        const selected_sanction: string = ss;

        await interaction.editReply(await this.generateReply(interaction.locale, discord_id, selected_rules, selected_sanction));
    }

    async sanctionChanged(interaction: SelectMenuInteraction) {
        console.log(interaction.customId)
        await interaction.deferUpdate();
        const [, did, sr,] = interaction.customId.split(',')

        const discord_id: Snowflake = did;
        const selected_rules: number[] = sr.split(':').map((x) => parseInt(x));
        const selected_sanction: string = interaction.values[0];

        await interaction.editReply(await this.generateReply(interaction.locale, discord_id, selected_rules, selected_sanction));
    }

    async execute(interaction: UserContextMenuInteraction) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(await this.generateReply(interaction.locale, interaction.targetUser.id));
    }
}