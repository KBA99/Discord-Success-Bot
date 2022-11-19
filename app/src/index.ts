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

client.on('messageCreate', async (message: Message) => {
	await addReactionsToMessageIfAttachment(message);
});
const addReactionsToMessageIfAttachment = async (message: Message) => {
	// Add a check for if content type includes image
	if (!message.author.bot) {
		if (message.attachments.size >= 1) {
			message.react('✅');
			message.react('❌');
		}
	}
};

(async function Initialize() {
	client.login(discordConfig.token);
	await connectToDatabase();
})();
