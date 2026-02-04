import { Module } from '@nestjs/common';
import { DevCommand } from './commands/dev/dev.command.js';
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
import { ProcessManager } from './commands/dev/process-manager.service.js';

@Module({
  providers: [
    ProcessManager,
    DevCommand,
    InstallCommand,
    ShellInstallCommand,
    SyncCommand,
    EnvCommand,
    ConfigCommand,
    ConfigAddCommand,
    LogsCommand,
    LogsTailCommand,
    LogsWipeCommand,
    QualityCommand,
    TestCommand,
    CheckCommand,
    MaintenanceCommand,
    HousekeepCommand,
  ],
})
export class AppModule {}