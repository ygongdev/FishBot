require('es6-promise').polyfill();
require('isomorphic-fetch');
const numeral = require('numeral');
const Discord = require("discord.js");
const config = require("../config/config.json");

const firebase = require("../config/firebaseConfig");
const database = firebase.database;
const clanRef = database.ref(`clans/${config.clanCode}/members`);

/**
 * Importing models.
 */
const Members = require("../model/Members");
const Member = require("../model/Member");

/**
 * Importing helper functions.
 */
const clanInfo = require("../helper/getClanInfo");


function getPoints(channel, displayName) {

	clanRef.once('value', function(data) {
		var clanData = data.val();
		var keys = Object.keys(clanData);
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i];
			var memberName = clanData[k].member_name;
			if (memberName.toLowerCase() === displayName.toLowerCase()) {
				memberPoints = clanData[k].points;
				break;
			}
		}
		channel.send(`${memberName} has ${memberPoints} points.`);
	});
}

module.exports = {
	getPoints: getPoints
}