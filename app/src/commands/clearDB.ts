import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { clearDB } from '../repository/services/server.service';
import { DiscordCommandConfig } from '../types/discord.interface';

const commandDefinition = new SlashCommandBuilder()
	.setName('cleardb')
	.setDescription('This command clears the discord success bot database.');

const executeCommand = async (interaction: CommandInteraction) => {
	clearDB();
	interaction.reply('DB Cleared');
};

// This is done to retain type hints on export
const command: DiscordCommandConfig = {
	data: commandDefinition,
	execute: executeCommand,
};

export default command;
