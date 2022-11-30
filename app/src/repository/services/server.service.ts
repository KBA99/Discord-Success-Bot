import { CommandInteraction, Guild } from 'discord.js';
import ServerSchema from '../data/server.schema';

export const addNewServerToDatabase = async (guild: Guild) => {
	const server = await findServerById(guild);
	if (!!server) {
		return await ServerSchema.findOneAndUpdate(
			{ 'guild.id': guild.id },
			{ dateAdded: new Date() } // TODO Working but not updating with new date in DB - Look at FindOneAndUpdate
		);
	} else {
		const joinedGuild = {
			name: guild.name,
			id: guild.id,
			owner: {
				discordId: guild.ownerId,
				discordTag: guild.ownerId, // TODO figure out how to get name later
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

	user = server?.users.find((user) => (user.discordId = discordId));

	if (user == null) {
		server = await createUserSuccessProfile(server, discordId);
		user = server?.users.find((user) => (user.discordId = discordId));
	}
	return { user, server };
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

export const increaseSuccessSubmissionByOne = async (guild: Guild, discordId: string) => {
	const { user, server } = await findUserSuccessProfile(guild, discordId);
	if (user != null || user != undefined) {
		user.submitted++;
	}
	return server?.save();
};

export const setSuccessChannel = async (interaction: CommandInteraction) => {
	throwErrorIfGuildIsNull(interaction.guild);
	const server = await findServerById(interaction.guild!);

	if (server != null) {
		server.guild.successChannel = interaction.channelId;
		await server.save();
	}
};

const throwErrorIfGuildIsNull = (guild: Guild | null) => {
	if (guild == null) {
		throw new Error('This guild is null');
	}
};
