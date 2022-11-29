import { Guild } from 'discord.js';
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
