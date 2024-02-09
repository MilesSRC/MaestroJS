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
            let command = require(path.join(this.path, file));
            this.commands.push(command);
        });
    }
}