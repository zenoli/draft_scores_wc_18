const YELLOW_CARD_POINTS = 2;
const RED_CARD_POINTS = 5;
const GOAL_POINTS = 2;
const GOALIE_GOAL_POINTS = 10;
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
	init();
    $.getJSON("drafts.json", function(drafts) {
    	$.getJSON("test_data.json", function(matches) {
    		$.each(drafts, function(idx, draft) {
    			players.push(new Player(draft["name"], draft))
    		});
	    	for (var i = 0; i < players.length; i++) {
	    		computePlayerScore(players[i], matches);
	    	}
	    	createTable();
	    	console.log("About to display log");
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
	for (var i = 0; i < matches.length; i++) {
		// Skip matches that are have not yet started.
		if (matches[i].status === "future") {
			continue;
		}

		computeKeeperScore(player, matches[i]);
		// Process home team events
		processEvents(player, matches[i], true);
		processEvents(player, matches[i], false);
	}
}


function processEvents(participant, match, isHomeTeam) {
	var events = isHomeTeam ? match.home_team_events : match.away_team_events;
	if (events === undefined || events.length == 0) {
		return;
	}
	var oponentTeam = isHomeTeam ? match.away_team.country : match.home_team.country;
	for (var i = 0; i < events.length; i++) {
		// Handle GOAL SCORES
		if (events[i].type_of_event === "goal") {
			if (updateGoalScore(participant, events[i].player)) {
				participant.goalLog.push("Goal from " + events[i].player + " against " + oponentTeam + ".");
			}
		}
		// Handle CARD SCORES
		else if (events[i].type_of_event === "yellow-card" || events[i].type_of_event === "red-card") {
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

function computeKeeperScore(participant, match) {
	goalie = participant.drafts.goalie;
	if (goalie.nation === match.home_team.country.toLowerCase()) {
		if (match.away_team.goals == 0) {
			participant.keeperScore += CLEAN_VEST_POINTS;
			participant.keeperLog.push("Clean vest from " + goalie.name + " against " + match.away_team.country);
		}
		else {
			participant.keeperScore += match.away_team.goals;
			var goalWord = match.away_team.goals > 1 ? "goals" : "goal";
			participant.keeperLog.push(goalie.name + " received " + match.away_team.goals + " " + goalWord + " against " + match.away_team.country);
		}
	}
	else if (goalie.nation === match.away_team.country.toLowerCase()) {
		if (match.home_team.goals == 0) {
			participant.keeperScore += CLEAN_VEST_POINTS;
			participant.keeperLog.push("Clean vest from " + goalie.name + " against " + match.home_team.country);
		}
		else {
			participant.keeperScore += match.home_team.goals;
			var goalWord = match.home_team.goals > 1 ? "goals" : "goal";
			participant.keeperLog.push(goalie.name + " received " + match.home_team.goals + " " + goalWord + " against " + match.home_team.country);
		}
	}
}

function updateGoalScore(participant, player) {
	if (participant.drafts.players.indexOf(player.toLowerCase()) != -1) {
		if (player.toLowerCase() === participant.drafts.goalie.name) {
			participant.goalScore += GOALIE_GOAL_POINTS;
		}
		else {
			participant.goalScore += GOAL_POINTS;
		}
		return true;
	}
	return false;
}

class Player {

	constructor(name, drafts) {
		this.name = name;
		this.drafts = drafts;

		this.goalScore = 0;
		this.assistScore = 0;
		this.cardScore = 0;
		this.keeperScore = 0;

		this.goalLog = [];
		this.goalLog.name = "Goals";
		this.assistLog = [];
		this.assistLog.name = "Assists";
		this.cardLog = [];
		this.cardLog.name = "Cards";
		this.keeperLog = [];
		this.keeperLog.name = "Keeper Stats";
	}

	total() {
		return this.goalScore + this. assistScore + this.cardScore + this.keeperScore;
	}
}


function createTable(sort = "total") {
	$('#tablebody').empty();
	createHeader();
	if (sort === "total") {
		players.sort(function(a,b) {
			return a.total() - b.total();
		});
	}
	else if (sort === goalScore) {
		player.sort(function(a,b) {
			return a.goalScore - b.goalScore;
		})
	}
	players.reverse();
	for (var i = 0; i < players.length; i++) {
		appendRow(players[i]);
	}
	
}


function createHeader() {
	var tr = document.createElement("TR");

	var thName = document.createElement("TH");
	var textName = document.createTextNode("Name");
	thName.appendChild(textName);
	tr.appendChild(thName);

	var thGoals = document.createElement("TH");
	var textGoals = document.createTextNode("Goals");
	thGoals.appendChild(textGoals);
	tr.appendChild(thGoals);

	var thAssists = document.createElement("TH");
	var textAssists = document.createTextNode("Assists");
	thAssists.appendChild(textAssists);
	tr.appendChild(thAssists);

	var thCards = document.createElement("TH");
	var textCards = document.createTextNode("Cards");
	thCards.appendChild(textCards);
	tr.appendChild(thCards);

	var thKeeper = document.createElement("TH");
	var textKeeper = document.createTextNode("Keeper");
	thKeeper.appendChild(textKeeper);
	tr.appendChild(thKeeper);

	var thTotal = document.createElement("TH");
	var textTotal = document.createTextNode("Total");
	thTotal.appendChild(textTotal);
	tr.appendChild(thTotal);

	document.getElementById("tablebody").appendChild(tr);
}


function appendRow(player) {
	var tr = document.createElement("TR");

	var tdName = document.createElement("TD");
	tdName.setAttribute("id", player.name);
	var onClickFunction = 'displayLog("' + player.name + '");';
	console.log("ONCLICKFUNCTION: " + onClickFunction);
	tdName.setAttribute("onClick", onClickFunction);
	var textName = document.createTextNode(player.name);
	tdName.appendChild(textName);
	tr.appendChild(tdName);

	var tdGoals = document.createElement("TD");
	var textGoals = document.createTextNode(player.goalScore);
	tdGoals.appendChild(textGoals);
	tr.appendChild(tdGoals);

	var tdAssists = document.createElement("TH");
	var textAssists = document.createTextNode(player.assistScore);
	tdAssists.appendChild(textAssists);
	tr.appendChild(tdAssists);

	var tdCards = document.createElement("TH");
	var textCards = document.createTextNode(player.cardScore);
	tdCards.appendChild(textCards);
	tr.appendChild(tdCards);

	var tdKeeper = document.createElement("TH");
	var textKeeper = document.createTextNode(player.keeperScore);
	tdKeeper.appendChild(textKeeper);
	tr.appendChild(tdKeeper);

	var tdTotal = document.createElement("TH");
	var textTotal = document.createTextNode(player.total());
	tdTotal.appendChild(textTotal);
	tr.appendChild(tdTotal);

	document.getElementById("tablebody").appendChild(tr);
}


function displayLog(name) {
	var titleLog = document.createElement("H3");
	console.log("IN display log: " + name);
	participant = players.find(function(e) { return e.name === name});
	titleLog.innerHTML = "Logs of " + participant.name;
	document.getElementById("logs").appendChild(titleLog);

	console.log(participant.keeperLog);
	displayList(participant.goalLog);
	displayList(participant.assistLog);
	displayList(participant.cardLog);
	displayList(participant.keeperLog);
}

function displayList(list){
	if (list.length == 0) {
		return;
	}
	var titleList = document.createElement("H2");
	titleList.innerHTML = "<b>" + list.name + "</b>";
	document.getElementById("logs").appendChild(titleList);
	var ul = document.createElement("UL");
	for (var i = 0; i < list.length; i++) {
		console.log(i);
		var li = document.createElement("LI");
		li.innerHTML = list[i];
		ul.appendChild(li);
	}
	document.getElementById("logs").appendChild(ul);
}


function init() {
	players = new Array();
	matches = null;
	drafts = null;
}
