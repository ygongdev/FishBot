require('es6-promise').polyfill();
require('isomorphic-fetch');
const numeral = require('numeral');
const Discord = require("discord.js");
const config = require("../config/config.json");

/**
 * Importing models.
 */
const Members = require("../model/Members");
const Member = require("../model/Member");

/**
 * Importing helper functions.
 */
const clanInfo = require("../helper/getClanInfo");

