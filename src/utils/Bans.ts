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

import sequelize, { Op } from 'sequelize';
import { Bot } from '../Bot';
import { SoftConfig } from '../config/SoftConfig';
import { Action } from '../entities/Action';
import { Logger } from './Logger';

class BansManager {
    async init() {
        Logger.getLogger('Bans').info("Initializing bans manager...");
        await this.purgeBans();
        setInterval(this.purgeBans.bind(this), 5 * 60 * 1000);
    }

    async purgeBans() {
        const actions = await Action.findAll({
            where: {
                unbanned: false,
                type: ['ban', 'to']
            },
            group: ['discordId'],
            attributes: ['discordId', [sequelize.fn('max', sequelize.col('until')), 'unt']],
            having: {
                unt: {
                    [Op.lte]: new Date()
                }
            }
        });

        for (const action of actions) {
            for (const guildid of SoftConfig.get('moderate.servers', '').split(',')) {
                const guild = await Bot.getClient().guilds.fetch(guildid);
                try {
                    await guild.bans.remove(action.discordId);
                } catch (e: any) {
                    // Ignore error
                }
            }

            try {
                const user = await Bot.getClient().users.fetch(action.discordId);
                await user.send("Toutes vos sanctions en cours ont expiré.");
            } catch (e: any) {
                // Ignore error
            }

            await Action.update({
                unbanned: true
            }, {
                where: {
                    discordId: action.discordId,
                    type: ['ban', 'to']
                }
            });
        }
    }
}

export const Bans = new BansManager();
