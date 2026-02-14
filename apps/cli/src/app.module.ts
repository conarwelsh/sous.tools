import { Module } from '@nestjs/common';
import { DevToolsCommand } from './commands/dev/dev-tools.command.js';
import { InstallCommand } from './commands/dev/install.command.js';
import { WorkspaceCommand } from './commands/dev/workspace.command.js';
import { SyncCommand } from './commands/dev/sync.command.js';

// IAM
import { IamCommand } from './commands/iam/iam.command.js';
import { WhoamiCommand } from './commands/iam/whoami.command.js';
import { SwitchEnvCommand } from './commands/iam/switch-env.command.js';
import { LoginAsCommand } from './commands/iam/login-as.command.js';
import { LoginCommand } from './commands/iam/login.command.js';
import { LogoutCommand } from './commands/iam/logout.command.js';
import { SwitchOrgCommand } from './commands/iam/switch-org.command.js';

// INFRA
import { DashboardCommand } from './commands/infra/dashboard.command.js';
import { ConfigCommand } from './commands/infra/config/config.command.js';
import { ConfigAddCommand } from './commands/infra/config/config-add.command.js';
import { ConfigListCommand } from './commands/infra/config/config-list.command.js';
import { ConfigViewCommand } from './commands/infra/config/config-view.command.js';
import { InfraCommand } from './commands/infra/infra.command.js';
import { EnvExecCommand } from './commands/infra/env-exec.command.js';
import { EnvExportCommand } from './commands/infra/env-export.command.js';
import { LogsCommand } from './commands/infra/logs/logs.command.js';
import { LogsTailCommand } from './commands/infra/logs/logs-tail.command.js';
import { LogsWipeCommand } from './commands/infra/logs/logs-wipe.command.js';
import { FeedbackCommand } from './commands/infra/feedback.command.js';
import { BrandingCommand } from './commands/infra/branding.command.js';

// OPS
import { OpsCommand } from './commands/ops/ops.command.js';
import { HousekeepCommand } from './commands/ops/housekeep/housekeep.command.js';
import { DbCommand } from './commands/ops/db/db.command.js';
import { DbPushCommand } from './commands/ops/db/db-push.command.js';
import { DbUpCommand } from './commands/ops/db/db-up.command.js';
import { DbDownCommand } from './commands/ops/db/db-down.command.js';
import { DbResetCommand } from './commands/ops/db/db-reset.command.js';
import { RemoteResetCommand } from './commands/ops/db/remote-reset.command.js';
import { SeedCommand } from './commands/ops/db/seed.command.js';
import { KillCommand } from './commands/ops/kill.command.js';
import { ShellInstallCommand } from './commands/ops/shell-install.command.js';

// SYS
import { SysCommand } from './commands/sys/sys.command.js';
import { HardwareCommand } from './commands/sys/hardware/hardware.command.js';
import { HardwareListCommand } from './commands/sys/hardware/hardware-list.command.js';
import { IntegrationsCommand } from './commands/sys/integrations/integrations.command.js';
import { IntegrationsSyncCommand } from './commands/sys/integrations/sync.command.js';

// FIN
import { FinCommand } from './commands/fin/fin.command.js';
import { IntelCostCommand } from './commands/fin/intel-cost.command.js';

// DEV - GENERATE
import { GenerateCommand } from './commands/dev/generate/generate.command.js';
import { DomainGenerateCommand } from './commands/dev/generate/domain.command.js';
import { TacticalGenerateCommand } from './commands/dev/generate/tactical.command.js';
import { UiGenerateCommand } from './commands/dev/generate/ui.command.js';

// DEV - QUALITY
import { QualityCommand } from './commands/dev/quality/quality.command.js';
import { TestCommand } from './commands/dev/quality/test/test.command.js';
import { CheckCommand } from './commands/dev/quality/check/check.command.js';
import { AuditCommand } from './commands/dev/quality/audit.command.js';
import { ForgeCommand } from './commands/dev/quality/forge.command.js';

// SHARED
import { VersionCommand } from './commands/version.command.js';
import { ProcessManager } from './services/process-manager.service.js';
import { CliConfigService } from './services/cli-config.service.js';

@Module({
  providers: [
    ProcessManager,
    CliConfigService,
    DevToolsCommand,
    VersionCommand,
    InstallCommand,
    SyncCommand,
    WorkspaceCommand,

    // IAM
    IamCommand,
    WhoamiCommand,
    SwitchEnvCommand,
    LoginAsCommand,
    LoginCommand,
    LogoutCommand,
    SwitchOrgCommand,

    // INFRA
    DashboardCommand,
    ConfigCommand,
    ConfigAddCommand,
    ConfigListCommand,
    ConfigViewCommand,
    InfraCommand,
    EnvExecCommand,
    EnvExportCommand,
    LogsCommand,
    LogsTailCommand,
    LogsWipeCommand,
    FeedbackCommand,
    BrandingCommand,

    // OPS
    OpsCommand,
    HousekeepCommand,
    DbCommand,
    DbPushCommand,
    DbUpCommand,
    DbDownCommand,
    DbResetCommand,
    RemoteResetCommand,
    SeedCommand,
    KillCommand,
    ShellInstallCommand,

    // SYS
    SysCommand,
    HardwareCommand,
    HardwareListCommand,
    IntegrationsCommand,
    IntegrationsSyncCommand,

    // FIN
    FinCommand,
    IntelCostCommand,

    // DEV - GENERATE
    GenerateCommand,
    DomainGenerateCommand,
    TacticalGenerateCommand,
    UiGenerateCommand,

    // DEV - QUALITY
    QualityCommand,
    TestCommand,
    CheckCommand,
    AuditCommand,
    ForgeCommand,
  ],
})
export class AppModule {}
