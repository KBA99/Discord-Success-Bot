import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { addNewServerToDatabase, findServerById, setSuccessChannel } from '../repository/services/server.service';
import { DiscordCommandConfig } from '../types/discord.interface';

const commandDefinition = new SlashCommandBuilder()
	.setName('register')
	.setDescription('This command registers the success channel');

const executeCommand = async (interaction: CommandInteraction) => {
	const server = await findServerById(interaction.guild!)
	if (server == null) {
		await addNewServerToDatabase(interaction.guild!)
	}
	await setSuccessChannel(interaction)
	interaction.reply('This channel has now been set as the success channel');
};

// This is done to retain type hints on export
const command: DiscordCommandConfig = {
	data: commandDefinition,
	execute: executeCommand,
};

export default command;
