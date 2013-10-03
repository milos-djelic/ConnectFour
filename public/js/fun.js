var vals = function() {
	this.colors = ["yellow", "red"];
	this.cols = [0,0,0,0,0,0,0];
	this.myTurn = false;
	this.end = false;		
	
	return this;
};

var values = vals();		

var socket = io.connect('http://localhost:8000');
socket.on("message", function(data) {

	//if new move is sent from opponent
	if (data.move) { 
		values.myTurn = true;
		$("#whoPlaysMessage").html("It's your turn. Play!");
		console.log("received ", data.move);
		fillTheHole(data.move, oponentColor);					
	}	
	//begining of the game, both players are on, server sends who plays first
	if (data.turn) {
		playerColor = values.colors[data.turn-1];
		oponentColor = values.colors[data.turn % 2];
		
		if(data.turn == 1 && !values.end) 
		{
			values.myTurn = true;
			$("#whoPlaysMessage").html("You play first!");
		}
		else {
			$("#whoPlaysMessage").html("Wait for opponent to play!");	
		}
		
		for( var i = 0; i < 7; i += 1) {
			$("#arrow"+i).css("background-color", playerColor);
		}					
	}				
	//server sends who won, end of the game
	if (data.win) {
		console.log(data.win);
		if (data.win == "win") {$("#winner").html("<h1>YOU WON!!!</h1>");};
		if (data.win == "lost") {$("#winner").html("<h1>YOU LOST!!!</h1>");};
		if (data.win == "tie") {$("#winner").html("<h1>NO ONE WON.</h1>");};
		
		$("#whoPlaysMessage").css("display", "none");
	
		values.end = true;
		values.myTurn = false;
	}			
});
var sendMove = function(col){
	values.myTurn = false;
	$("#whoPlaysMessage").html("Wait for opponent to play!");
	socket.emit("submit-move", {move: col});
};
var fillTheHole = function(col, color) {
	var index = "#cel" + col  + values.cols[col];
	$(index).css("background-color", color);
	values.cols[col] += 1;
};

//creating board from divs
var container = $("#container");
for (var i = 5; i >= 0; i -= 1) {
		var tempRow = $("<div>").attr("id", "row" + i);
		for (var j = 0; j < 7; j += 1) {
			var tempCell = $("<div>").attr("id", "cel" + j + i).data("col", j);
			tempRow.append(tempCell);
		}
		container.append(tempRow);
}

//listeners for selecting column 
$("#container").on ("click", function(e) {
		if (values.myTurn && !values.end) {
		
		var selectedCol = $("#" + e.target.id).data("col"); 		
		console.log(selectedCol);
		if (cols[selectedCol] < 6) { 								// limit check, if whole column if full do nothing
		
			fillTheHole(selectedCol, playerColor);
			sendMove(selectedCol);
			console.log("after sending ", selectedCol);
			$("#arrow"+selectedCol).css("visibility","hidden");	
			setTimeout(function(){
				$("#arrow"+selectedCol).css("visibility","visible");	
			}, 300);
		}	
	}
});
// on hover over the columns coin on top (arrow divs) appear
$("#container").children().hover(
	function(e) {
		$("#arrows > span").css("visibility","hidden");
		var selectedCol = $("#" + e.target.id).data("col"); 
		$("#arrow"+selectedCol).css("visibility","visible");
		
	},
	function(e){
		var selectedCol = e.target.id.charAt(3); 
		$("#arrow"+selectedCol).css("visibility","hidden");
	}
);
