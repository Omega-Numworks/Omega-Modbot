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

import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { Command } from '../base/Command';
import { I18n } from '../utils/I18n';
import { OMEGA_MODBOT_DEV, OMEGA_MODBOT_HASH, OMEGA_MODBOT_REPOSITORY, OMEGA_MODBOT_VERSION } from '../version';

export class AboutCommand extends Command {
    constructor() {
        super();
    }

    getName() {
        return "about";
    }

    async execute(interaction: CommandInteraction) {
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`**Omega-Modbot ${OMEGA_MODBOT_VERSION}${OMEGA_MODBOT_DEV ? '-dev' : ''} (${OMEGA_MODBOT_HASH})**\n`)
                    .setURL(OMEGA_MODBOT_REPOSITORY)
                    .setThumbnail('attachment://logo.png')
                    .setDescription(I18n.getI18n("command.about.embed.description", I18n.getLang(interaction)))
                    .addFields({
                        name: I18n.getI18n("command.about.embed.license.title", I18n.getLang(interaction)),
                        value: I18n.getI18n("command.about.embed.license.text", I18n.getLang(interaction))
                    })
            ], files: [new MessageAttachment(`doc/logo/logo-transparent${OMEGA_MODBOT_DEV ? '-dev' : ''}.png`, 'logo.png')], ephemeral: true
        });
    }
}
