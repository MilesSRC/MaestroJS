import { Application } from "./Application";

export interface EventOptions {
    name: string;
    handler: (app: Application, ...args: any) => any;
}

export class Event {
    public readonly name: string;
    public execute: (app: Application, ...args: any) => any;

    /**
     * A discord.js supported event
     * @param options {EventOptions} The options for the event
     * @param options.name {string} The name of the event (e.g. ready, messageCreate, etc.)
     * @param options.handler {(app: Application, ...args: any) => any} The handler for the event
     */
    constructor(options: EventOptions){
        if(!options)
            throw new TypeError("Events must have options");

        if(!options.name)
            throw new TypeError("Events must have a name");

        if(!options.handler)
            throw new TypeError("Events must have a handler")

        this.name = options.name;
        this.execute = options.handler;
    }

    /**
     * Get the name of the event
     * @returns {string} The name of the event
     */
    public getName(): string {
        return this.name;
    }
}