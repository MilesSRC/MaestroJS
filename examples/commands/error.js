const { SlashCommandBuilder } = require("discord.js");
const { Command } = require('../../dist/index');

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName('error')
        .setDescription('Replies with an error!'),

    async execute(interaction, application) {
        const msg = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        msg.no(`Pong! Latency is ${msg.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(application.getClient().ws.ping)}ms`);
    }
});