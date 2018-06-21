const YELLOW_CARD_POINTS = 2;
const RED_CARD_POINTS = 5;
const GOAL_POINTS = 2;
const ASSIST_POINTS = 2;
const CLEAN_VEST_POINTS = 3;


var drafts;
var matches;
var players = new Array();
/*
function loadDraftsAndMatches() {
	var drafts;
	var matches;
	$.when(
		$.getJSON("drafts.json", function(data) {
			drafts = data;
		}),
		$.getJSON("test_data.json", function(data) {
			matches = data;
		})
	).then(computeScores(drafts, matches));
}

function computeScores(drafts, matches) {
	for (var d : drafts){
		players.push(new Player(draft["name"], draft));
	}
}
*/


function sayHello()
{
	alert("Hello there");
}


function getDraftsJSON() {
    $.getJSON("drafts.json", function(drafts) {
    	$.getJSON("test_data.json", function(matches) {
    		$.each(drafts, function(idx, draft) {
    			players.push(new Player(draft["name"], draft))
    		});
    		console.log(players);
	    	for (var i = 0; i < players.length; i++) {
	    		computePlayerScore(players[i], matches);
	    	}
    	});
    });
}

function getMatchesJSON() {
    $.getJSON("test_data.json", function(data) {
    	matches = data;
    });
}


function debugPlayers() {
	alert(players[0].name);
	alert(players[0].drafts);
}



function computePlayerScore(player, matches) {
	console.log("Computing score of: " + player.name);
	for (var i = 0; i < matches.length; i++) {
		// Skip matches that are have not yet started.
		if (matches[i].status === "future") {
			continue;
		}
		// Process home team events
		processEvents(player, matches[i], true);
		processEvents(player, matches[i], false);
		//console.log(matches[i].home_team_events[0].player);
		var events = matches[i]["home_team_events"].concat(matches[i]["away_team_events"]);
		for (var e in matches[i].home_team_events) {
			if (e["type_of_event"] === "yellow-card") {
				if (updateYellowCardScore(player, e["player"])) {
					player.cardLog.push("Yellow card for " + e["player"] + " against " + match["home_team"]["country"] + ".");
				}
			}
		}
	}
	console.log(player.cardLog);
}


function processEvents(participant, match, isHomeTeam) {
	var events = isHomeTeam ? match.home_team_events : match.away_team_events;
	if (events === undefined || events.length == 0) {
		return;
	}
	var oponentTeam = isHomeTeam ? match.away_team.country : match.home_team.country;
	for (var i = 0; i < events.length; i++) {
		if (events[i].type_of_event === "yellow-card" || events[i].type_of_event === "red-card") {
			var isYellow = events[i].type_of_event === "yellow-card";
			var cardName = isYellow ? "Yellow" : "Red";
			if (updateCardScore(participant, events[i].player, isYellow)) {
				participant.cardLog.push(cardName + " card for " + events[i].player + " against " + oponentTeam + ".");
			}
		}
	}
}


function updateCardScore(participant, player, isYellow = true) {
	if (participant.drafts.players.indexOf(player.toLowerCase()) != -1) {
		participant.cardScore += isYellow ? YELLOW_CARD_POINTS : RED_CARD_POINTS;
		return true;
	}
	return false;
}

class Player {

	constructor(name, drafts) {
		this.name = name;
		this.drafts = drafts;

		this.goalScore = 0;
		this.cardScore = 0;
		this.assistScore = 0;
		this.keeperScore = 0;

		this.goalLog = [];
		this.cardLog = [];
		this.assistLog = [];
		this.keeperLog = [];
	}
}

