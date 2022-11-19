import mongoose from 'mongoose';
import { IServerSchema } from '../../types/discord.interface';

const ServerSchema = new mongoose.Schema<IServerSchema>({
	guild: {
		name: {
			type: String,
			required: true,
		},
		id: {
			type: String,
			required: true,
			immutable: true,
		},
		owner: {
			discordId: {
				type: String,
				required: true,
				immutable: true,
			},
			discordTag: {
				type: String,
				required: true,
				immutable: true,
			},
		},
		dateAdded: {
			type: Number,
			required: true,
			default: () => new Date().getTime(),
			immutable: false,
		},
	},
	users: [
		{
			discordId: String,
			approved: Number,
			denied: Number,
			submitted: Number,
		},
	],
});

export default mongoose.model<IServerSchema>('Server', ServerSchema);
