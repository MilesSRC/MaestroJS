import path from 'path';
import fs from 'fs';
import { Event } from './Event';

export class FileBasedEvents {
    private path: string;
    private events: Event[];

    constructor(pathStr: string) {
        if (!fs.existsSync(pathStr))
            throw new ReferenceError("Couldn't find " + pathStr + " for events.");
        
        this.path = pathStr;
        this.events = [];

        this.loadEvents();
    }

    public forEach(callback: (event: Event) => any) {
        this.events.forEach(callback);
    }

    private loadEvents() {
        let files = fs.readdirSync(this.path);
        files.forEach(file => {
            let event = require(path.join(this.path, file));
            this.events.push(new event());
        });
    }
}