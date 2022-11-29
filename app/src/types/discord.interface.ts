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
		dateAdded: string;
	};
	users: DiscordUser[];
}
