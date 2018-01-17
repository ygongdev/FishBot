require('es6-promise').polyfill();
require('isomorphic-fetch');
const Discord = require("discord.js");
const config = require("../config/config.json");
const Members = require("../model/Members");
const Member = require("../model/Member");
const ClanQuestMember = require("../model/ClanQuestMember");
const ClanQuestMembers = require("../model/ClanQuestMembers");

const flatten = require("../helper/flatten");
const getFrequentHits = require("../helper/getFrequentHits");
const getHighestConsecutiveHits = require("../helper/getHighestConsecutiveHits");

const baseGoogleSpreadsheetUrl = "https://sheets.googleapis.com/v4/spreadsheets/";

function getMembersInfo() {
	const minRow = 4;
	const maxRow = 53;

	return fetch(`${baseGoogleSpreadsheetUrl}${config.spreadSheetId}/values/Summary!B${minRow}:K${maxRow}?key=${config.googleSpreadsheetApiKey}`)
	.then((response) => response.json())
	.then((data) => {
		const newMembers = new Members();
		const membersInfo = data.values;
		membersInfo.map((memberInfo) => {
			if (memberInfo[1]) {
				let member = getMemberInfo(memberInfo);
				member.total = parseInt(member.total);
				member.averageDamage = parseFloat(member.averageDamage);
				member.lastWeekAverage = parseFloat(member.lastWeekAverage);
				// Remove % for easier calculations
				member.averageMargin = parseInt(member.averageMargin.replace("%", ""));
				member.MS = parseInt(member.MS);
				member.MSLastWeek = parseInt(member.MSLastWeek);
				member.increase = parseInt(member.increase);
				member.joinedDiscord = member.joinedDiscord === "TRUE" ? true : false;
				newMembers.addMember(member);
			}
		});
		return newMembers;
	});
}

function getMemberInfo(memberData) {
	return new Member(...memberData);
}

function getClanQuestMembersInfo() {
	const minRow = 4;
	const maxRow = 38;

	return fetch(`${baseGoogleSpreadsheetUrl}${config.spreadSheetId}/values/Summary!Q${minRow}:BO${maxRow}?key=${config.googleSpreadsheetApiKey}&majorDimension=COLUMNS`)
	.then((response) => response.json())
	.then((data) => {
		let newCQMembers = new ClanQuestMembers();
		let CQData = data.values;

		for (let i = 1; i < CQData.length; i++) {
			let CQ = CQData[i];
			if (CQ[0]) {
				const member = getClanQuestMemberInfo(CQ);
				newCQMembers.addMember(member);
			}
		}
		return newCQMembers;
	});
}

function getClanQuestMemberInfo(memberData) {
	// Convert consecutive hits into an array.
	let hits = memberData.slice(1,29).map((hit) => {
		if (!hit) {
			hit = 0;
		}
		return parseInt(hit);
	});

	const member = new ClanQuestMember(
		name=memberData[0],
		hits=hits,
		totalDamage=memberData[29],
		averageDamage=memberData[30],
		maxStage=memberData[31],
		joinedDiscord=memberData[32],
		lastWeekAverage=memberData[33],
		lastWeekMS=memberData[34],
		highestConsecutiveHits=getHighestConsecutiveHits(hits),
		frequentHits=getFrequentHits(hits),
		mostDamageOnOneTitan=Math.max(...hits)
	)

	return member;
}

function weeklyStatsCommand(message) {
	Promise.all([getMembersInfo(), getClanQuestMembersInfo()])
	.then((data) => {
		const dateRange = getWeekRangeForSunday();
		const inspired = data[0].getInspired();
		const sleepless = data[1].getSleepless();
		const hitman = data[1].getHitman();
		const coinShot = data[0].getCoinShot();
		const thug = data[1].getThug();

		const embed = new Discord.RichEmbed()
			.setTitle("**༺Mistborn Accolades༻**")
			.setAuthor(`Weekly Statistics Report (${dateRange})`, `attachment://report.png`)
			.setColor(0x00AE86)
			.setDescription(
				`**Inspired** - ${inspired.stat.toLocaleString()}% average damage increase from last week.\n` +
				`${inspired.names.join(", ")}\n` +
				`**Sleepless** - ${sleepless.stat} Titanlords hit in a row.\n` +
				`${sleepless.names.join(", ")}\n` +
				`**Hitman** - ${hitman.stat}/28 Titanlords hit\n` +
				`${hitman.names.join(", ")}\n` +
				`**Coin Shot** - ${coinShot.stat.toLocaleString()} stages advanced since last week.\n` +
				`${coinShot.names.join(", ")}\n` +
				`**Thug** - ${thug.stat.toLocaleString()} damage done to one Titanlord.\n` +
				`${thug.names.join(", ")}\n`
			)
			.attachFile('./report.png')
			.setTimestamp();

		message.channel.send({embed});
	})
	.catch((error) => {throw error});
}

function getWeekRangeForSunday() {
	let startDate = new Date();
	let endDate = new Date();
	let currentDate = new Date();

	 if (currentDate.getDay() === 0) {
		startDate.setDate(currentDate.getDate() - 7);
		endDate = currentDate;
	 } else {
		startDate.setDate(currentDate.getDate() - currentDate.getDay());
		endDate.setDate(startDate.getDate() + 7);
	}

	return `${startDate.getMonth()+1}/${startDate.getDate()}/${startDate.getFullYear()} - ${endDate.getMonth()+1}/${endDate.getDate()}/${endDate.getFullYear()}`;
}

module.exports = weeklyStatsCommand;