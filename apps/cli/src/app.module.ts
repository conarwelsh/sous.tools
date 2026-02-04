import { Module } from '@nestjs/common';
import { DevCommand } from './commands/dev/dev.command';
import { InstallCommand } from './commands/dev/install.command';
import { ShellInstallCommand } from './commands/dev/shell-install.command';
import { SyncCommand } from './commands/dev/sync.command';
import { EnvCommand } from './commands/env/env.command';
import { ConfigCommand } from './commands/env/config/config.command';
import { ConfigAddCommand } from './commands/env/config/config-add.command';
import { LogsCommand } from './commands/env/logs/logs.command';
import { LogsTailCommand } from './commands/env/logs/logs-tail.command';
import { LogsWipeCommand } from './commands/env/logs/logs-wipe.command';
import { QualityCommand } from './commands/quality/quality.command';
import { TestCommand } from './commands/quality/test/test.command';
import { CheckCommand } from './commands/quality/check/check.command';
import { MaintenanceCommand } from './commands/maintenance/maintenance.command';
import { HousekeepCommand } from './commands/maintenance/housekeep/housekeep.command';
import { ProcessManager } from './commands/dev/process-manager.service';

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
