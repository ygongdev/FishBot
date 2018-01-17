require('es6-promise').polyfill();
require('isomorphic-fetch');

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config/config.json");
const Members = require("./model/Members");
const Member = require("./model/Member");
const ClanQuestMember = require("./model/ClanQuestMember");
const ClanQuestMembers = require("./model/ClanQuestMembers");

const weeklyStatsCommand = require("./command/weeklyStatsCommands");
const tournamentCommands = require("./command/tournamentCommands");

const timestampFromSnowflake = (id) => {
	return (id / 4194304) + 1420070400000;
};

client.on("ready", () => {
	console.log("I am ready!");
});

// Create an event listener for messages
client.on("message", message => {
	if (!message.content.startsWith(config.prefix) || message.author.bot) {
		return;
	} else if (message.content === "!tour") {
    message.channel.send(message.guild.memberCount);
  } else if (message.content === "!weekly_stats") {
		try {
			weeklyStatsCommand(message);
		} catch (error) {
			message.channel.send('sorry, an error happened.');
		}
	} else if (message.content === "!curr_tour") {
		tournamentCommands.getCurrentTournament(message);
	} else if (message.content === "!next_tour") {
		tournamentCommands.getNextTournament(message);
	}
});

client.login(config.token);