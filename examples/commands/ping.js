const { SlashCommandBuilder } = require("discord.js");
const { Command } = require('../../dist/lib/Command');

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    async execute(interaction, application) {
        const msg = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        msg.edit(`Pong! Latency is ${msg.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(application.getClient().ws.ping)}ms`);
    }
});