import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CommandInteractionOptionResolver, TextChannel } from 'discord.js';
import {
	findServerById,
	addNewServerToDatabase,
	setSuccessChannel,
} from '../repository/services/server.service';
import { AdminActivationAction, AdminCommandOption } from '../types/AdminActivationOptions';
import { DiscordCommandConfig } from '../types/discord.interface';

const commandDefinition = new SlashCommandBuilder()
	.setName('admin')
	.setDescription('Bans a user from the guild.')
	.addSubcommandGroup((register) =>
		register
			.setName('register')
			.setDescription('Registers the success channel on a sever')
			.addSubcommand((subcommand) =>
				subcommand
					.setName('channel')
					.setDescription('Registers channel as success channel')
					.addChannelOption((channel) =>
						channel
							.setName('channel')
							.setDescription('Channel to set success channel as')
							.setRequired(true)
					)
			)
	)
	.addSubcommandGroup((moderate) =>
		moderate
			.setName('moderate')
			.setDescription('Moderation Group')
			.addSubcommand((moderationRole) =>
				moderationRole
					.setName('moderator_role')
					.addRoleOption((option) => option.setName('role').setDescription('User Role'))
					.setDescription('Set the roles that can moderate success channel')
					.addStringOption(
						(option) =>
							option.setName('action').setDescription('Action').setChoices(
								{
									name: AdminActivationAction.Add,
									value: AdminActivationAction.Add,
								},
								{
									name: AdminActivationAction.Remove,
									value: AdminActivationAction.Remove,
								}
							)
						// .setRequired(true)
					)
			)
			.addSubcommand((autoAccept) =>
				autoAccept
					.setName('accept_all')
					.setDescription('Toggle this command to accept all posts')
					.addBooleanOption((option) =>
						option.setName('boolean').setDescription('Sets autoaccept on or off')
					)
			)
	);

const executeCommand = async (interaction: CommandInteraction) => {
	const options = (<unknown>interaction.options) as CommandInteractionOptionResolver;

	switch (options.getSubcommandGroup()) {
		case AdminCommandOption.register:
			const server = await findServerById(interaction.guild!);

			if (server == null) {
				await addNewServerToDatabase(interaction.guild!);
			}

			const successChannel = (<unknown>options.getChannel('channel')) as TextChannel;
			if (successChannel != null) {
				await setSuccessChannel(interaction, successChannel!);
				interaction.reply(`${successChannel} has now been set as the success channel`);
			}
			break;

		case AdminCommandOption.moderate:
			break;

		default:
			break;
	}
};

// This is done to retain type hints on export
const command: DiscordCommandConfig = {
	data: commandDefinition,
	execute: executeCommand,
};

export default command;
