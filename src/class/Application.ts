import { FileBasedCommands } from "../lib/FileBasedCommands";
import { Command } from "../lib/Command";
import { Event } from "../lib/Event";
import { FileBasedEvents } from "../lib/FileBasedEvents";

/* Discord JS */
import { Client, GatewayIntentBits, IntentsBitField, RESTPostAPIApplicationCommandsJSONBody, SharedSlashCommandOptions } from "discord.js";
import { REST } from "discord.js";
import { Routes } from "discord-api-types/v9";

export class Application {
    private name: string = "Unnamed Application";
    private commands: Map<string, Command> = new Map<string, Command>();
    private events: Map<string, Event> = new Map<string, Event>();

    private client: Client;
    private token: string = "";
    private authorized: boolean = false;

    // TODO: Create sharding system
    // Settings
    private settings: AppSettings;

    constructor(options: ApplicationOptions){
        this.name = options.name;
        
        // Commands
        this.commands = new Map<string, Command>();
        options.commands?.forEach((cmd: Command) => this.commands.set(cmd.getName(), cmd));

        // Events
        this.events = new Map<string, Event>();
        options.events?.forEach((event: Event) => this.events.set(event.getName(), event));

        // Assemble Client
        let resolvedIntents: GatewayIntentBits[] = options.intents || [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.DirectMessages,
        ];

        this.client = new Client({
            intents: resolvedIntents
        });

        if(options.intents == undefined)
            console.warn("No intents were provided. This may cause issues with your application.");

        // Load commands handling (Each command is already ready, just need to hook to interactionCreate)
        this.startWatchingCommands();

        // Load events handling
        this.startWatchingEvents();

        // Load settings
        this.settings = {
            debug: options.debug || false,
            useSharding: options.useSharding || false,
            shardCount: options.useSharding ? (options.shardCount || 0) : 1, // Default to 1 if sharding is not enabled, if enabled without shard count, automatically scale
            deferReply: options.deferReplies || false,
        };
    }

    startWatchingCommands(){
        this.client.on("interactionCreate", async (interaction) => {
            if(!interaction.isCommand()) return;
            if(!this.commands.has(interaction.commandName)) return;
            if(interaction.guild && !interaction.guild.available) 
                return console.warn("Guild is not available, skipping command execution.");

            if(this.settings.deferReply)
                interaction.deferReply({ ephemeral: true });

            let command: Command = this.commands.get(interaction.commandName) as Command;
            command.execute(interaction, this).catch((error: Error) => {
                if(this.settings.debug)
                    console.error(error);

                if(interaction.replied || interaction.deferred)
                    interaction.user.send({ content: "An error occured while executing your previous command." }).catch(err => {
                        /* Empty, privacy settings */
                    });

                if(!interaction.replied)
                    interaction.reply({ content: "An error occured while executing this command." });
            });
        });
    }

    startWatchingEvents(){
        this.events.forEach((event: Event) => {
            this.client.on(event.getName(), (...args: any) => event.getHandler()(this, ...args));
        });
    }

    public async authorize(token?: string) {
        if(!token && !process.env.BOT_TOKEN)
            throw new TypeError("No valid bot token provided.");

        if(token && !process.env.BOT_TOKEN)
            this.token = token;

        if(!token && process.env.BOT_TOKEN)
            this.token = process.env.BOT_TOKEN;

        await this.client.login(process.env.BOT_TOKEN || token).then(() => {
            this.authorized = true;

            // Report commands to discord via REST
            let commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
            this.commands.forEach((command: Command) => {
                commands.push(command.getSlashCommand().toJSON());
            });

            const rest = new REST({ version: '10' });
            rest.setToken(this.token);

            rest.put(Routes.applicationCommands(this.client.user?.id || ""), { body: commands })
                .then(() => console.log('Successfully registered application commands.'))
                .catch(console.error);

        }).catch((err: Error) => {
            this.authorized = false;
            throw err;
        });
    }

    getClient(){
        return this.client;
    }
} 

export interface ApplicationOptions {
    useSharding: boolean;
    shardCount: number;
    deferReplies: boolean;
    debug: boolean;

    name: string;

    commands: FileBasedCommands | Command[] | undefined;
    events: FileBasedEvents | Event[] | undefined;

    intents?: GatewayIntentBits[] | undefined;
}

export interface AppSettings {
    debug: boolean;
    useSharding: boolean;
    shardCount: number;

    deferReply: boolean;
}