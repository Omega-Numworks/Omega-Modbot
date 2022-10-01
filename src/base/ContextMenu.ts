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

import { I18nKey } from "../utils/I18n";

export class ContextMenu {
    protected constructor() {
        if (this.constructor === ContextMenu) {
            throw new TypeError('Abstract class "ContextMenu" cannot be instantiated directly');
        }
    }

    getName(): string {
        throw new TypeError('Abstract method "getName" of class "ContextMenu" cannot be used directly');
    }

    getI18nName(): I18nKey {
        return `context_menu.${this.getName()}.name`;
    }

    getConfigs(): string[] {
        return [];
    }

    isReservedToGod(): boolean {
        return false;
    }

    isDevCommand(): boolean {
        return false;
    }

    getNeededPermissions(): bigint | null {
        return null;
    }

    getDMPermission(): boolean {
        return true;
    }
}
