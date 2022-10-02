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

import { readdir, writeFile } from "fs/promises";
import { join } from "path";
import { ConsoleCommand } from "../base/ConsoleCommand";
import { Log, Logger } from "../utils/Logger";

export class GenEntitiesConsoleCommand extends ConsoleCommand {
    private logger: Log;

    constructor() {
        super();
        this.logger = Logger.getLogger("Refresh");
    }

    getName(): string {
        return "gen:entities";
    }

    getDescription(): string {
        return "Regenerates the entities index.ts files.";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(args: string[]): Promise<void> {
        const classes: string[] = [];
        for (const file of await readdir("src/entities")) {
            if (file.endsWith('.ts') && file !== "index.ts") {
                classes.push(file.slice(0, -3));
            }
        }

        const content = `// AUTO-GENERATED
// Run "yarn craft gen:entities" to update

import { Model, Sequelize } from 'sequelize';

${classes.map((n: string) => `import { ${n}, init${n}, associate${n} } from "./${n}";`).join("\n")}

export const initEntities = (sequelize: Sequelize) => {
    ${classes.map((n: string) => `init${n}(sequelize);`).join("\n")}
};

export const associateEntities = (sequelize: Sequelize) => {
    ${classes.map((n: string) => `associate${n}(sequelize);`).join("\n")}
}

export const models: { new(): Model }[] = [
${classes.map((n: string) => `    ${n}`).join(",\n")}
];
`;
        this.logger.info(`Writing "${join("src/entities/index.ts")}"`);
        await writeFile(join("src/entities/index.ts"), content);
    }
}
