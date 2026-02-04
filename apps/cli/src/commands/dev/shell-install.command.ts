import { SubCommand, CommandRunner } from 'nest-commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@SubCommand({
  name: 'shell',
  description: 'Install brand-aligned ZSH customization and productivity aliases',
})
export class ShellInstallCommand extends CommandRunner {
  async run(): Promise<void> {
    const homeDir = os.homedir();
    const sousShellDir = path.join(homeDir, '.sous', 'shell');
    const zshrcPath = path.join(sousShellDir, 'zshrc');
    const mainZshrc = path.join(homeDir, '.zshrc');

    console.log('🐚 Installing @sous shell customization...');

    // 1. Create directory
    if (!fs.existsSync(sousShellDir)) {
      fs.mkdirSync(sousShellDir, { recursive: true });
    }

    // 2. Generate the managed zshrc content
    const content = `
# managed by @sous/cli
# branding and aliases for sous.tools

# Colors (OKLCH mapped to ANSI approximate)
SOUS_CYAN="\\x1b[38;5;51m"
SOUS_PINK="\\x1b[38;5;201m"
SOUS_GRAY="\\x1b[38;5;244m"
SOUS_RESET="\\x1b[0m"

# Productivity Aliases
alias sous="pnpm -w sous"
alias sd="sous dev"
alias sl="sous env logs tail"
alias sw="sous env logs wipe"
alias sc="sous quality check"
alias sm="sous maintenance housekeep"
alias ss="sous dev sync"
alias si="sous dev install"
alias st="cd ~/sous.tools"

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
    api_status="\\x1b[32m●\\x1b[0m" # Green
  else
    api_status="\\x1b[31m○\\x1b[0m" # Red
  fi

  PROMPT="\${SOUS_CYAN}\${status_icon} \${SOUS_RESET}\${SOUS_GRAY}sous[\${env_label}]\${SOUS_RESET} \${api_status} %~ %# "
}

autoload -Uz add-zsh-hook
add-zsh-hook precmd sous_prompt
`;

    fs.writeFileSync(zshrcPath, content);

    // 3. Update main .zshrc
    if (fs.existsSync(mainZshrc)) {
      let mainContent = fs.readFileSync(mainZshrc, 'utf-8');
      const sourceLine = `[ -f "\${HOME}/.sous/shell/zshrc" ] && source "\${HOME}/.sous/shell/zshrc"`;

      if (!mainContent.includes('.sous/shell/zshrc')) {
        fs.appendFileSync(mainZshrc, `
# @sous shell initialization
\${sourceLine}
`);
        console.log('✅ Added initialization to ~/.zshrc');
      } else {
        console.log('ℹ️  ~/.zshrc already contains @sous initialization');
      }
    } else {
      console.log('⚠️  ~/.zshrc not found. Please manually source ~/.sous/shell/zshrc');
    }

    console.log('🚀 Shell customization installed. Please run "source ~/.zshrc" to apply changes.');
  }
}