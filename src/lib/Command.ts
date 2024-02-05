import { CacheType, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Application } from '../class/Application';

export interface CommandOptions {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction, app: Application) => Promise<any> | any;
}

export class Command {
    private data: SlashCommandBuilder;
    public execute: (interaction: CommandInteraction<CacheType>, app: Application) => any; // Update the type of 'execute'

    constructor(options: CommandOptions){
        if(!options.execute)
            throw new TypeError("Commands need valid callbacks.")

        this.data = options.data;
        this.execute = options.execute;
    }

    public getName(): string {
        return this.data.name;
    }

    public getSlashCommand(): SlashCommandBuilder {
        return this.data;
    }

    private setName(name: string): void {
        this.data.setName(name);
    }
}