/**
 * Copyright © 2022 Maxime Friess <M4x1me@pm.me>
 * 
 * This file is part of Omega-Modbot.
 * 
 * Omega-Modbot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Omega-Modbot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Omega-Modbot.  If not, see <https://www.gnu.org/licenses/>.
 */

import { REST } from '@discordjs/rest';
import { ApplicationCommandType, RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v9';
import { ButtonInteraction, Client, CommandInteraction, DMChannel, Interaction, Message, MessageContextMenuInteraction, ModalSubmitInteraction, SelectMenuInteraction, UserContextMenuInteraction } from 'discord.js';
import { Command } from './base/Command';
import { DMCommand } from './base/DMCommand';
import { MessageContextMenu } from './base/MessageContextMenu';
import { UserContextMenu } from './base/UserContextMenu';
import { commands } from './commands';
import { components } from './components';
import { HardConfig } from './config/HardConfig';
import { SoftConfig } from './config/SoftConfig';
import { message_contexts } from './context/message';
import { user_contexts } from './context/user';
import { dmcommands } from './dmcommands';
import { Bans } from './utils/Bans';
import { I18n } from './utils/I18n';
import { Log, Logger } from './utils/Logger';

class BotManager {
    private logger: Log;
    private token: string;
    private commands: { [name: string]: Command };
    private user_contexts: { [name: string]: UserContextMenu };
    private message_contexts: { [name: string]: MessageContextMenu };
    private buttons: { [custom_id: string]: (interaction: ButtonInteraction) => void };
    private selects: { [custom_id: string]: (interaction: SelectMenuInteraction) => void };
    private modals: { [custom_id: string]: (interaction: ModalSubmitInteraction) => void };
    private dmcommands: { [name: string]: DMCommand };
    private rest: REST;
    private client?: Client;

    constructor() {
        this.logger = Logger.getLogger("Bot");
        this.token = HardConfig.getBotToken();
        this.commands = {};
        this.user_contexts = {};
        this.message_contexts = {};
        this.buttons = {};
        this.selects = {};
        this.modals = {};
        this.dmcommands = {};
        this.rest = new REST({ version: '9' }).setToken(this.token);
    }

    public getDMCommands() {
        return this.dmcommands;
    }

    private async loadComponents() {
        this.logger.info("Loading components...");

        for (const ccomponent of components) {
            const component = new ccomponent();

            if (component.getType() === 'button') {
                this.registerButton(component.getID(), component.execute);
            } else if (component.getType() === 'select') {
                this.registerSelect(component.getID(), component.execute);
            }

            for (const o of component.getConfigs()) {
                SoftConfig.registerConfig(o);
            }
        }
    }

    private async loadDMCommands() {
        this.logger.info("Loading dm commands...");

        for (const cdmcommand of dmcommands) {
            const dmcommand = new cdmcommand();
            this.logger.info("Loading dm command " + dmcommand.getName());
            this.dmcommands[dmcommand.getName()] = dmcommand;
            for (const o of dmcommand.getConfigs()) {
                SoftConfig.registerConfig(o);
            }
        }
    }

    async loadCommands() {
        this.logger.info("Loading slash commands...");

        for (const ccommand of commands) {
            const command = new ccommand();
            this.logger.info("Loading command " + command.getName());
            this.commands[command.getName()] = command;
            for (const o of command.getConfigs()) {
                SoftConfig.registerConfig(o);
            }
        }
    }

    async loadContextMenu() {
        this.logger.info("Loading context menu actions...");

        for (const cuser_context of user_contexts) {
            const user_context = new cuser_context();
            this.logger.info("Loading user context menu action " + user_context.getName());
            this.user_contexts[user_context.getName()] = user_context;
            for (const o of user_context.getConfigs()) {
                SoftConfig.registerConfig(o);
            }
        }

        for (const cmessage_context of message_contexts) {
            const message_context = new cmessage_context();
            this.logger.info("Loading message context menu action " + message_context.getName());
            this.message_contexts[message_context.getName()] = message_context;
            for (const o of message_context.getConfigs()) {
                SoftConfig.registerConfig(o);
            }
        }
    }

    async registerCommands(guilds_id: string[]) {
        await this.loadDMCommands();
        await this.loadCommands();
        await this.loadContextMenu();
        await this.loadComponents();

        const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

        for (const i in this.commands) {
            if (this.commands[i].isDevCommand() && HardConfig.getDev() || !this.commands[i].isDevCommand()) {
                commands.push({
                    type: ApplicationCommandType.ChatInput,
                    name: this.commands[i].getName(),
                    name_localizations: I18n.getI18nDict(this.commands[i].getI18nName()),
                    description: I18n.getI18n(this.commands[i].getI18nDescription()),
                    description_localizations: I18n.getI18nDict(this.commands[i].getI18nDescription()),
                    options: this.commands[i].getOptions(),
                    default_member_permissions: this.commands[i].getNeededPermissions()?.toString() ?? null,
                    dm_permission: this.commands[i].getDMPermission()
                });
            }
        }

        for (const i in this.user_contexts) {
            if (this.user_contexts[i].isDevCommand() && HardConfig.getDev() || !this.user_contexts[i].isDevCommand()) {
                commands.push({
                    type: ApplicationCommandType.User,
                    name: this.user_contexts[i].getName(),
                    name_localizations: I18n.getI18nDict(this.user_contexts[i].getI18nName()),
                    default_member_permissions: this.user_contexts[i].getNeededPermissions()?.toString() ?? null,
                    dm_permission: this.user_contexts[i].getDMPermission()
                });
            }
        }

        for (const i in this.message_contexts) {
            if (this.message_contexts[i].isDevCommand() && HardConfig.getDev() || !this.message_contexts[i].isDevCommand()) {
                commands.push({
                    type: ApplicationCommandType.Message,
                    name: this.message_contexts[i].getName(),
                    name_localizations: I18n.getI18nDict(this.message_contexts[i].getI18nName()),
                    default_member_permissions: this.message_contexts[i].getNeededPermissions()?.toString() ?? null,
                    dm_permission: this.message_contexts[i].getDMPermission()
                });
            }
        }

        // We are in DEV mode, register commands per guilds
        if (HardConfig.getDev()) {
            for (const guild_id of guilds_id) {
                try {
                    this.logger.info("Registering commands on guild " + guild_id + "!");
                    await this.rest.put(Routes.applicationGuildCommands(HardConfig.getBotAppID(), guild_id), { body: commands });
                } catch (e: any) {
                    this.logger.error("Error while registering bot commands on server " + guild_id + "!", e as Error);
                }
            }
            // We are not in DEV mode, register commands globally
        } else {
            await this.rest.put(Routes.applicationCommands(HardConfig.getBotAppID()), { body: commands });
        }
    }

    async onReady() {
        this.logger.info("Registering bot commands...");
        const guilds_id = this.client?.guilds.cache.map(g => g.id) ?? [];
        await this.registerCommands(guilds_id);

        this.logger.info("Logged in as " + this?.client?.user?.tag + ".");
        await Bans.init();
    }

    async onMessage(message: Message) {
        if (!(message.channel instanceof DMChannel))
            return;

        try {
            if (message.partial) {
                message = await message.fetch();
            }
        } catch (e: any) {
            this.logger.error("Error when retrieving partial message", e as Error);
        }

        for (const [name, command] of Object.entries(this.dmcommands)) {
            if (message.content.startsWith(name)) {
                try {
                    if (command.isReservedToGod() && !HardConfig.getDiscordGods().includes(message.author.id)) {
                        return;
                    }

                    if (command.getCommandRegex().test(message.content)) {
                        await command.execute(message, message.content, command.getCommandRegex().exec(message.content) ?? []);
                    } else {
                        message.reply("Usage: `" + command.getUsage() + "`");
                    }
                } catch (e: any) {
                    this.logger.error("Error when handling DM command \"" + name + "\"", e as Error);
                    try {
                        message.reply("Une erreur est survenue lors du traitement de votre commande.");
                    } catch (e: any) {
                        this.logger.error("Error when handling error of dm command \"" + name + "\"", e as Error);
                    }
                }
                break;
            }
        }
    }

    async onInteraction(interaction: Interaction) {
        if (interaction.isCommand()) {
            if (this.commands[interaction.commandName] !== undefined) {
                if (this.commands[interaction.commandName].isReservedToGod()) {
                    if (!HardConfig.getDiscordGods().includes(interaction.user.id)) {
                        interaction.reply({ content: I18n.getI18n('bot.error.god', interaction.locale), ephemeral: true });
                        return;
                    }
                }

                await this.callWithErrorHandler(this.commands[interaction.commandName].execute.bind(this.commands[interaction.commandName]), interaction, "commande");
            }
        } else if (interaction.isUserContextMenu()) {
            if (this.user_contexts[interaction.commandName] !== undefined) {
                if (this.user_contexts[interaction.commandName].isReservedToGod()) {
                    if (!HardConfig.getDiscordGods().includes(interaction.user.id)) {
                        interaction.reply({ content: I18n.getI18n('bot.error.god', interaction.locale), ephemeral: true });
                        return;
                    }
                }

                await this.callWithErrorHandler(this.user_contexts[interaction.commandName].execute.bind(this.user_contexts[interaction.commandName]), interaction, "action utilisateur");
            }
        } else if (interaction.isMessageContextMenu()) {
            if (this.message_contexts[interaction.commandName] !== undefined) {
                if (this.message_contexts[interaction.commandName].isReservedToGod()) {
                    if (!HardConfig.getDiscordGods().includes(interaction.user.id)) {
                        interaction.reply({ content: I18n.getI18n('bot.error.god', interaction.locale), ephemeral: true });
                        return;
                    }
                }

                await this.callWithErrorHandler(this.message_contexts[interaction.commandName].execute.bind(this.message_contexts[interaction.commandName]), interaction, "action message");
            }
        } else if (interaction.isButton()) {
            if (this.buttons[interaction.customId.split(",")[0]] !== undefined) {
                await this.callWithErrorHandler(this.buttons[interaction.customId.split(",")[0]].bind(this.buttons[interaction.customId.split(",")[0]]), interaction, "boutton");
            }
        } else if (interaction.isSelectMenu()) {
            if (this.selects[interaction.customId.split(",")[0]] !== undefined) {
                await this.callWithErrorHandler(this.selects[interaction.customId.split(",")[0]].bind(this.selects[interaction.customId.split(",")[0]]), interaction, "sélecteur");
            }
        } else if (interaction.isModalSubmit()) {
            if (this.modals[interaction.customId.split(",")[0]] !== undefined) {
                await this.callWithErrorHandler(this.modals[interaction.customId.split(",")[0]].bind(this.modals[interaction.customId.split(",")[0]]), interaction, "modal");
            }
        }
    }

    async callWithErrorHandler<T extends CommandInteraction | ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction | UserContextMenuInteraction | MessageContextMenuInteraction>(fnc: (interaction: T) => void, interaction: T, type: string) {
        try {
            await fnc(interaction);
        } catch (e: any) {
            const name = (interaction instanceof CommandInteraction || interaction instanceof UserContextMenuInteraction || interaction instanceof MessageContextMenuInteraction) ? interaction.commandName : interaction.customId.split(",")[0];

            this.logger.error("Error when handling " + type + " \"" + name + "\"", e as Error);
            try {
                if (interaction.deferred)
                    await interaction.editReply({ content: I18n.formatI18n('bot.error', interaction.locale, { type }) });
                else
                    await interaction.reply({ content: I18n.formatI18n('bot.error', interaction.locale, { type }), ephemeral: true });
            } catch (e: any) {
                this.logger.error("Error when handling error of " + type + " \"" + name + "\"", e as Error);
            }
        }
    }

    async initClient() {
        this.client = new Client({ intents: ["DIRECT_MESSAGES", "GUILD_VOICE_STATES", "GUILDS"], partials: ['CHANNEL'] });

        this.client.on('ready', this.onReady.bind(this));
        this.client.on('interactionCreate', this.onInteraction.bind(this));
        this.client.on('messageCreate', this.onMessage.bind(this));
    }

    public getClient(): Client {
        return this.client as Client;
    }

    start() {
        this.client?.login(HardConfig.getBotToken());
    }

    registerButton(customId: string, handler: (interaction: ButtonInteraction) => void) {
        this.logger.info("Registering button " + customId);
        this.buttons[customId] = handler;
    }

    registerSelect(customId: string, handler: (interaction: SelectMenuInteraction) => void) {
        this.logger.info("Registering select " + customId);
        this.selects[customId] = handler;
    }

    registerModal(customId: string, handler: (interaction: ModalSubmitInteraction) => void) {
        this.logger.info("Registering modal " + customId);
        this.modals[customId] = handler;
    }
}

export const Bot = new BotManager();
