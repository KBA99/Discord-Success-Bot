import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import mongoose from 'mongoose';

export interface DiscordUser {
	discordId: string;
	approved: number;
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
		successChannel: string;
		acceptAll: Boolean;
		moderatorRoles: string[];
	};
	users: DiscordUser[];
}

export enum ModerateOptions {
	accept_all = 'accept_all',
	moderator_role = 'moderator_role',
	show_moderators = 'show_moderators',
}
