import { UserContextMenuInteraction } from "discord.js";
import { UserContextMenu } from "../../base/UserContextMenu";
import { I18n } from "../../utils/I18n";


export class PingUCM extends UserContextMenu {
    constructor() {
        super();
    }
    
    getName() {
        return "ping";
    }

    isDevCommand() {
        return true;
    }

    async execute(interaction: UserContextMenuInteraction) {
        interaction.reply({ content: I18n.getI18n('command.ping.pong', I18n.getLang(interaction)), ephemeral: true });
    }
}