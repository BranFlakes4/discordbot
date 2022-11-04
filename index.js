const fs = require('node:fs');
const path = require('node:path');
// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

//IDs of roles which buttons can apply
const ROLES = {
	OW: '1032695886180012042',
	VAL: '1032695932409622528',
	FN: '1032695985173962802',
	MC: '1032696012554387476',
	RL: '1032696040266141726',
}

//list of custom emoji IDs
const OW = '<:OW:1037076408436002897>';
const VAL = '<:VAL:1037077098340290711>';
const MW = '<:MW:1037077106099769364>';
const MC = '<:MC:1037077091138678835>';
const RL = '<:RL:1037076954148519966>';

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
	//channel in which role list will be sent
	const channel = client.channels.cache.get('1037075189906813058');
	//toggles sending role list on startup
	var sendRoleMessage = true;
	if (sendRoleMessage == true) {
		channel.send({
			content: 'Select Your Role(s)',
			//list of roles/buttons
			components: [
				new ActionRowBuilder().setComponents(
					new ButtonBuilder()
						.setCustomId('ow')
						//.setLabel('Overwatch')
						.setEmoji(OW)
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('val')
						//.setLabel('Valorant')
						.setEmoji(VAL)
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('mw')
						//.setLabel('Modern Warfare')
						.setEmoji(MW)
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('mc')
						//.setLabel('Minecraft')
						.setEmoji(MC)
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('rl')
						//.setLabel('Rocket League')
						.setEmoji(RL)
						.setStyle(ButtonStyle.Primary)
				)
			],
		});
	}
});

client.on('interactionCreate', async interaction => {
	
	//gets command name if not a text input
	if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

	//exits code if not a command
	if (!command) return;

	//waits for commands
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.on('interactionCreate', interaction => {
	
	//executes if button is pressed
	if (interaction.isButton()) {
		//gets the name of the role which corresponds with the button's custom ID
		const role = interaction.guild.roles.cache.get(
			ROLES[interaction.customId.toUpperCase()]
		);

		//responds if role does not exist
		if (!role) 
			return interaction.reply({ content: 'Role not found', ephemeral: true });

		return interaction.member.roles
			//gives role to user
			.add(role)
			//sends ephemeral message to notify user of gained role
			.then((interaction
				.reply({ 
					content: `The ${role} was added to you ${interaction.member}.`,
					ephemeral: true,
					})
				));
	}
});

// Login to Discord with your client's token
client.login(token);