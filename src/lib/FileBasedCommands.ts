import { Command } from "./Command";
import path from 'path';
import fs from 'fs';

export class FileBasedCommands {
    private path: string;
    private commands: Command[]
   
    /**
     * A class to load commands from the file system
     * Each command is expected to be a class that extends the Command class
     * Export each command to default/main export
     * 
     * @param pathStr {string} The path to the commands
     */
    constructor(pathStr: string){ 
        if(!fs.existsSync(pathStr))
            throw new ReferenceError("Couldn't find" + pathStr + " for commands.");
        
        this.path = pathStr;
        this.commands = [];

        this.loadCommands();
    }

    /**
     * A method to execute a callback for each command
     * @param callback {Function} The callback to execute for each command
     */
    public forEach(callback: (command: Command) => void){
        this.commands.forEach(callback);
    }

    /**
     * Load the commands from the file system
     */
    private loadCommands(){
        let files = fs.readdirSync(this.path);
        files.forEach(file => {
            // Ensure file is a .js file (ignore .map files and other files)
            if(!file.endsWith('.js')) return;

            try {
                let command = require(path.join(this.path, file));

                // Ensure command is properly required
                command = command.default || command;

                // Ensure comamnd is a command class
                if(!(command instanceof Command))
                    throw new TypeError("Commands must be a command class provided by Maestro.");

                // Ensure command is properly formatted with correct data
                if(!command.data)
                    throw new TypeError("Commands must have a data property.");

                if(!command.execute)
                    throw new TypeError("Commands must have an execute method.");

                this.commands.push(command);
            } catch (err) {
                console.error("Error loading command " + file + ":" + "\n");
                console.error(err);
            }
        });
    }
}