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

import { Bot } from './Bot';
import { HardConfig } from './config/HardConfig';
import { ServerConfig } from './config/ServerConfig';
import { SoftConfig } from './config/SoftConfig';
import { UptimeRobot } from './UptimeRobot';
import { Logger } from './utils/Logger';
import { ORM } from './utils/ORM';
import { OMEGA_MODBOT_DEV, OMEGA_MODBOT_HASH, OMEGA_MODBOT_VERSION } from './version';

export const main = async () => {
    Logger.getLogger('Main').info(`Starting Omega-Modbot ${OMEGA_MODBOT_VERSION}${OMEGA_MODBOT_DEV ? '-dev' : ''} (${OMEGA_MODBOT_HASH})`);
    if (OMEGA_MODBOT_DEV)
        Logger.getLogger('Main').warn("This is a developpement build of Omega-Modbot!");

    SoftConfig.load();
    ServerConfig.load();

    if (HardConfig.isUptimeRobotEnabled()) {
        const ur = new UptimeRobot();
        ur.start();
    }

    await ORM.init();
    await Bot.initClient();
    Bot.start();
};
