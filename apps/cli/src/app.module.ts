import { Module } from '@nestjs/common';
import { DevCommand } from './commands/dev/dev.command';
import { InstallCommand } from './commands/install/install.command';
import { SyncCommand } from './commands/sync/sync.command';
import { ConfigCommand } from './commands/config/config.command';
import { ConfigAddCommand } from './commands/config/config-add.command';
import { LogsCommand } from './commands/logs/logs.command';
import { LogsTailCommand } from './commands/logs/logs-tail.command';
import { LogsWipeCommand } from './commands/logs/logs-wipe.command';
import { TestCommand } from './commands/test/test.command';
import { CheckCommand } from './commands/check/check.command';
import { HousekeepCommand } from './commands/housekeep/housekeep.command';

@Module({
  providers: [
    DevCommand, 
    InstallCommand, 
    SyncCommand, 
    ConfigCommand, 
    ConfigAddCommand,
    LogsCommand,
    LogsTailCommand,
    LogsWipeCommand,
    TestCommand,
    CheckCommand,
    HousekeepCommand
  ],
})
export class AppModule {}