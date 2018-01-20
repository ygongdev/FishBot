const Discord = require("discord.js");
const config = require("../config/config.json");

function getHelp(channel) {
	const embed = new Discord.RichEmbed()
	.setTitle("FishBot Commands")
	.setDescription(`prefix: ${config.prefix}`)
	.addField("weekly_stats", "\tDisplays current clan accolades for the week.")
	.addField("my_stats", "\tDisplays your clan stats.")
	.addField("stats [name]", "\tDisplays clan stats of another member")
	.addField("curr_tour", "\tDisplays current tournament that is going on.")
	.addField("next_tour", "\tDisplays when and what the next tournament is.")
	.addField("top_damage [number]", "\tDisplays the members with the top total damage.")
	.addField("just_do_it", "\tDisplays the just do it gif.")
	.setColor(0x00AE86)
	.setFooter("FishBot | Help");

	channel.send({embed});
}

module.exports = {
	getHelp: getHelp
}