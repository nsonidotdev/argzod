import type { Command } from '../api/command';
import chalk from 'chalk';
import { getOptionNames } from '../utils/options';

type HelpLoggerConfig = {
    commands: Command[];
    targetCommand: Command;
    isIndexCommand: boolean;
    programName: string;
    programDescription?: string;
};

export class HelpLogger {
    private config: HelpLoggerConfig;

    constructor(config: HelpLoggerConfig) {
        this.config = config;
    }

    private alignLog(rows: Array<Record<'left' | 'right', string>>) {
        const maxLeftLength = Math.max(...rows.map((row) => row.left.length));
        const gap = 6;

        rows.forEach((row) => {
            console.log(`${row.left.padEnd(maxLeftLength + gap)}${row.right}`);
        });
    }

    private indent(level: number = 1) {
        const indent = 4;
        return ' '.repeat(level * indent);
    }

    log(): void {
        const { targetCommand, programDescription, commands } = this.config;
        // Show index command if it exists
        const indexCommand = commands.find((cmd) => !cmd.name);
        if (indexCommand) {
            console.log();
            this.logCommandHelp(indexCommand);
        }

        if (programDescription) {
            console.log();
            console.log(programDescription);
            console.log();
        }

        if (indexCommand !== targetCommand) {
            this.logCommandHelp(targetCommand);
            return;
        }

        console.log(chalk.bold('Commands:'));
        this.alignLog(
            commands
                .filter((cmd) => cmd.name)
                .map((cmd) => ({
                    left: this.indent() + cmd.name,
                    right: cmd.description ? chalk.italic(cmd.description) : '',
                }))
        );

        console.log();
    }

    private logCommandHelp(command: Command): void {
        // Usage
        console.log(chalk.bold('Usage:'));
        const usage = [this.config.programName, command.name, command.args.length ? '<args>' : '', '[options]']
            .filter(Boolean)
            .join(' ');
        console.log(`${this.indent()}${usage}`);

        // Options
        if (command.options) {
            console.log(chalk.bold('\nOptions:'));
            this.alignLog(
                Object.values(command.options).map((option) => {
                    return {
                        left: this.indent() + getOptionNames(option),
                        right: option.description ? chalk.italic(option.description) : '',
                    };
                })
            );
        }
    }
}
