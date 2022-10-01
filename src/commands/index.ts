// AUTO-GENERATED
// Run "yarn craft gen:index" to update

import { Command } from "../base/Command";
import { AboutCommand } from "./AboutCommand";
import { ConfigCommand } from "./ConfigCommand";
import { PingCommand } from "./PingCommand";

export const commands: { new(): Command }[] = [
    AboutCommand,
    ConfigCommand,
    PingCommand
];
