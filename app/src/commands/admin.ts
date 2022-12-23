import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CommandInteractionOptionResolver, Role } from 'discord.js';
import {
	modifyModerationRole,
	registerSuccessChannel,
	setAutomaticAccept,
	showModeratorRoles,
} from '../repository/services/server.service';
import { AdminActivationAction, AdminCommandOption } from '../types/AdminActivationOptions';
import { DiscordCommandConfig, ModerateOptions } from '../types/discord.interface';

const commandDefinition = new SlashCommandBuilder()
	.setName('admin')
	.setDescription('Bans a user from the guild.')
	.addSubcommandGroup((register) =>
		register
			.setName('register')
			.setDescription('Registers the success channel on a server')
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
					.setName(ModerateOptions.moderator_role)
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
								},
								{
									name: AdminActivationAction.Clear,
									value: AdminActivationAction.Clear,
								}
							)
						// .setRequired(true)
					)
			)
			.addSubcommand((showModerators) =>
				showModerators
					.setName(ModerateOptions.show_moderators)
					.setDescription('Set the roles that can moderate success channel')
			)
			.addSubcommand((autoAccept) =>
				autoAccept
					.setName(ModerateOptions.accept_all)
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
			const successChannel = await registerSuccessChannel(interaction, options);
			await interaction.reply(`<#${successChannel?.id}> has now been set as the success channel`);
			break;

		case AdminCommandOption.moderate:
			if (options.getSubcommand() == ModerateOptions.moderator_role) {
				const role = options.getRole('role') as Role;
				if (options.getString('action') == AdminActivationAction.Add) {
					await modifyModerationRole(interaction, role, AdminActivationAction.Add);
					await interaction.channel?.send(`${role} has been added as a moderator role.`);
					await interaction.reply(`<@&${role.id}> has been added as a moderator role.`);
				}
				if (options.getString('action') == AdminActivationAction.Remove) {
					await modifyModerationRole(interaction, role, AdminActivationAction.Remove);
					await interaction.reply(`${role} has been removed as a moderator role.`);
				}
				if (options.getString('action') == AdminActivationAction.Clear) {
					await modifyModerationRole(interaction, role, AdminActivationAction.Clear);
					await interaction.reply(`All moderator roles have been cleared`);
				}
			}

			if (options.getSubcommand() == ModerateOptions.show_moderators) {
				const emebed = await showModeratorRoles(interaction);
				await interaction.reply({ embeds: [emebed!] });
			}

			if (options.getSubcommand() == ModerateOptions.accept_all) {
				const boolean = options.getBoolean('boolean') || false;
				await setAutomaticAccept(interaction, boolean);
				if (boolean) {
					interaction.reply('All success posts will now be automatically accepted');
				} else {
					interaction.reply(
						'All success posts will now require a member of the moderation team to be accepted'
					);
				}
			}

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
