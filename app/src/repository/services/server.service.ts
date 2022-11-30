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

export const findServerById = async (guild: Guild) => {
	return await ServerSchema.findOne({ 'guild.id': guild.id });
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
