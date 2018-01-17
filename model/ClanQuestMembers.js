const getMaxAttr = require("../helper/getMaxAttr");
const getStatResult = require("../helper/getStatResult");

class ClanQuestMembers {
	constructor() {
		this.members = [];
	}

	addMember(member) {
		this.members.push(member);
	}

	getSleepless() {
		return getStatResult(this.members, "highestConsecutiveHits");
	}

	getHitman() {
		return getStatResult(this.members, "frequentHits");

	}

	getThug() {
		return getStatResult(this.members, "mostDamageOnOneTitan");
	}
}

module.exports = ClanQuestMembers;