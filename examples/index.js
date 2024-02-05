const { Application, FileBasedCommands, FileBasedEvents } = require('../dist/index');

// Construct basic application
// Commands, events and validation occur at
// authorization layer


// Application is a container for all the bots data
const app = new Application({
    // Meta data
    name: 'Mee6',

    // Program Data
    sharding: false,

    // Application Data
    commands: new FileBasedCommands(__dirname + '/commands/'),
    events: new FileBasedEvents(__dirname + '/events/'),
});

// Add dotenv for automatic token acquiral (optional)
require('dotenv').config();

// Easy logins (Uses process.env.BOT_TOKEN or Arg1)
app.authorize();

// Easy of use
// app.shards;
// app.shards.restart(/* ShardID? */);

// Easy shutdown, reloads, restarts
// app.shutdown();
// app.reload();
// app.restart();

// Container for error logging
// app.errors;

 // Socket.IO socket for third party apps
// app.socket;

// Dynamic caching
// app.cache.create("userData", {
//     expires: '1h',
// });

// app.cache.get('userData').put('username', data);
// app.cache.get('userData').get('username');
// app.cache.get('userData').expires('username');
// app.cache.get('userData').delete('username');

