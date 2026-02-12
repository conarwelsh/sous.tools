import { Module } from '@nestjs/common';
import { DevToolsCommand } from './commands/dev/dev-tools.command.js';
import { InstallCommand } from './commands/dev/install.command.js';
import { KillCommand } from './commands/dev/kill.command.js';
import { ShellInstallCommand } from './commands/dev/shell-install.command.js';
import { SyncCommand } from './commands/dev/sync.command.js';
import { EnvCommand } from './commands/env/env.command.js';
import { ConfigCommand } from './commands/env/config/config.command.js';
import { ConfigAddCommand } from './commands/env/config/config-add.command.js';
import { ConfigListCommand } from './commands/env/config/config-list.command.js';
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
import { RemoteResetCommand } from './commands/maintenance/db/remote-reset.command.js';
import { SeedCommand } from './commands/maintenance/db/seed.command.js';
import { BrandingCommand } from './commands/env/branding/branding.command.js';
import { WorkspaceCommand } from './commands/workspace.command.js';
import { DashboardCommand } from './commands/env/dashboard.command.js';
import { ContextCommand } from './commands/env/context/context.command.js';
import { WhoamiCommand } from './commands/env/context/whoami.command.js';
import { SwitchEnvCommand } from './commands/env/context/switch-env.command.js';
import { HardwareCommand } from './commands/hardware/hardware.command.js';
import { HardwareListCommand } from './commands/hardware/hardware-list.command.js';
import { IntelCommand } from './commands/intel/intel.command.js';
import { IntelCostCommand } from './commands/intel/intel-cost.command.js';
import { IntegrationsCommand } from './commands/integrations/integrations.command.js';
import { IntegrationsSyncCommand } from './commands/integrations/sync.command.js';
import { ProcessManager } from './commands/dev/process-manager.service.js';

@Module({
  providers: [
    ProcessManager,
    DevToolsCommand,
    InstallCommand,
    KillCommand,
    ShellInstallCommand,
    SyncCommand,
    EnvCommand,
    ConfigCommand,
    ConfigAddCommand,
    ConfigListCommand,
    LogsCommand,
    LogsTailCommand,
    LogsWipeCommand,
    BrandingCommand,
    DashboardCommand,
    ContextCommand,
    WhoamiCommand,
    SwitchEnvCommand,
    HardwareCommand,
    HardwareListCommand,
    IntelCommand,
    IntelCostCommand,
    IntegrationsCommand,
    IntegrationsSyncCommand,
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
    RemoteResetCommand,
    SeedCommand,
    WorkspaceCommand,
  ],
})
export class AppModule {}
