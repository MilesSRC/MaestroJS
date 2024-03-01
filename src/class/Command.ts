import { CacheType, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Application } from './Application';

export interface CommandOptions {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction, app: Application) => Promise<any> | any;
}

export class Command {
    public data: SlashCommandBuilder;
    public execute: (interaction: CommandInteraction<CacheType>, app: Application) => any; // Update the type of 'execute'

    /**
     * Create an executable slash command for the bot
     * @param options {CommandOptions} The options for the command
     */
    constructor(options: CommandOptions){
        if(!options.execute)
            throw new TypeError("Commands need valid callbacks.")

        this.data = options.data;
        this.execute = options.execute;
    }

    /**
     * Returns the name of the command
     * @returns {string} The name of the command
     */
    public getName(): string {
        return this.data.name;
    }

    /**
     * Return the Discord.JS slash command data
     * @returns {SlashCommandBuilder} The slash command data
     */
    public getSlashCommand(): SlashCommandBuilder {
        return this.data;
    }
}