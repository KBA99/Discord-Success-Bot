import {
	Interaction,
	GatewayIntentBits,
	Message,
	Collection,
	Client,
	Routes,
	REST,
	Guild,
	Partials,
} from 'discord.js';
import path from 'node:path';
import fs from 'node:fs';
import { discordConfig } from '~/config';
import { connectToDatabase } from './repository/database.connect';
import { DiscordCommandConfig } from './types/discord.interface';
import {
	acceptSuccess,
	addNewServerToDatabase,
	denySuccess,
	increaseSuccessSubmissionByOne,
} from './repository/services/server.service';

export const client = new Client({
	partials: [Partials.Channel, Partials.User, Partials.GuildMember],
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
	],
});

/* ----------------------------- Commands Setup ----------------------------- */
const commands = new Collection<string, DiscordCommandConfig>();

const commandFiles = fs
	.readdirSync(path.join(__dirname, 'commands'))
	.filter((file) => file.endsWith('.ts'));

for (const file of commandFiles) {
	const command = require(path.join(__dirname, 'commands', file)).default;
	const commandName = command.data.name;
	commands.set(commandName, command);
}

const commandConfig = commands.map((command) => command.data);
const rest = new REST({ version: '10' }).setToken(discordConfig.token);

rest.put(Routes.applicationGuildCommands(discordConfig.clientId, discordConfig.guildId), {
	body: commandConfig,
})
	.then(() =>
		console.log(
			'\x1b[35m%s\x1b[0m',
			'[Initialize][Discord] Successfully registered application commands.'
		)
	)
	.catch(() => console.log(process.env));

client.on('ready', () => {
	console.log(`🤖 Bot is online and logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', async (interaction: Interaction) => {
	if (!interaction.isCommand()) return;
	const command = commands.get(interaction.commandName);

	try {
		command?.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true,
		});
	}
});

client.on('messageCreate', async (message: Message) => {
	await addReactionsToMessageIfAttachment(message);
});

client.on('messageReactionAdd', async (event, user) => {
	if (!user.bot) {
		await event.message.reactions.removeAll();

		if (event.emoji.name == '✅') {
			await acceptSuccess(event.message.guild!, event.message.author?.id!);
			await event.message.react('🥇');
		}

		if (event.emoji.name == '❌') {
			await denySuccess(event.message.guild!, event.message.author?.id!);
			await event.message.react('❎');
		}
	}
});

client.on('guildCreate', async (guild: Guild) => {
	await addNewServerToDatabase(guild);
});

const addReactionsToMessageIfAttachment = async (message: Message) => {
	// Add a check for if content type includes image
	if (!message.author.bot) {
		if (message.attachments.size >= 1) {
			await increaseSuccessSubmissionByOne(message.guild!, message.author.id);
			message.react('✅');
			message.react('❌');
		}
	}
};

(async function Initialize() {
	client.login(discordConfig.token);
	await connectToDatabase();
})();
