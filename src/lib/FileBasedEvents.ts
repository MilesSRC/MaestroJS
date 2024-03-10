import path from 'path';
import fs from 'fs';
import { Event } from './Event';

export class FileBasedEvents {
    private path: string;
    private events: Event[];

    /**
     * FileSystem based events. This class will load events from the file system.
     * Events are expected to be in the form of a class that extends the Event class.
     * Export each event to default/main export
     * 
     * @param pathStr {string} The path to the events
     */
    constructor(pathStr: string) {
        if (!fs.existsSync(pathStr))
            throw new ReferenceError("Couldn't find " + pathStr + " for events.");
        
        this.path = pathStr;
        this.events = [];

        this.loadEvents();
    }

    /**
     * A method to execute a callback for each event
     * @param callback {Function} The callback to execute for each event
     */
    public forEach(callback: (event: Event) => any) {
        this.events.forEach(callback);
    }

    /**
     * Load the events from the file system
     */
    private loadEvents() {
        let files = fs.readdirSync(this.path);
        files.forEach(file => {
            let event = require(path.join(this.path, file));

            // Ensure event is properly required
            event = event.default || event;

            // Ensure event is a event class
            if (!(event instanceof Event))
                throw new TypeError("Events must be a class that extends the Event class.");

            // Ensure event is properly formatted with correct data
            if (!event.name)
                throw new TypeError("Events must have a name property.");

            if (!event.execute)
                throw new TypeError("Events must have a handler method.");

            this.events.push(event);
        });
    }
}