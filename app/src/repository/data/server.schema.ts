import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
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
		botAdded: {
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

export default mongoose.model('Server', serverSchema);
