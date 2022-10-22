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

import { ButtonInteraction, EmojiIdentifierResolvable, MessageButton, MessageButtonStyleResolvable } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { I18n } from "../utils/I18n";
import { Button } from "./../base/Button";

export type RoleButtonConfig = {
    label?: string,
    emoji?: EmojiIdentifierResolvable,
    style?: MessageButtonStyleResolvable
};

export class RoleButton extends Button {

    constructor() {
        super();
    }

    getID(): string {
        return "global_role";
    }

    async execute(interaction: ButtonInteraction): Promise<void> {
        const [, role_id] = interaction.customId.split(",");
        if (interaction.guild == null) {
            await interaction.reply({content: "Bro tu m'expliques comment t'as fais ça en dm ???", ephemeral: true});
            return;
        }

        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (member.roles.cache.find(r => r.id == role_id)) {
            await member.roles.remove(role_id);
            await interaction.reply({
                ephemeral: true,
                content: I18n.getI18n('roles.added', interaction.locale)
            });
        } else {
            await member.roles.add(role_id);
            await interaction.reply({
                ephemeral: true,
                content: I18n.getI18n('roles.removed', interaction.locale)
            });
        }
    }

    static generate(role_id: string, config?: RoleButtonConfig): MessageButton {
        const b = new MessageButton().setCustomId(`global_role,${role_id}`)

        if (config !== undefined) {
            if (config.emoji !== undefined)
                b.setEmoji(config.emoji);
            if (config.label !== undefined)
                b.setLabel(config.label)
            if (config.style !== undefined)
                b.setStyle(config.style)
            else
                b.setStyle(MessageButtonStyles.SECONDARY);

            if (config.label === undefined && config.emoji === undefined) {
                b.setLabel("???");
            }
        }

        return b;
    }
}