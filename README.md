# MaestroJS
[![CI](https://github.com/MilesSRC/MaestroJS/actions/workflows/main.yml/badge.svg)](https://github.com/MilesSRC/MaestroJS/actions/workflows/main.yml) <br>
This framework aims for making the creation of discord bots with Discord.js easier and faster with rapid building techniques, less boiler plate, easier to read code, and further improvements upon the Discord.js framework.

## What's the purpose of Maestro?
Maestro aims to make the initial setup and scalability of your discord bot simple. I (MilesSRC), noticed that getting a discord bot's foundations setup was a pain. I decided to create MaestroJS to remedy that inital daunting task. As well as providing some simple and depended on utility for use in peoples projects.

## Quick Start
To get started with Maestro, create an ``Application`` class.
```typescript
import { Application, Command, Event } from "@dubbyyt/maestro.js"
import { SlashCommandBuilder, Client, CommandInteraction } from "discord.js"

const MyApp = new Application({
    name: "Really Cool Bot",

    commands: [
        new Command({
            data: new SlashCommandBuilder()
                    .setName("ping")
                    .setDescription("Ping my cool bot!"),
            
            // Execute MUST be asyncronious, non-async functions aren't supported.
            execute: async (interaction: CommandInteraction, app: Application){
                interaction.reply("Hello world!")
            }
        })
    ],

    events: [
        new Event({
            name: "ready"
            handler: (client: Client) {
                console.log(`${client.user?.tag} is ready!`)
            }
        })
    ]
})

// Middleware (new to 0.0.11)
MyApp.on("commandError", (
    error: Error, 
    interaction: CommandInteraction, 
    command: Command
) => {
    // Maestro gives you 1.5s to either defer the reply or reply until it 
    // automatically sends a default error message to the user.
    interaction.reply("I'm sorry! It looks like I wasn't cool enough to execute that command. Try again later.")
})

// Authorize will automatically pull "BOT_TOKEN" from env 
// if no argument is provided to authorize.
MyApp.authorize()

// If you aren't storing your token in env (bad idea), 
// put it there in the first argument
MyApp.authorize("etcetcetcetcetcetc.etcetc.etcetcetc")
```

## File Based Commands & Events
You can use ``FileBasedCommands(directory: string)`` and ``FileBasedEvents(directory: string)`` to grab events and commands from the file system of your project.

### src/index.js
```typescript
import { Application, FileBasedCommands, FileBasedEvents } from "@dubbyyt/maestro.js"
import path from 'path'

const MyApp = new Application({
    name: "Really Cool Bot",

    // Command and event arrays will be automatically populated 
    // with commands and events from your project.
    // Nesting in folders isn't supported yet. 
    // Please keep command and event files visible from top level in that directory. 
    commands: new FileBasedCommands(path.join(__dirname, 'commands/')),
    events: new FileBasedEvents(path.join(__dirname, 'events/'))
})

// Authorize will automatically pull "BOT_TOKEN" from env 
// if no argument is provided to authorize.
MyApp.authorize()
```

### src/commands/ping.js
```typescript
import { Command } from "@dubbyyt/maestro.js"
import { SlashCommandBuilder } from 'discord.js'

export default new Command({
    data: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Ping my cool bot!"),
    
    // Execute MUST be asyncronious, non-async functions aren't supported.
    execute: async (interaction: CommandInteraction, app: Application){
        interaction.reply("Hello world!")
    }
});
```

### src/events/ready.ts
```typescript
import { Event } from "@dubbyyt/maestro.js"

export default new Event({
    name: "ready",
    handler: (client: Client) {
        console.log(`${client.user?.tag} is ready!`)
    }
})
```


### Side Note
If you aren't using typescript, you can put your event/command straight into module.exports
```typescript
// src/commands/ping.js
const { Command } = require("@dubbyyt/maestro.js")
const { SlashCommandBuilder } = require("discord.js")

module.exports = new Command({
    data: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Ping my cool bot!"),
    
    // Execute MUST be asyncronious, non-async functions aren't supported.
    execute: async (interaction: CommandInteraction, app: Application){
        interaction.reply("Hello world!")
    }
});
```