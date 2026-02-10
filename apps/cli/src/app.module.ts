import { Module } from '@nestjs/common';
import { DevToolsCommand } from './commands/dev/dev-tools.command.js';
import { InstallCommand } from './commands/dev/install.command.js';
import { ShellInstallCommand } from './commands/dev/shell-install.command.js';
import { SyncCommand } from './commands/dev/sync.command.js';
import { EnvCommand } from './commands/env/env.command.js';
import { ConfigCommand } from './commands/env/config/config.command.js';
import { ConfigAddCommand } from './commands/env/config/config-add.command.js';
import { LogsCommand } from './commands/env/logs/logs.command.js';
import { LogsTailCommand } from './commands/env/logs/logs-tail.command.js';
import { LogsWipeCommand } from './commands/env/logs/logs-wipe.command.js';
import { QualityCommand } from './commands/quality/quality.command.js';
import { TestCommand } from './commands/quality/test/test.command.js';
import { CheckCommand } from './commands/quality/check/check.command.js';
import { MaintenanceCommand } from './commands/maintenance/maintenance.command.js';
import { HousekeepCommand } from './commands/maintenance/housekeep/housekeep.command.js';
import { DbCommand } from './commands/maintenance/db/db.command.js';
import { DbPushCommand } from './commands/maintenance/db/db-push.command.js';
import { DbUpCommand } from './commands/maintenance/db/db-up.command.js';
import { DbDownCommand } from './commands/maintenance/db/db-down.command.js';
import { DbResetCommand } from './commands/maintenance/db/db-reset.command.js';
import { SeedCommand } from './commands/maintenance/db/seed.command.js';
import { BrandingCommand } from './commands/env/branding/branding.command.js';
import { WorkspaceCommand } from './commands/workspace.command.js';
import { ProcessManager } from './commands/dev/process-manager.service.js';

@Module({
  providers: [
    ProcessManager,
    DevToolsCommand,
    InstallCommand,
    ShellInstallCommand,
    SyncCommand,
    EnvCommand,
    ConfigCommand,
    ConfigAddCommand,
    LogsCommand,
    LogsTailCommand,
    LogsWipeCommand,
    BrandingCommand,
    QualityCommand,
    TestCommand,
    CheckCommand,
    MaintenanceCommand,
    HousekeepCommand,
    DbCommand,
    DbPushCommand,
    DbUpCommand,
    DbDownCommand,
    DbResetCommand,
    SeedCommand,
    WorkspaceCommand,
  ],
})
export class AppModule {}
