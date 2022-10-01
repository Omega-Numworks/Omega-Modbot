import { ButtonInteraction, MessageActionRow, MessageButton, MessageSelectMenu, MessageSelectOptionData, Modal, ModalActionRowComponent, ModalSubmitInteraction, SelectMenuInteraction, Snowflake, TextInputComponent, UserContextMenuInteraction } from "discord.js";
import { MessageButtonStyles, TextInputStyles } from "discord.js/typings/enums";
import { UserContextMenu } from "../../base/UserContextMenu";
import { Bot } from "../../Bot";
import { Action, ActionType } from "../../entities/Action";
import { Rule } from "../../entities/Rule";
import { I18n } from "../../utils/I18n";

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
    'to:2419200': 'Timeout 1 month',
    'to:4838400': 'Timeout 2 months',
    'to:7257600': 'Timeout 3 months',
    'ban:0': 'Ban'
};

export class ModerateUCM extends UserContextMenu {
    constructor() {
        super();
        Bot.registerSelect('cmr', this.ruleChanged.bind(this));
        Bot.registerSelect('cms', this.sanctionChanged.bind(this));
        Bot.registerButton('cmc', this.submitButton.bind(this))
        Bot.registerModal('cmm', this.submitModal.bind(this))
    }

    getName() {
        return "moderate";
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
        const [, did, sr, ss] = interaction.customId.split(',')
        const discord_id: Snowflake = did;
        const selected_rules: number[] = sr.split(':').map((x) => parseInt(x));
        const [selected_sanction, selected_sanction_duration] = ss.split(':');
        const comment = interaction.fields.getTextInputValue('comment')
        const public_comment = interaction.fields.getTextInputValue('public_comment')

        const action = await Action.create({
            discordId: discord_id,
            moderatorId: interaction.user.id,
            type: selected_sanction as ActionType,
            duration: parseInt(selected_sanction_duration) * 1000,
            comment: comment,
            publicComment: public_comment
        }).catch(e => console.error(e));
        await (action as Action).setRules(selected_rules);
        interaction.reply({content: 'done.'});
    }

    async submitButton(interaction: ButtonInteraction) {
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
        await interaction.deferUpdate();
        const [, did, , ss] = interaction.customId.split(',')

        const discord_id: Snowflake = did;
        const selected_rules: number[] = interaction.values.map((x) => parseInt(x));
        const selected_sanction: string = ss;

        await interaction.editReply(await this.generateReply(interaction.locale, discord_id, selected_rules, selected_sanction));
    }

    async sanctionChanged(interaction: SelectMenuInteraction) {
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