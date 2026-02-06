import { logger } from '@sous/logger';
import { SubCommand, CommandRunner } from 'nest-commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@SubCommand({
  name: 'shell',
  description:
    'Install brand-aligned ZSH customization and productivity aliases',
})
export class ShellInstallCommand extends CommandRunner {
  async run(): Promise<void> {
    const homeDir = os.homedir();
    const sousShellDir = path.join(homeDir, '.sous', 'shell');
    const zshrcPath = path.join(sousShellDir, 'zshrc');
    const mainZshrc = path.join(homeDir, '.zshrc');

    logger.info('🐚 Installing @sous shell customization...');

    // 1. Create directory
    if (!fs.existsSync(sousShellDir)) {
      fs.mkdirSync(sousShellDir, { recursive: true });
    }

    // 2. Generate the managed zshrc content
    // Note: We use %{ ... %} for non-printable characters in ZSH PROMPT to prevent wrapping issues.
    const content = `
# managed by @sous/cli
# branding and aliases for sous.tools

# Colors (OKLCH mapped to ANSI approximate)
SOUS_CYAN=$'\\x1b[38;5;51m'
SOUS_PINK=$'\\x1b[38;5;201m'
SOUS_GRAY=$'\\x1b[38;5;244m'
SOUS_RESET=$'\\x1b[0m'

# Android Environment Bridge (WSL2 -> Windows)
export WIN_IP=\$(ip route show default | awk '{print \$3}')
export ADB_SERVER_SOCKET=tcp:\$WIN_IP:5037
export ANDROID_HOME="\$HOME/Android/Sdk"
export NDK_HOME="\$ANDROID_HOME/ndk/29.0.13846066"
export JAVA_HOME="/usr/lib/jvm/java-1.17.0-openjdk-amd64"
export TAURI_DEV_HOST=localhost

# WSL2 GUI Rendering Fixes (MESA/WebKit Overrides)
export WEBKIT_DISABLE_COMPOSITING_MODE=1
export LIBGL_ALWAYS_SOFTWARE=1
export WEBKIT_FORCE_SANDBOX=0

# Extended PATH for Android Tools
export PATH="\$PATH:\$ANDROID_HOME/emulator:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/build-tools/35.0.0"

# Productivity Aliases
alias sous="pnpm -w sous"
alias sd="st && sous dev"
alias sl="sous env logs tail"
alias sw="sous env logs wipe"
alias sc="sous quality check"
alias sm="sous maintenance housekeep"
alias ss="sous dev sync"
alias si="sous dev install"
alias st="cd ~/sous.tools"

# Path-Sanitized Android Dev Helper
function sda() {
  PATH=$(echo $PATH | tr ':' '\\n' | grep -v 'mnt/c' | tr '\\n' ':') ANDROID_HOME="$HOME/Android/Sdk" NDK_HOME="$HOME/Android/Sdk/ndk/29.0.13846066" pnpm tauri android dev --no-dev-server-wait
}

alias c="clear"
alias ls="ls -lah --color=auto"
alias ..="cd .."
alias ...="cd ../.."
alias ni="pnpm install"
alias nx="pnpm exec"

# Custom Prompt
function sous_prompt() {
  local status_icon="👨‍🍳"
  local env_label="dev"
  
  # Infrastructure check (lightweight)
  local api_status="."
  if (nc -z localhost 4000 2>/dev/null); then
    api_status=$'\\x1b[32m●\\x1b[0m' # Green
  else
    api_status=$'\\x1b[31m○\\x1b[0m' # Red
  fi

  # %{ ... %} is critical for ZSH to calculate prompt length correctly
  PROMPT="%{\${SOUS_CYAN}%}\${status_icon} %{\${SOUS_RESET}%}%{\${SOUS_GRAY}%}sous[\${env_label}]%{\${SOUS_RESET}%} \${api_status} %~ %# "
}

autoload -Uz add-zsh-hook
add-zsh-hook precmd sous_prompt
`;

    fs.writeFileSync(zshrcPath, content);

    // 3. Update main .zshrc
    if (fs.existsSync(mainZshrc)) {
      let mainContent = fs.readFileSync(mainZshrc, 'utf-8');
      const sourceLine = `[ -f "\${HOME}/.sous/shell/zshrc" ] && source "\${HOME}/.sous/shell/zshrc"`;

      // 3.1 Ensure OMZ plugins are present
      if (mainContent.includes('plugins=(')) {
        const requiredPlugins = [
          'git',
          'zsh-syntax-highlighting',
          'zsh-autosuggestions',
        ];
        let updatedPlugins = false;

        requiredPlugins.forEach((plugin) => {
          if (!mainContent.match(new RegExp(`\\s${plugin}(\\s|\\))|'${plugin}'|"${plugin}"`))) {
            mainContent = mainContent.replace(
              /plugins=\(([^)]*)\)/,
              `plugins=($1 ${plugin})`,
            );
            updatedPlugins = true;
          }
        });

        if (updatedPlugins) {
          fs.writeFileSync(mainZshrc, mainContent);
          logger.info('✅ Updated plugins in ~/.zshrc');
        }
      }

      // Cleanup corrupted lines if any
      if (mainContent.includes('${sourceLine}')) {
        mainContent = mainContent.replace(
          /\\n# @sous shell initialization\\n\\$\{sourceLine\}/g,
          '',
        );
        fs.writeFileSync(mainZshrc, mainContent);
      }

      if (!mainContent.includes('.sous/shell/zshrc')) {
        fs.appendFileSync(
          mainZshrc,
          `
# @sous shell initialization
${sourceLine}
`,
        );
        logger.info('✅ Added initialization to ~/.zshrc');
      } else {
        logger.info('ℹ️  ~/.zshrc already contains @sous initialization');
      }
    } else {
      logger.info(
        '⚠️  ~/.zshrc not found. Please manually source ~/.sous/shell/zshrc',
      );
    }

    logger.info(
      '🚀 Shell customization installed. Please run "source ~/.zshrc" to apply changes.',
    );
  }
}
