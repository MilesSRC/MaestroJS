import { FileBasedCommands } from "../lib/FileBasedCommands";
import { Command } from "../lib/Command";
import { Event } from "../lib/Event";
import { FileBasedEvents } from "../lib/FileBasedEvents";

/* Discord JS */
import { Client, GatewayIntentBits, IntentsBitField, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { REST } from "discord.js";
import { Routes } from "discord-api-types/v9";

// Events
import { EventEmitter } from "events";

export class Application {
    private name: string = "Unnamed Application";
    public commands: Map<string, Command> = new Map<string, Command>();
    public events: Map<string, Event> = new Map<string, Event>();

    private client: Client;
    private token: string = "";
    private authorized: boolean = false;

    // Events
    private emitter: EventEmitter = new EventEmitter();

    // Settings
    private settings: AppSettings;

    /**
     * Creates a new Maestro Application instance.
     * @param options The options for the Application.
     * @example
     * const app = new Application({
     *   name: "My Application",
     *   commands: new FileBasedCommands("./commands"),
     *   events: new FileBasedEvents("./events"),
     *   intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.DirectMessages],
     *   settings: { // Settings field is optional
     *     debug: true,
     *     deferReply: true
     *   }
     * });
     */
    constructor(options: ApplicationOptions){
        this.name = options.name;

        // Settings
        this.settings = Object.assign(defaultSettings, options.settings);
        
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
    }

    /**
     * Starts watching for commands and executes them.
     */
    private startWatchingCommands(){
        this.client.on("interactionCreate", async (interaction) => {
            if(!interaction.isCommand()) return;
            if(!this.commands.has(interaction.commandName)) return;
            if(interaction.guild && !interaction.guild.available) 
                return console.warn("Guild is not available, skipping command execution.");

            if(this.settings.deferReply)
                interaction.deferReply({ ephemeral: true });

            let command: Command = this.commands.get(interaction.commandName) as Command;
            command.execute(interaction, this).catch(async (error: Error) => {
                if(this.settings.debug)
                    console.error(error);

                this.emitter.emit("commandError", error, interaction, command);

                if(this.emitter.listeners("commandError").length > 0){
                    /* Wait for 1.5s, if the interaction was not replied to, reply with an error message. */
                    await new Promise((resolve, reject) => {
                        setTimeout(resolve, 1500)
                    });

                    if(!interaction.replied && !interaction.deferred){
                        interaction.reply({ content: "An error occured while executing your previous command." }).catch(err => {
                            /* Empty, privacy settings */
                        });

                        if(this.settings.debug)
                            console.warn("An error occured while executing a command, and a error handler was found, but the interaction was not replied to.")

                        return;
                    }
                }

                if(interaction.replied || interaction.deferred)
                    interaction.user.send({ content: "An error occured while executing your previous command." }).catch(err => {
                        /* Empty, privacy settings */
                    });

                if(!interaction.replied)
                    interaction.reply({ content: "An error occured while executing this command." });
            });
        });
    }

    /**
     * Starts watching for events and executes them.
     */
    private startWatchingEvents(){
        this.events.forEach((event: Event) => {
            this.client.on(event.getName(), (...args: any) => event.execute(this, ...args));
        });
    }

    /**
     * Authorizes the bot to the discord API.
     * @param {string} token Optional. If not provided, it will use the token from the environment variable. (BOT_TOKEN)
     * @throws {TypeError} If no valid bot token is provided.
     * @throws {Error} If the bot fails to login.
     * @example
     * await app.authorize()
     * await app.authorize("TOKEN")
     */
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
                this.emitter.emit("commandRegistered", command);
            });

            const rest = new REST({ version: '10' });
            rest.setToken(this.token);

            rest.put(Routes.applicationCommands(this.client.user?.id || ""), { body: commands })
                .then(() => {
                    if(this.settings.debug)
                        console.log("Successfully registered commands to Discord.");

                    this.emitter.emit("commandsRegistered", this);
                })
                .catch(console.error);

        }).catch((err: Error) => {
            this.authorized = false;
            throw err;
        });
    }

    /**
     * Deauthorized the client with Discord.JS and Maestro
     */
    public async deauthorize(){
        await this.client.destroy();
        this.authorized = false;
    }

    /**
     * Returns whether the bot is authorized or not.
     */
    public isAuthorized(): boolean {
        return this.authorized && this.client.user != null;
    }

    /**
     * Returns the underlying discord.js Client instance.
     * @returns {Client} The discord.js Client.
     */
    public getClient(){
        return this.client;
    }

    /**
     * Returns the name of the application.
     * @returns {string} The name of the application.
     */
    public getName(){
        return this.name;
    }

    /**
     * Attach an event listener to the application.
     * @event {string} The event name.
     * @listener {Function} The event listener.
     * @example
     * app.on("commandError", (error, interaction, command) => {
     *      console.error(error);
     * });
     */
    public on(event: ApplicationEvent, listener: (...args: any) => void){
        this.emitter.on(event, listener);
    }

    /**
     * A command error has occured within Maestro
     * @event commandError
     * @param error The error that occured.
     * @param interaction The interaction that caused the error.
     * @param command The command that caused the error.
     * @example
     * app.on("commandError", (error, interaction, command) => {
     *     console.error(error);
     * });
     */

    /**
     * A command has been registered to Maestro
     * @event commandRegistered
     * @param command The command that was registered.
     * @example
     * app.on("commandRegistered", (command) => {
     *    console.log(`Command ${command.getName()} has been registered.`);
     * });
    */

    /**
     * All commands have been registered to Maestro
     * @event commandsRegistered
     * @param app The application that registered the commands.
     * @example
     * app.on("commandsRegistered", (app) => {
     *    console.log(`All commands have been registered to ${app.getName()}`);
     * });
    */
} 

export type ApplicationEvent = "commandError" | "commandsRegistered" | "commandRegistered";
export type CommandErrorListener = (error: Error, interaction: any, command: Command) => void;
export type CommandRegisteredListener = (command: Command) => void;
export type CommandsRegisteredListener = (app: Application) => void;

export interface ApplicationOptions {
    name: string;

    commands?: FileBasedCommands | Command[];
    events?: FileBasedEvents | Event[];

    intents?: GatewayIntentBits[];
    settings?: AppSettings;
}

export interface AppSettings {
    debug?: boolean;
    deferReply?: boolean;
}

const defaultSettings: AppSettings = {
    debug: false,
    deferReply: false,
}