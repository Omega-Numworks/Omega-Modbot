import { MessageContextMenuInteraction } from "discord.js";
import { ContextMenu } from "./ContextMenu";

export class MessageContextMenu extends ContextMenu {
    protected constructor() {
        super();
        if (this.constructor === MessageContextMenu) {
            throw new TypeError('Abstract class "MessageContextMenu" cannot be instantiated directly');
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(interaction: MessageContextMenuInteraction): Promise<void> {
        throw new TypeError('Abstract method "execute" of class "MessageContextMenu" cannot be used directly');
    }
}
