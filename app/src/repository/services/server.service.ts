import { Guild } from 'discord.js';
import ServerSchema from '../data/server.schema';

export const addNewServerToDatabase = async (guild: any) => {
	const server = await findServerById(guild);
	if (!!server) {
		return await ServerSchema.findOneAndUpdate(
			{ 'guild.id': guild.id },
			{ dateAdded: new Date() } // TODO Working but not updating with new date in DB - Look at FindOneAndUpdate
		);
	} else {
		return await ServerSchema.create({ guild });
	}
};

export const findServerById = async (guild: Guild) => {
	return await ServerSchema.findOne({ 'guild.id': guild.id });
};
