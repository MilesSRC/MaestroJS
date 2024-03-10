// Rock Paper Scissors Command

const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { Command } = require('../../dist/index');

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock Paper Scissors!')
        .addStringOption(option => option.setName('choice').setDescription('Your choice').setRequired(true).addChoices(
            { name: 'Rock', value: 'Rock' },
            { name: 'Paper', value: 'Paper' },
            { name: 'Scissors', value: 'Scissors' }
        )),

    async execute(interaction, application) {
        // Get the user's choice
        const choice = interaction.options.getString('choice');

        // Get the bot's choice
        const botChoice = Math.floor(Math.random() * 3);
        let botChoiceString = "";
        switch (botChoice) {
            case 0:
                botChoiceString = "Rock";
                break;
            case 1:
                botChoiceString = "Paper";
                break;
            case 2:
                botChoiceString = "Scissors";
                break;
        }

        // Get the winner
        let winner = "";

        if (choice === botChoiceString) {
            winner = "It's a tie!";
        } else if (choice === "Rock") {
            if (botChoiceString === "Paper") {
                winner = "The bot won!";
            } else {
                winner = "You won!";
            }
        } else if (choice === "Paper") {
            if (botChoiceString === "Scissors") {
                winner = "The bot won!";
            } else {
                winner = "You won!";
            }
        } else if (choice === "Scissors") {
            if (botChoiceString === "Rock") {
                winner = "The bot won!";
            } else {
                winner = "You won!";
            }
        }

        // Reply with the results
        await interaction.reply(`You chose ${choice}, I chose ${botChoiceString}. ${winner}`);
    }
});