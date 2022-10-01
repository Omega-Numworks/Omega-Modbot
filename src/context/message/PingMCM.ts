import { MessageContextMenuInteraction } from "discord.js";
import { MessageContextMenu } from "../../base/MessageContextMenu";
import { I18n } from "../../utils/I18n";


export class PingMCM extends MessageContextMenu {
    constructor() {
        super();
    }
    
    getName() {
        return "ping";
    }

    isDevCommand() {
        return true;
    }

    async execute(interaction: MessageContextMenuInteraction) {
        interaction.reply({ content: I18n.getI18n('command.ping.pong', I18n.getLang(interaction)), ephemeral: true });
    }
}