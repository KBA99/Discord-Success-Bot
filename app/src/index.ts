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

client.on('ready', () => {
	console.log(`🤖 Bot is online and logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', (interaction: Interaction) => {});

client.on('messageCreate', (message: Message) => {
	if (!message.author.bot) {
		message.channel.send('Sends message once');
	}
});

(async function Initialize() {
	client.login(discordConfig.token);
	await connectToDatabase();
})();
