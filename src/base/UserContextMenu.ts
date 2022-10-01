import { UserContextMenuInteraction } from "discord.js";
import { ContextMenu } from "./ContextMenu";

export class UserContextMenu extends ContextMenu {
    protected constructor() {
        super();
        if (this.constructor === UserContextMenu) {
            throw new TypeError('Abstract class "UserContextMenu" cannot be instantiated directly');
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(interaction: UserContextMenuInteraction): Promise<void> {
        throw new TypeError('Abstract method "execute" of class "UserContextMenu" cannot be used directly');
    }
}