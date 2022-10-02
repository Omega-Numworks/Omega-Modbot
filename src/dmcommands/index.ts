// AUTO-GENERATED
// Run "yarn craft gen:index" to update

import { DMCommand } from "../base/DMCommand";
import { ActivityClearDMCommand } from "./ActivityClearDMCommand";
import { ActivityDMCommand } from "./ActivityDMCommand";
import { ConfigGetDMCommand } from "./ConfigGetDMCommand";
import { ConfigListDMCommand } from "./ConfigListDMCommand";
import { ConfigReloadDMCommand } from "./ConfigReloadDMCommand";
import { ConfigSetDMCommand } from "./ConfigSetDMCommand";
import { ConfigUnsetDMCommand } from "./ConfigUnsetDMCommand";
import { HelpDMCommand } from "./HelpDMCommand";
import { StatusDMCommand } from "./StatusDMCommand";

export const dmcommands: { new(): DMCommand }[] = [
    ActivityClearDMCommand,
    ActivityDMCommand,
    ConfigGetDMCommand,
    ConfigListDMCommand,
    ConfigReloadDMCommand,
    ConfigSetDMCommand,
    ConfigUnsetDMCommand,
    HelpDMCommand,
    StatusDMCommand
];
