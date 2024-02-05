import { Command } from "./Command";
import path from 'path';
import fs from 'fs';

export class FileBasedCommands {
    private path: string;
    private commands: Command[]
   
    constructor(pathStr: string){ 
        if(!fs.existsSync(pathStr))
            throw new ReferenceError("Couldn't find" + pathStr + " for commands.");
        
        this.path = pathStr;
        this.commands = [];

        this.loadCommands();
    }

    public forEach(callback: (command: Command) => void){
        this.commands.forEach(callback);
    }

    private loadCommands(){
        let files = fs.readdirSync(this.path);
        files.forEach(file => {
            let command = require(path.join(this.path, file));
            this.commands.push(command);
        });
    }
}