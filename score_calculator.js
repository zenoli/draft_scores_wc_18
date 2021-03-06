const YELLOW_CARD_POINTS = 2;
const RED_CARD_POINTS = 8;
const GOAL_POINTS = 2;
const GOALIE_GOAL_POINTS = 10;
const ASSIST_POINTS = 1;
const CLEAN_VEST_POINTS = 3;


var drafts, matches, assists;
var players = new Array();


function updateScores() {
	// Parses drafts and matches jsons, compute the scores and updates the html table.
	reset();
	// fetch 'drafts.json'
    $.getJSON("drafts.json", function(drafts) {
    	$.getJSON("assists.json", function(assists) {
	    	// fetsch matches json
	    	$.getJSON("https://worldcup.sfg.io/matches", function(matches) {
	    		// initialize players
	    		$.each(drafts, function(idx, draft) {
	    			players.push(new Player(draft["name"], draft))
	    		});
	    		// compute player scores
		    	for (var i = 0; i < players.length; i++) {
		    		computePlayerScore(players[i], matches, assists);
		    	}
		    	// create html table
		    	createTable();
	    	});
	    });
    });
}


function computePlayerScore(player, matches, assists) {
	// compute assist score separately
	computeAssistScore(player, assists);
	// iterates through all matches and computes the score for 'player'
	for (var i = 0; i < matches.length; i++) {
		// Skip matches that are have not yet started.
		if (matches[i].status === "future") {
			continue;
		}
		computeKeeperScore(player, matches[i]);
		processEvents(player, matches[i], true);
		processEvents(player, matches[i], false);
	}
}


function computeAssistScore(participant, assists) {
	for (var i = 0; i < assists.length; i++) {
		if (participant.drafts.players.indexOf(assists[i].name.toLowerCase()) != -1) {
			console.log(participant.name + "gets assist for " + assists[i].name);
			participant.assistScore += ASSIST_POINTS * assists[i].assists;
			var assistWord = assists[i].assists > 1 ? " assists" : " assist";
			var pointWord = assists[i].assists > 1 ? " PTS)" : " PT)";
			participant.assistLog.push(assists[i].assists + assistWord + " from " + assists[i].name + ". (" + assists[i].assists + pointWord);
		}
	}
}

function processEvents(participant, match, isHomeTeam) {
	var events = isHomeTeam ? match.home_team_events : match.away_team_events;
	if (events === undefined || events.length == 0) {
		return;
	}
	var team = isHomeTeam ? match.home_team.country : match.away_team.country;
	var oponentTeam = isHomeTeam ? match.away_team.country : match.home_team.country;

	for (var i = 0; i < events.length; i++) {
		// Ignore events of Carlos Sanchez from Colombia.
		if (events[i].player.toLowerCase() === "carlos sanchez" && team.toLowerCase() === "colombia") {
			continue;
		}
		var time = events[i].time + ": ";
		// Handle GOAL SCORES
		if (events[i].type_of_event === "goal" || events[i].type_of_event === "goal-penalty") {
			if (updateGoalScore(participant, events[i].player)) {
				participant.goalLog.push(time + "Goal from " + events[i].player + " against " + oponentTeam + ". (" + GOAL_POINTS + " PTS)");
			}
		}
		// Handle CARD SCORES
		else if (events[i].type_of_event === "yellow-card" 
			  || events[i].type_of_event === "yellow-card-second"
			  || events[i].type_of_event === "red-card") {
			var isYellow = events[i].type_of_event === "yellow-card" || events[i].type_of_event === "yellow-card-second";
			var cardName = isYellow ? "Yellow" : "Red";
			if (updateCardScore(participant, events[i].player, isYellow)) {
				var points = isYellow ? YELLOW_CARD_POINTS : RED_CARD_POINTS;
				participant.cardLog.push(time + cardName + " card for " + events[i].player + " against " + oponentTeam + ". (" + points + " PTS)");
			}
		}
	}
}


function updateCardScore(participant, player, isYellow = true) {
	if (participant.drafts.players.indexOf(player.toLowerCase()) != -1) {
		/*// TODO: Fix this by storing players as {"name":"carlos sanches", "country":"uruguay"}
		if(!isYellow && player === "Carlos SANCHEZ") {
			return false;
		}*/
		participant.cardScore += isYellow ? YELLOW_CARD_POINTS : RED_CARD_POINTS;
		return true;
	}
	return false;
}

function computeKeeperScore(participant, match) {
	var goalie = participant.drafts.goalie;
	var goalieName = capitalize(goalie.name);
	var playingGoalieH = match.home_team_statistics.starting_eleven[0].name.toLowerCase();
	var playingGoalieA = match.away_team_statistics.starting_eleven[0].name.toLowerCase();
	var isPlaying = goalie.name === playingGoalieH || goalie.name === playingGoalieA;
	if (goalie.nation === match.home_team.country.toLowerCase()) {
		if (!isPlaying) {
			participant.keeperLog.push(goalieName + " was not playing against " + match.away_team.country + ". Better luck next time " + participant.name +"! (0 PTS).");
			return;
		}
		if (match.away_team.goals == 0) {
			participant.keeperScore += CLEAN_VEST_POINTS;
			participant.keeperLog.push("Clean vest from " + goalieName + " against " + match.away_team.country + ". (" + CLEAN_VEST_POINTS + " PTS)");
		}
		else {
			participant.keeperScore += match.away_team.goals;
			var goalWord = match.away_team.goals > 1 ? "goals" : "goal";
			var pointWord = match.away_team.goals > 1 ? " PTS)" : " PT)";
			participant.keeperLog.push(goalieName + " received " + match.away_team.goals + " " + goalWord + " against " + match.away_team.country + ". (" + match.away_team.goals + pointWord);
		}
	}
	else if (goalie.nation === match.away_team.country.toLowerCase()) {
		if (!isPlaying) {
			participant.keeperLog.push(goalie.name + " was not playing against " + match.home_team.country  + ". Better luck next time " + participant.name +"! (0 PTS).");
			return;
		}
		if (match.home_team.goals == 0) {
			participant.keeperScore += CLEAN_VEST_POINTS;
			participant.keeperLog.push("Clean vest from " + goalieName + " against " + match.home_team.country + ". (" + CLEAN_VEST_POINTS + " PTS)");
		}
		else {
			participant.keeperScore += match.home_team.goals;
			var goalWord = match.home_team.goals > 1 ? "goals" : "goal";
			var pointWord = match.away_team.goals > 1 ? " PTS)" : " PT)";
			participant.keeperLog.push(goalieName + " received " + match.home_team.goals + " " + goalWord + " against " + match.home_team.country + ". (" + match.home_team.goals + pointWord);
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
		return this.goalScore + this.assistScore + this.cardScore + this.keeperScore;
	}
}


function createTable(sort = "Total") {
	$('#tablebody').empty();
	createHeader(sort);
	if (sort === "Total") {
		players.sort(function(a,b) {
			return a.total() - b.total();
		});
	}
	else if (sort === "Goals") {
		players.sort(function(a,b) {
			return a.goalScore - b.goalScore;
		})
	}
	else if (sort === "Assists") {
		players.sort(function(a,b) {
			return a.assistScore - b.assistScore;
		})
	}
	else if (sort === "Cards") {
		players.sort(function(a,b) {
			return a.cardScore - b.cardScore;
		})
	}
	else if (sort === "Keeper Stats") {
		players.sort(function(a,b) {
			return a.keeperScore - b.keeperScore;
		})
	}
	//players.reverse();
	for (var i = players.length - 1; i >= 0; i--) {
		appendRow(players[i]);
	}
	
}


function createHeader(selected) {
	var width = $(window).width();
	console.log(width);
	if (width < 482) {
		console.log("Creating Mobile Header");
		createMobileHeader(selected);
	}
	else {
		console.log("Creating Desktop Header");
		createDesktopHeader();
	}
}

function createImgElement(name) {
	var img = document.createElement("img");
	var imgPath = "images/icons/"
	img.setAttribute('src', imgPath + name);
	img.setAttribute('class', 'icon');
	//img.setAttribute('alt', 'na');
	img.setAttribute('height', '30px');
	img.setAttribute('width', '30px');
	return img;
}

function createMobileHeader(selected) {
	var tr = document.createElement("TR");

	var thName = document.createElement("TH");
	var textName = document.createTextNode("Name");
	thName.setAttribute('style', 'text-align:left');
	thName.appendChild(textName);
	tr.appendChild(thName);

	var thGoals = document.createElement("TH");
	thGoals.setAttribute('title', 'Goals');
	if (selected === "Goals") {
		thGoals.setAttribute('style', 'background-color: #afafaf')
	}
	var imgGoals = createImgElement('goal_icon.png');
	var onClickGoals = 'createTable("Goals");';
	thGoals.setAttribute("onClick", onClickGoals);
	thGoals.appendChild(imgGoals);
	tr.appendChild(thGoals);

	var thAssists = document.createElement("TH");
	thAssists.setAttribute('title', 'Assists');
	if (selected === "Assists") {
		thAssists.setAttribute('style', 'background-color: #afafaf')
	}
	var imgAssists = createImgElement('assist_icon.png');
	var onClickAssists = 'createTable("Assists");';
	thAssists.setAttribute("onClick", onClickAssists);
	thAssists.appendChild(imgAssists);
	tr.appendChild(thAssists);

	var thCards = document.createElement("TH");
	thCards.setAttribute('title', 'Cards');
	if (selected === "Cards") {
		thCards.setAttribute('style', 'background-color: #afafaf')
	}
	var imgCards = createImgElement('cards_icon.png');
	var onClickCards = 'createTable("Cards");';
	thCards.setAttribute("onClick", onClickCards);
	thCards.appendChild(imgCards);
	tr.appendChild(thCards);

	var thKeeper = document.createElement("TH");
	thKeeper.setAttribute('title', 'Keeper Stats');
	if (selected === "Keeper Stats") {
		thKeeper.setAttribute('style', 'background-color: #afafaf')
	}
	var imgKeeper = createImgElement('keeper_icon.png');
	var onClickKeeper = 'createTable("Keeper Stats");';
	thKeeper.setAttribute("onClick", onClickKeeper);
	thKeeper.appendChild(imgKeeper);
	tr.appendChild(thKeeper);

	var thTotal = document.createElement("TH");
	thTotal.setAttribute('title', 'Total');
	if (selected === "Total") {
		thTotal.setAttribute('style', 'background-color: #afafaf')
	}
	var imgTotal = createImgElement('total_icon.png');
	var onClickTotal = 'createTable("Total");';
	thTotal.setAttribute("onClick", onClickTotal);
	thTotal.appendChild(imgTotal);
	tr.appendChild(thTotal);

	document.getElementById("tablebody").appendChild(tr);
}

function createDesktopHeader() {
	var tr = document.createElement("TR");

	var thName = document.createElement("TH");
	var textName = document.createTextNode("Name");
	thName.appendChild(textName);
	tr.appendChild(thName);

	var thGoals = document.createElement("TH");
	var textGoals = document.createTextNode("Goals");
	var onClickGoals = 'createTable("Goals");';
	thGoals.setAttribute("onClick", onClickGoals);
	thGoals.appendChild(textGoals);
	tr.appendChild(thGoals);

	var thAssists = document.createElement("TH");
	var textAssists = document.createTextNode("Assists");
	var onClickAssists = 'createTable("Assists");';
	thAssists.setAttribute("onClick", onClickAssists);
	thAssists.appendChild(textAssists);
	tr.appendChild(thAssists);

	var thCards = document.createElement("TH");
	var textCards = document.createTextNode("Cards");
	var onClickCards = 'createTable("Cards");';
	thCards.setAttribute("onClick", onClickCards);
	thCards.appendChild(textCards);
	tr.appendChild(thCards);

	var thKeeper = document.createElement("TH");
	var textKeeper = document.createTextNode("Keeper");
	var onClickKeeper = 'createTable("Keeper Stats");';
	thKeeper.setAttribute("onClick", onClickKeeper);
	thKeeper.appendChild(textKeeper);
	tr.appendChild(thKeeper);

	var thTotal = document.createElement("TH");
	var textTotal = document.createTextNode("Total");
	var onClickTotal = 'createTable("Total");';
	thTotal.setAttribute("onClick", onClickTotal);
	thTotal.appendChild(textTotal);
	tr.appendChild(thTotal);

	document.getElementById("tablebody").appendChild(tr);
}


function appendRow(player) {
	var tr = document.createElement("TR");

	var tdName = document.createElement("TD");

	tdName.setAttribute('style', 'text-align:left');
	//tdName.setAttribute('style', 'padding-left: 1em');
	tdName.setAttribute("id", player.name);
	var onClickFunction = 'displayLog("' + player.name + '");';
	tdName.setAttribute("onClick", onClickFunction);
	var textName = document.createTextNode(capitalize(player.name));
	tdName.appendChild(textName);
	tr.appendChild(tdName);

	var tdGoals = document.createElement("TD");
	var textGoals = document.createTextNode(player.goalScore);
	tdGoals.appendChild(textGoals);
	tr.appendChild(tdGoals);

	var tdAssists = document.createElement("TD");
	var textAssists = document.createTextNode(player.assistScore);
	tdAssists.appendChild(textAssists);
	tr.appendChild(tdAssists);

	var tdCards = document.createElement("TD");
	var textCards = document.createTextNode(player.cardScore);
	tdCards.appendChild(textCards);
	tr.appendChild(tdCards);

	var tdKeeper = document.createElement("TD");
	var textKeeper = document.createTextNode(player.keeperScore);
	tdKeeper.appendChild(textKeeper);
	tr.appendChild(tdKeeper);

	var tdTotal = document.createElement("TD");
	var textTotal = document.createTextNode(player.total());
	tdTotal.appendChild(textTotal);
	tr.appendChild(tdTotal);

	document.getElementById("tablebody").appendChild(tr);
}


function displayLog(name) {
	$('#logs').empty();
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
	ul.setAttribute('id', 'log-list');
	for (var i = 0; i < list.length; i++) {
		console.log(i);
		var li = document.createElement("LI");
		li.innerHTML = list[i];
		ul.appendChild(li);
	}
	document.getElementById("logs").appendChild(ul);
}


function reset() {
	// Reset all objects
	players = new Array();
	matches = null;
	drafts = null;
}

function capitalize(string) {
	var words = string.split(" ");
	var capitalized = ""
	for (var i = 0; i < words.length; i++) {
		capitalized += words[i].charAt(0).toUpperCase() + words[i].slice(1) + " ";
	}
    return capitalized.trim();
}
