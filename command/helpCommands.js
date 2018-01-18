const Discord = require("discord.js");

function getHelp(channel, prefix) {
	const embed = new Discord.RichEmbed()
	.setTitle("FishBot Commands")
	.setDescription("prefix: " + prefix)
	.addField("weekly_stats", "\tDisplays current clan accolades for the week.")
	.addField("curr_tour", "\tDisplays current tournament that is going on.")
	.addField("next_tour", "\tDisplays when and what the next tournament is.")
	.setColor(0x00AE86)
	.setFooter("FishBot | Help");

	channel.send({embed});
}

module.exports = {
	getHelp: getHelp
}