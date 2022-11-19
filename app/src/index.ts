import { Interaction, GatewayIntentBits, Message } from 'discord.js';
import { Client } from 'discord.js';
import { discordConfig } from '~/config';
import { connectToDatabase } from './repository/database.connect';

export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
	],
});

(async function Initialize() {
	client.login(discordConfig.token);
	await connectToDatabase();
})();
