import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import mongoose from 'mongoose';

export interface DiscordUser {
	discordId: string;
	approaved: number;
	denied: number;
	submitted: number;
}

export interface DiscordCommandConfig {
	data: Partial<SlashCommandBuilder>;
	execute: (interaction: CommandInteraction) => void;
}

export interface IServerSchema extends mongoose.Document {
	guild: {
		name: string;
		id: string;
		owner: {
			discordId: string;
			discordTag: string;
		};
		botAdded: string;
	};
	users: DiscordUser[];
}
