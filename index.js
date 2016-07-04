var express = require('express');
var app = express();
var port = 8002;
var Game = require("./game.js");

//defines the first player, the one who waits for the second one to connect
var waitingPlayer = null;

//express serves the static files from the public folder
app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));

var Player = function(client) {
	this.client = client;
};

//when a player connects
io.sockets.on('connection', function (socket) {
	var player = new Player(socket);

  //sends a new move to the other player
  var sendMove = function(col){
    console.log("send move ", col);
    player.game.currentPlayer.client.json.send({move: col});
  };

  //in case of win, sends message to each player with the adequate message
  var sendWin = function(winner) {
    var firstPlayerResult,
        secondPlayerResult;

    if (winner == 0) {
      firstPlayerResult = secondPlayerResult = 'tie';
    }
    else {
      var firstPlayerIsWinner = (winner == firstPlayer);
      firstPlayerResult = (firstPlayerIsWinner) ? "win" : "lost";
      secondPlayerResult = (firstPlayerIsWinner) ? "lost" : "win";
    }

    firstPlayer.client.json.send({win : firstPlayerResult});
    secondPlayer.client.json.send({win : secondPlayerResult});
  }


  //the case when the first player is connected, and waits for the second
  if (waitingPlayer == null) {
		waitingPlayer = player;
	}
  //the second player connects,
  //waitingPlayer becomes null, so another first player can start another game
	else {
		var secondPlayer = player;
		var firstPlayer = waitingPlayer;
		waitingPlayer = null;

    //sending order of turns to connected users
		firstPlayer.client.json.send({turn: 1});
		secondPlayer.client.json.send({turn: 2});

    //creating a new game, and passing created palyers and functions
    var game = new Game();
    game.create(firstPlayer, secondPlayer, sendMove, sendWin);

    //sending each player information about the game
		firstPlayer.game = game;
		secondPlayer.game = game;
	}
  //socket waits for the message 'submit-move' to process the sent move
	socket.on('submit-move', function(data){
	   console.log('submit-move: ', data);
	    player.game.onMove(data.move);
	});

});
