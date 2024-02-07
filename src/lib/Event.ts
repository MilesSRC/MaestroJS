import { Application } from "../class/Application";

export interface EventOptions {
    name: string;
    handler: (app: Application, ...args: any) => any;
}

export class Event {
    private name: string;
    private handler: (app: Application, ...args: any) => any;

    constructor(options: EventOptions){
        if(!options.name)
            throw new TypeError("Events must have a name");

        if(!options.handler)
            throw new TypeError("Events must have a handler")

        this.name = options.name;
        this.handler = options.handler;
    }

    public getHandler(): (app: Application, ...args: any) => any {
        return this.handler;
    }

    public getName(): string {
        return this.name;
    }
}