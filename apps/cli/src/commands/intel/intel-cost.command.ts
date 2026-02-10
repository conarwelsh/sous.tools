import { SubCommand, CommandRunner } from 'nest-commander';
import { logger } from '@sous/logger';
import chalk from 'chalk';

@SubCommand({
  name: 'cost',
  description: 'View detailed cost breakdown for a recipe',
})
export class IntelCostCommand extends CommandRunner {
  async run(passedParam: string[]): Promise<void> {
    const id = passedParam[0];
    if (!id) {
      logger.error('❌ Please provide a recipe ID or name.');
      return;
    }

    console.log('
' + chalk.bold(`📊 COST ANALYSIS: ${id.toUpperCase()}`));
    console.log('='.repeat(50));
    console.log(`${chalk.bold('INGREDIENT'.padEnd(25))} ${chalk.bold('QTY'.padEnd(10))} ${chalk.bold('COST')}`);
    console.log(`${'Butter'.padEnd(25)} ${'500g'.padEnd(10)} $4.50`);
    console.log(`${'Flour'.padEnd(25)} ${'1kg'.padEnd(10)} $1.20`);
    console.log('-'.repeat(50));
    console.log(`${chalk.bold('TOTAL COST:'.padEnd(35))} $5.70`);
    console.log(`${chalk.green(chalk.bold('MARGIN (at $25.00):'.padEnd(35)))} 77.2%`);
    console.log('='.repeat(50) + '
');
  }
}
