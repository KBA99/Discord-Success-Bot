import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { findTopSuccessProfiles } from '../repository/services/server.service';
import { DiscordCommandConfig } from '../types/discord.interface';

const commandDefinition = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription("Use this command to find the leaderboard for top 15 success'");

const executeCommand = async (interaction: CommandInteraction) => {
	interaction.reply({
		embeds: [await findTopSuccessProfiles(interaction.guild!)],
		ephemeral: true,
	});
};

// This is done to retain type hints on export
const command: DiscordCommandConfig = {
	data: commandDefinition,
	execute: executeCommand,
};

export default command;
