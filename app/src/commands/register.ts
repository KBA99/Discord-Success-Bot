import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { DiscordCommandConfig } from '../types/discord.interface';

const commandDefinition = new SlashCommandBuilder()
	.setName('register')
	.setDescription('This command registers the success channel');

const executeCommand = async (interaction: CommandInteraction) => {
	interaction.reply('This channel has now been set as the success channel');
};

// This is done to retain type hints on export
const command: DiscordCommandConfig = {
	data: commandDefinition,
	execute: executeCommand,
};

export default command;
