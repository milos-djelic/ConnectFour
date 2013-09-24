var express = require('express');
var app = express(); 
var port = 8000;
var g = require("./game.js");
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});
var io = require('socket.io').listen(app.listen(port));
var Player = function(client) { 
	this.client = client;
};
var waitingPlayer = null;

io.sockets.on('connection', function (socket) {	
	var player = new Player(socket);
	var sendMove = function(col){
		console.log("send move ", col);
		player.game.currentPlayer.client.json.send({move: col});
	};
	// in case of win, sends message to each player with adequate 
	var sendWin = function(winner) {
		if (winner == 0) {
			player.game.currentPlayer.client.json.send({win: "tie"});
			player.game.waitingPlayer.client.json.send({win: "tie"});		
		}
		else {
			if (winner == firstPlayer) {
				firstPlayer.client.json.send({win: "win"});
				secondPlayer.client.json.send({win: "lost"});
			}
			else {
				firstPlayer.client.json.send({win: "lost"});
				secondPlayer.client.json.send({win: "win"});		
			}
		}
	}
	if (waitingPlayer == null) {
		waitingPlayer = player;
	}
	else {
		var secondPlayer = player;
		var firstPlayer = waitingPlayer;
		waitingPlayer = null;
		firstPlayer.client.json.send({turn: 1});
		secondPlayer.client.json.send({turn: 2});
		var game = g.createGame(firstPlayer, secondPlayer, sendMove, sendWin);
		firstPlayer.game = game;
		secondPlayer.game = game;
	}
	socket.on('submit-move', function(data){
	console.log('submit-move: ', data);
	player.game.onMove(data.move);		
	});
});