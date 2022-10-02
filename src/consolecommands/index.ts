// AUTO-GENERATED
// Run "yarn craft gen:index" to update

import { ConsoleCommand } from "../base/ConsoleCommand";
import { GenEntitiesConsoleCommand } from "./GenEntitiesConsoleCommand";
import { GenI18nConsoleCommand } from "./GenI18nConsoleCommand";
import { GenIndexConsoleCommand } from "./GenIndexConsoleCommand";
import { GenVersionConsoleCommand } from "./GenVersionConsoleCommand";
import { HelpConsoleCommand } from "./HelpConsoleCommand";
import { PingConsoleCommand } from "./PingConsoleCommand";

export const consolecommands: { new(): ConsoleCommand }[] = [
    GenEntitiesConsoleCommand,
    GenI18nConsoleCommand,
    GenIndexConsoleCommand,
    GenVersionConsoleCommand,
    HelpConsoleCommand,
    PingConsoleCommand
];
