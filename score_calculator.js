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
	    	for (var p in players) {
	    		computePlayerScore(p, matches);
	    	}
    		debugPlayers();
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
	alert(matches[0].venue);
	for (var i = 0; i < matches.length; i++) {
		alert(matches[i].home_team_events[0].player);
		var events = matches[i]["home_team_events"].concat(matches[i]["away_team_events"]);
		alert("finish");
		for (var e in events) {
			if (e["type_of_event"] === "yellow-card") {
				if (updateYellowCardScore(player, e["player"])) {
					player.cardLog.push("Yellow card for " + e["player"] + " against " + match["home_team"]["country"] + ".");
				}
			}
		}
	}
}


function updateYellowCardScore(player, footballer) {

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

