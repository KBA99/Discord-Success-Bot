import {
	CacheType,
	CommandInteraction,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	Guild,
	Role,
	TextChannel,
} from 'discord.js';
import { Types } from 'mongoose';
import { AdminActivationAction } from '../../types/AdminActivationOptions';
import { IServerSchema } from '../../types/discord.interface';
import ServerSchema from '../data/server.schema';

export const addNewServerToDatabase = async (guild: Guild) => {
	const server = await findServerById(guild);
	let ownerNameAndDiscriminator;
	if (!!server) {
		return await ServerSchema.findOneAndUpdate(
			{ 'guild.id': guild.id },
			{ dateAdded: new Date() } // TODO Working but not updating with new date in DB - Look at FindOneAndUpdate
		);
	} else {
		guild.client.users.cache.find((user) => {
			if (user.id == guild.ownerId) {
				ownerNameAndDiscriminator = user.username + '#' + user.discriminator;
			}
		});

		const joinedGuild = {
			name: guild.name,
			id: guild.id,
			owner: {
				discordId: guild.ownerId,
				discordTag: ownerNameAndDiscriminator,
			},
		};

		return await ServerSchema.create({ guild: joinedGuild });
	}
};

export const acceptSuccess = async (guild: Guild, discordId: string) => {
	const { user, server } = await findUserSuccessProfile(guild, discordId);
	if (user != null || user != undefined) {
		user.approved++;
	}
	return server?.save();
};

export const denySuccess = async (guild: Guild, discordId: string) => {
	const { user, server } = await findUserSuccessProfile(guild, discordId);
	if (user != null || user != undefined) {
		user.denied++;
	}
	return server?.save();
};

export const findUserSuccessProfile = async (guild: Guild, discordId: string) => {
	let user;
	let server;
	server = await findServerById(guild);
	throwErrorIfGuildIsNull(guild);

	user = server?.users.find((user) => user.discordId == discordId);

	if (user == null) {
		server = await createUserSuccessProfile(server, discordId);
		user = server?.users.find((user) => user.discordId == discordId);
	}
	return { user, server };
};

export const findTopSuccessProfiles = async (guild: Guild, number: number = 15) => {
	const server = await findServerById(guild);
	throwErrorIfGuildIsNull(guild);
	let users = server?.users;
	// find the top 15 in the array by approved count

	const embed = new EmbedBuilder()
		.setTitle(`${guild.name} Success Leaderboard`)
		.setThumbnail(guild.iconURL())
		.setColor(`#00209e`)
		.setTimestamp(new Date());

	for (let i = 0; i < number; i++) {
		const user = users?.[i];
		if (!!user) {
			embed.addFields({
				name: `#${i + 1}`,
				value: `<@${user!.discordId}> | ${user!.approved}`,
			});
		}
	}

	return embed;
};

export const createUserSuccessProfile = async (
	server: (IServerSchema & { _id: Types.ObjectId }) | null | undefined,
	discordId: string
) => {
	server?.users.push({
		discordId: discordId,
		approved: 0,
		denied: 0,
		submitted: 0,
	});
	return server?.save();
};

export const findServerById = async (guild: Guild) => {
	return await ServerSchema.findOne({ 'guild.id': guild.id });
};

export const getDiscordTagAndDiscriminator = (guild: Guild, id: string) => {
	const user = guild.client.users.cache.get(id);
	return user?.username + '#' + user?.discriminator + ' | ' + `<@${user?.id}>`;
};

export const getDiscordUserById = (guild: Guild, id: string) => {
	return guild.client.users.cache.get(id);
};

export const increaseSuccessSubmissionByOne = async (guild: Guild, discordId: string) => {
	const { user, server } = await findUserSuccessProfile(guild, discordId);
	if (user != null || user != undefined) {
		user.submitted++;
	}
	return server?.save();
};

export const setSuccessChannel = async (
	interaction: CommandInteraction,
	successChannel: TextChannel
) => {
	throwErrorIfGuildIsNull(interaction.guild);
	const server = await findServerById(interaction.guild!);

	if (server != null) {
		server.guild.successChannel = successChannel.id;
		await server.save();
	}
};

export const setAutomaticAccept = async (
	interaction: CommandInteraction,
	acceptAll: boolean = false
) => {
	throwErrorIfGuildIsNull(interaction.guild);
	const server = await findServerById(interaction.guild!);

	if (server != null) {
		server.guild.acceptAll = acceptAll;
		server.save();
	}
};

export const modifyModerationRole = async (
	interaction: CommandInteraction,
	role: Role,
	action: AdminActivationAction
) => {
	throwErrorIfGuildIsNull(interaction.guild);
	let server = await findServerById(interaction.guild!);

	if (server != null) {
		switch (action) {
			case AdminActivationAction.Add:
				if (!server.guild.moderatorRoles.includes(role.id)) {
					server.guild.moderatorRoles.push(role.id);
				}
				break;
			case AdminActivationAction.Remove:
				server.guild.moderatorRoles = server.guild.moderatorRoles.filter(
					(roles) => roles != role.id
				);
				break;
			case AdminActivationAction.Clear:
				server.guild.moderatorRoles = [];
				break;

			default:
				throw new Error('Error modifying moderation role');
		}
		server.save();
	}
};

export async function registerSuccessChannel(
	interaction: CommandInteraction<CacheType>,
	options: CommandInteractionOptionResolver<CacheType>
) {
	const server = await findServerById(interaction.guild!);

	if (server == null) {
		await addNewServerToDatabase(interaction.guild!);
	}

	const successChannel = (<unknown>options.getChannel('channel')) as TextChannel;
	if (successChannel != null) {
		await setSuccessChannel(interaction, successChannel!);
		return successChannel;
	}
}

export const showModeratorRoles = async (interaction: CommandInteraction) => {
	throwErrorIfGuildIsNull(interaction.guild);
	let server = await findServerById(interaction.guild!);

	if (server != null) {
		const embed = new EmbedBuilder()
			.setTitle(`${interaction.guild!.name} Success Bot Moderators`)
			.setThumbnail(interaction.guild!.iconURL())
			.setColor(`#00209e`)
			.setTimestamp(new Date());

		server.guild.moderatorRoles.forEach((role) => {
			embed.addFields({ name: 'Role', value: `<@&${role}>` });
		});
		return embed;
	}
};


export const clearDB = () => {
	const db = mongoose.connection;
	(async () => {
		try {
			await db.dropDatabase();
			console.log('\x1b[31m%s\x1b[0m', '[DATABASE][DELETE] Database dropped');
		} catch (error) {
			console.error(error);
		}
	})();
};
