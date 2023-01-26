import {
	CacheType,
	CommandInteraction,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	Guild,
	Message,
	Role,
	TextChannel,
} from 'discord.js';
import mongoose from 'mongoose';
import { AdminActivationAction } from '../../types/AdminActivationOptions';
import { DiscordUser } from '../../types/discord.interface';
import { Logger } from '../../utils/Logger';
import ServerSchema from '../data/server.schema';

export const addNewServerToDatabase = async (guild: Guild): Promise<void> => {
	const server = await findServerByGuild(guild);

	if (!!server) {
		server.guild.dateAdded = new Date().toString();
		await server.save();
	} else {
		let ownerNameAndDiscriminator;
		guild.client.users.cache.find((user) => {
			if (user.id == guild.ownerId) {
				ownerNameAndDiscriminator = user.username + '#' + user.discriminator;
			}
		});

		await ServerSchema.create({
			guild: {
				name: guild.name,
				id: guild.id,
				owner: {
					discordId: guild.ownerId,
					discordTag: ownerNameAndDiscriminator,
				},
			},
		});
		Logger.info(`[Database] New server: ${guild.name} added to database`);
	}
};

export const acceptSuccess = async (guild: Guild, discordId: string) => {
	const server = await findServerByGuild(guild);
	throwErrorIfNull(guild);

	const user = await findUserSuccessProfile(guild, discordId);
	throwErrorIfNull(user);

	server!.users.find((user) => {
		user.discordId == discordId;
	})!.approved++;

	server!.save();
};

export const denySuccess = async (guild: Guild, discordId: string) => {
	const server = await findServerByGuild(guild);
	throwErrorIfNull(server);

	const user = await findUserSuccessProfile(guild, discordId);
	throwErrorIfNull(user);

	server!.users.find((user) => {
		user.discordId == discordId;
	})!.denied++;

	server!.save();
};

// export const findUserSuccessProfile = async (guild: Guild, discordId: string) => {
// 	const server = await findServerByGuild(guild);
// 	throwErrorIfNull(server);

// 	const user = server!.users.find((user) => user.discordId == discordId);

// 	if (user == null) {
// 		return await createUserSuccessProfile(guild, discordId);
// 	}

// 	return user;
// };

export const findUserSuccessProfile = async (
	guild: Guild,
	discordId: string
): Promise<DiscordUser | undefined> => {
	// const server = await findServerByGuild(guild);
	// throwErrorIfNull(server);

	// const user = server?.users.find((user) => user.discordId == discordId);

	// if (user == null) {
	// 	return await createUserSuccessProfile(guild, discordId);
	// }

	// return user;

	const user = await ServerSchema.findOne({ 'users.discordId': discordId }, 'users.$');

	if (user?.users[0] == null) {
		return await createUserSuccessProfile(guild, discordId);
	}

	return user?.users[0];
};

export const findTopSuccessProfiles = async (guild: Guild, number: number = 15) => {
	const server = await findServerByGuild(guild);
	throwErrorIfNull(guild);
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

const createUserSuccessProfile = async (guild: Guild, discordId: string): Promise<DiscordUser> => {
	const server = await findServerByGuild(guild);
	throwErrorIfNull(server);

	const user = {
		discordId: discordId,
		approved: 0,
		denied: 0,
		submitted: 0,
	};
	server?.users.push(user);
	await server?.save();
	return user;
};

export const findServerByGuild = async (guild: Guild) => {
	let server = await ServerSchema.findOne({ 'guild.id': guild.id });

	while (server == null) {
		await addNewServerToDatabase(guild);
		server = await ServerSchema.findOne({ 'guild.id': guild.id });
	}

	return server;
};

export const getDiscordTagAndDiscriminator = (guild: Guild, id: string) => {
	const user = guild.client.users.cache.get(id);
	return user?.username + '#' + user?.discriminator + ' | ' + `<@${user?.id}>`;
};

export const getDiscordUserById = (guild: Guild, id: string) => {
	return guild.client.users.cache.get(id);
};

export const increaseSuccessSubmissionByOne = async (guild: Guild, discordId: string) => {
	const user = await findUserSuccessProfile(guild, discordId);
	throwErrorIfNull(user);
	user.submitted++;

	const server = await findServerByGuild(guild);
	throwErrorIfNull(server);

	server!.users.find((user) => {
		user.discordId == discordId;
	})!.approved++;

	await server!.save();
};

export const setSuccessChannel = async (
	interaction: CommandInteraction,
	successChannel: TextChannel
) => {
	throwErrorIfNull(interaction.guild);
	const server = await findServerByGuild(interaction.guild!);

	if (server != null) {
		server.guild.successChannel = successChannel.id;
		await server.save();
	}
};

export const setAutomaticAccept = async (
	interaction: CommandInteraction,
	acceptAll: boolean = false
) => {
	const server = await findServerByGuild(interaction.guild!);
	throwErrorIfNull(server);

	server!.guild.acceptAll = acceptAll;
	await server!.save();
};

export const modifyModerationRole = async (
	interaction: CommandInteraction,
	role: Role,
	action: AdminActivationAction
) => {
	throwErrorIfNull(interaction.guild);
	let server = await findServerByGuild(interaction.guild!);

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
		await server.save();
	}
};

export async function registerSuccessChannel(
	interaction: CommandInteraction<CacheType>,
	options: CommandInteractionOptionResolver<CacheType>
): Promise<TextChannel> {
	let server = await findServerByGuild(interaction.guild!);
	let successChannel: TextChannel | undefined;

	if (server == null) {
		await addNewServerToDatabase(interaction.guild!);
		server = await findServerByGuild(interaction.guild!);
	}

	successChannel = <TextChannel>options.getChannel('channel');
	throwErrorIfNull(successChannel);

	await setSuccessChannel(interaction, successChannel!);

	return successChannel;
}

export const showModeratorRoles = async (interaction: CommandInteraction) => {
	throwErrorIfNull(interaction.guild);
	let server = await findServerByGuild(interaction.guild!);

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

const throwErrorIfNull = <T>(object: T) => {
	if (object === null || object === undefined) {
		throw new Error(`${object} is null or undefined.`);
	}
};

export async function increaseSuccessSubmissionAndAcceptSuccess(message: Message<boolean>) {
	await increaseSuccessSubmissionByOne(message.guild!, message.author.id);
	await acceptSuccess(message.guild!, message.author?.id!);
	await message.react('🥇');
}

export const clearDB = () => {
	const db = mongoose.connection;
	(async () => {
		try {
			await db.dropDatabase();
			Logger.warn('[DATABASE][DELETE] Database dropped');
		} catch (error) {
			console.error(error);
		}
	})();
};
