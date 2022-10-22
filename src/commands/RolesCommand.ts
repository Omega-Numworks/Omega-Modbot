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

import { CommandInteraction, MessageActionRow, Permissions } from 'discord.js';
import { Command } from '../base/Command';
import { RoleButton } from '../components/RoleButton';

export class RolesCommand extends Command {
    constructor() {
        super();
    }

    getName() {
        return "genroles";
    }

    getNeededPermissions(): bigint | null {
        return Permissions.FLAGS.ADMINISTRATOR
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        await interaction.channel?.send({
            content:
                "🇺🇸  **EN** Welcome to <#673562029092503573>, please make your selection.\n" +
                "🇫🇷  **FR** Bienvenue dans <#673562029092503573>, veuillez sélectionner les rôles qui vous correspondent.\n" +
                "\n" +
                "\n" +
                "🇺🇸  **EN** Select the language(s) you are comfortable with (**REQUIRED**)\n" +
                "🇫🇷  **FR** Sélectionnez la ou les langues avec lesquelles vous êtes à l'aise (**REQUIS**)",
            components: [new MessageActionRow().addComponents(
                RoleButton.generate("668202114547449860", { label: "FR", emoji: "🇫🇷" }),
                RoleButton.generate("668201921089241101", { label: "EN", emoji: "🇺🇸" }),
                RoleButton.generate("673568944149495845", { label: "DE", emoji: "🇩🇪" }),
                RoleButton.generate("668442095077425183", { label: "NL", emoji: "🇳🇱" }),
            )]
        });
        await interaction.channel?.send({
            content:
                "🇺🇸 **EN** Select the Numworks model(s) you have (**written on the back of the calculator**) (**REQUIRED IF YOU HAVE ONE**)\n" +
                "🇫🇷 **FR** Sélectionnez le ou les modèles de Numworks que vous avez (**écrit au dos de la calculatrice**) (**REQUIS SI VOUS EN AVEZ**)",
            components: [new MessageActionRow().addComponents(
                RoleButton.generate("673570841195184188", { label: "N0100" }),
                RoleButton.generate("673570866767986729", { label: "N0110" }),
                RoleButton.generate("1033277781183836190", { label: "N0120" }),
            )]
        });
        await interaction.channel?.send({
            content:
                "🇺🇸 **EN** Select your operating system(s) (**REQUIRED**)\n" +
                "🇫🇷 **FR** Sélectionnez votre ou vos systèmes d'exploitation (**REQUIS**)",
            components: [new MessageActionRow().addComponents(
                RoleButton.generate("725110868420984834", { label: "Windows" }),
                RoleButton.generate("725110901098807468", { label: "macOS" }),
                RoleButton.generate("725110927422390352", { label: "Linux" }),
            )]
        });
        await interaction.channel?.send({
            content:
                "🇺🇸 **EN** Subscribe to the Omega notifications (to be notified of updates; **RECOMMENDED**)\n" +
                "🇫🇷 **FR** S'inscrire aux notifications Omega (pour être notifié des mises à jour ; **RECOMMANDÉ**)",
            components: [new MessageActionRow().addComponents(
                RoleButton.generate("780123038976573461", { label: "Notifications FR", emoji: "🇫🇷" }),
                RoleButton.generate("780126326887546891", { label: "Notifications EN", emoji: "🇺🇸" }),
            )]
        });
        await interaction.channel?.send({
            content:
                "🇺🇸 **EN** Subscribe to the GitHub notifications (**OPTIONAL**)\n" +
                "🇫🇷 **FR** S'inscrire aux notifications GitHub (**FACULTATIF**)",
            components: [new MessageActionRow().addComponents(
                RoleButton.generate("683258187918344230", { label: "GitHub Basic", emoji: "☑️" }),
                RoleButton.generate("683259098841743392", { label: "GitHub Advanced", emoji: "✅" }),
            )]
        });

        await interaction.editReply("Good");
    }
}
