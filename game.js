var Game = function (p1, p2, sendMove, sendWin) {
	this.currentPlayer = p1;
	this.waitingPlayer = p2;

	this.sendMove = sendMove;
	this.sendWin = sendWin;
	this.inProgress = true;	
	this.cols = [0,0,0,0,0,0,0]; //stores number of coint in each collumn
	this.board = [];
	
	for (var i = 0; i < 7; i += 1) {
		this.board[i] = [];
		for (var j = 0; j < 6; j += 1) {
			this.board[i][j] = 0;
		}
	}
};

// Places new coin in board, switch players and sends move to opponent's board
Game.prototype.onMove = function(col) {
		var self = this;
				
		self.board[col][self.cols[col]] = self.currentPlayer;
		self.cols[col] += 1;
		
		var temp = self.currentPlayer;
		self.currentPlayer = self.waitingPlayer;
		self.waitingPlayer = temp;
		
		if (!self.checkWin()) {
			self.sendMove(col);		
		}
		
};

// Returns false if game is not over, othervise returns player1, player2 or 0 if tie
Game.prototype.checkWin = function() {
	var empty = false;
	for(var col = 0; col < 7; col += 1) {
		for(var row = 0; row < 6; row += 1) {
			if(this.board[col][row] == 0) {
				empty = true;
				continue;
			} else if(this.checkElement(col, row)) {
				this.inProgress = false;
				this.sendWin(this.board[col][row]);
				return;
			}
		}
	}
	if(!empty) {
			this.inProgress = false;
			// no one won, tie
		this.sendWin(0);
	}
}

//looks for nonzero elements around element
Game.prototype.checkElement = function(col, row) {
	var player = this.board[col][row];
	for(var i = col - 1; i <= col + 1; i += 1) {
		for(var j = row - 1; j <= row + 1; j += 1) {
			if(i < 0 || j < 0 || i > 6 || j > 5 || (i == col && j == row)) continue;
			if(this.board[i][j] == player) {
				if(this.checkInDirection(col, row, i - col, j - row)) {
					return true;
				}
			}
		}
	}
}

//looks for four in direction first-second nonzero element
Game.prototype.checkInDirection = function(col, row, left, up) {
	var player = this.board[col][row];
	for(var i = 0; i <= 3; i += 1) {
		var x = col + left * i;
		var y = row + up * i;
		if(x < 0 || y < 0 || x > 6 || y > 5) return false;
		if(this.board[x][y] == player) continue;
		else { return false; }
	}
	return true;
}
	
	
exports.createGame = function(p1, p2, sendMove, sendWin) {
    return new Game(p1, p2, sendMove, sendWin);
		};

