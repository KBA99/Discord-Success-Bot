import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { findUserSuccessProfile } from '../repository/services/server.service';
import { DiscordCommandConfig } from '../types/discord.interface';

const commandDefinition = new SlashCommandBuilder()
	.setName('profile')
	.setDescription('Use this command to open your user success profile');

const executeCommand = async (interaction: CommandInteraction) => {
	const { user } = await findUserSuccessProfile(interaction.guild!, interaction.user.id);
	interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setThumbnail(interaction.user.avatarURL())
				.setTitle(`Success Profile`)
				.setColor(`#00209e`)
				.addFields(
					{ name: 'Approved', value: `${user?.approved}`, inline: true },
					{ name: 'Denied', value: `${user?.denied}`, inline: true },
					{ name: 'Submitted', value: `${user?.submitted}`, inline: true },
                    { name: 'Activated by', value: `<@${interaction.user.id}>`, inline: false }
				)
				.setTimestamp(new Date()),
		],
		ephemeral: true,
	});
};

// This is done to retain type hints on export
const command: DiscordCommandConfig = {
	data: commandDefinition,
	execute: executeCommand,
};

export default command;
