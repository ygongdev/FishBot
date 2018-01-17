const firebase = require("../config/firebaseConfig");
const database = firebase.database;
const tournamentRef = database.ref("tournament");
const Discord = require("discord.js");
const schedule = require('node-schedule');

const types = [
	"There is no bonus during this tournament.",
	"All heroes do 5x damage.",
	"All melee heroes do 8x damage.",
	"All ranged heroes do 8x damage.",
	"All spell heroes do 8x damage.",
	"Your taps will do 5x damage.",
	"You will regenerate +4 mana per minute.",
	"Your mana capacity will be increased by 200.",
	"You will have 100% chance of receiving double fairy rewards.",
	"Your critical hit chance will increase 40%.",
];

const rewards = [
	"Shards + Pets",
	"Weapon Upgrades + Fortune",
	"Skill Points + Perks"
]

const tournamentUTCDays = [0, 3];
const tournamentUTCHour = 0;

function getCurrentTournament(message) {
	tournamentRef.once('value')
	.then((snapshot) => {
		if (isTournamentOn()) {
			const data = snapshot.val();
			const rewardCounter = data["rewardCounter"];
			const typeCounter = data["typeCounter"]
			const timeRemaining = getTimeLeft();
			const embed = new Discord.RichEmbed()
			.setTitle(`**There is a tournament currently going on. Go go go!**\n`)
			.setDescription(
				`**Type**: ${types[typeCounter]}\n` +
				`**Reward**: ${rewards[rewardCounter]}\n` +
				`**Time Remaining to join**: ${timeRemaining.days} Days ${timeRemaining.hours} Hours ${timeRemaining.minutes} Minutes ${timeRemaining.seconds} Seconds\n`
			);
			message.channel.send({embed});
		} else {
			const embed = new Discord.RichEmbed()
			.setTitle(`No tournament is currently going on.\n`)
			.setDescription(
				`Use **!next_tour** to ask about the next tournament.\n`
			);
			message.channel.send({embed});
		}
	})
}

function getNextTournament(message) {
	tournamentRef.once('value')
	.then((snapshot) => {
		const currentDate = new Date();
		let nextDate = new Date();
		// Next tournament has to be sunday
		if (currentDate.getUTCDay() >= 3) {
			nextDate.setUTCDate(currentDate.getUTCDate() + (7 - currentDate.getUTCDay()));
		} else {
			nextDate.setUTCDate(currentDate.getUTCDate() + (3 - currentDate.getUTCDay()));
		}
		nextDate.setUTCHours(0);
		nextDate.setUTCMinutes(0);
		nextDate.setUTCSeconds(0);
		nextDate.setUTCMilliseconds(0);

		const data = snapshot.val();
		const rewardCounter = (data["rewardCounter"] + 1) % rewards.length;
		const typeCounter = (data["typeCounter"] + 1) % types.length;
		const timeRemaining = getTimeDifference(currentDate, nextDate);
		const embed = new Discord.RichEmbed()
		.setTitle(`**Next tournament**`)
		.setDescription(
			`**Type**: ${types[typeCounter]}\n` +
			`**Reward**: ${rewards[rewardCounter]}\n` +
			`**Time Remaining until you can join**: ${timeRemaining.days} Days ${timeRemaining.hours} Hours ${timeRemaining.minutes} Minutes ${timeRemaining.seconds} Seconds\n`
		);
		message.channel.send({embed});
	});
}

function isTournamentOn() {
	const currentDate = new Date();
	return tournamentUTCDays.indexOf(currentDate.getUTCDay()) > -1;
}

function getTimeLeft() {
	const currentDate = new Date();
	const endDate = new Date();
	endDate.setUTCDate(currentDate.getUTCDate() + 1);
	endDate.setUTCHours(0);
	endDate.setUTCMinutes(0);
	endDate.setUTCSeconds(0);
	endDate.setUTCMilliseconds(0);
	return getTimeDifference(endDate, currentDate);
}


function getTimeDifference(date1, date2) {
	// get total seconds between the times
	let delta = Math.abs(date1 - date2) / 1000;

	// calculate (and subtract) whole days
	const days = Math.floor(delta / 86400);
	delta -= days * 86400;

	// calculate (and subtract) whole hours
	const hours = Math.floor(delta / 3600) % 24;
	delta -= hours * 3600;

	// calculate (and subtract) whole minutes
	const minutes = Math.floor(delta / 60) % 60;
	delta -= minutes * 60;

	// what's left is seconds
	const seconds = Math.floor(delta % 60);  // in theory the modulus is not required

	return {
		days: days,
		hours: hours,
		minutes: minutes,
		seconds: seconds,
	}
}

/**
 * 12 AM Wednesday and Sunday UTC is 6 PM Tuesday, Saturday my time.
 */
const counterUpdate = schedule.scheduleJob('0 18 * * 2,6', function(){
	tournamentRef.once('value')
	.then((snapshot) => {
		const data = snapshot.val();
		const typeCounter = data["typeCounter"];
		const rewardCounter = data["rewardCounter"];

		tournamentRef.set({
			typeCounter: (typeCounter + 1) % types.length,
			rewardCounter: (rewardCounter + 1) % rewards.length
		});
		console.log('counter has been updated');
	});
});

module.exports = {
	getCurrentTournament: getCurrentTournament,
	getNextTournament: getNextTournament,
}