
import event.Emitter as Emitter;
import lib.Enum as Enum;

/*
	CLASS DESCRIPTION:
	==================
		This class runs the game from a logical perspective. The snake
	movement, eat, growth, and collision with itself are all calculated
	in this class. The calculations are done each 'tick' and emitted to
	the GameScene in order to update the UI accordingly.

		The game is represented as a matrix, where the location of the
	game elements can be calculated using a pair of numbers (row, column)
	where row = [0, rows), column = [0, columns].

*/


/* ---- LOGIC CONSTANTS ---- */

// GAME BOARD SIZE:
var rows = 21; // should be a multiple of 3
// because we have aspect ratio of 4:3
var columns = Math.round(rows * 4.0/3.0);

// INITIAL SNAKE SETUP:
var snakeStartLength = 4;
var snakeSpeed = 2.5;

var DIRECTION = Enum({
	UP: 0, 
	DN: 3, 
	LF: 1, 
	RT: 2
});

exports = Class( Emitter, function (supr) {
	// the designated constructor
	this.init = function () {
		// initialize everything, actually
		this._initializeGameBoard();
	}

	// to make the game logic start ticking, call this function
	this.startGame = function () {
		this._tickID = setInterval(this._tick.bind(this), 500.0 / snakeSpeed);
	}

	// this method is called when the user input is captured and emitted
	this.moveSnake = function (direction) {
		// if current direction doesn't equal the opposite direction
		if (this._curDirection !== (~direction & 3)) {
			this._newDirection = direction;
		}
	}

	// prepares the initial game setup
	this._initializeGameBoard = function () {
		// 1 - Prepare the game board.
		var gameBoard = new Array(rows);
		for (var i = 0 ; i < rows ; ++i) {
			gameBoard[i] = new Array(columns);
			for (var j = 0; j < columns ; ++j) {
				gameBoard[i][j] = false;
			}
		}

		// 2 - prepare the snake, both the object and on the gameboard
		var snake = [];
		for (var i = 0; i < snakeStartLength ; i++) {
			// true means snake is occupying that block
			gameBoard[0][i] = true;
			snake.push({
				r: 0,
				c: snakeStartLength - i - 1,
			});
		}

		this._gameBoard = gameBoard;
		this._snake = snake;
		this._curDirection = this._newDirection = DIRECTION.RT;
		this._tabemono = this._generateTabemono();
		this._score = 0;
	}

	// generate food that doesn't intersect with the snake's body.
	this._generateTabemono = function () {
		var tabemono;
		do {
			tabemono = {
				r: Math.floor(Math.random() * rows),
				c: Math.floor(Math.random() * columns)
			};
		} while (this._gameBoard[tabemono.r][tabemono.c]);

		return tabemono;
	}

	this._tick = function () {		
		var direction = this._curDirection = this._newDirection;
		var tabemono = this._tabemono;
		// here, we copy the snakeHead from the array, so we dont modify the original
		var snakeHead = merge(null, this._snake[0]);

		switch (direction) {
			case DIRECTION.UP:
			snakeHead.r--;
			break;

			case DIRECTION.DN:
			snakeHead.r++;
			break;

			case DIRECTION.LF:
			snakeHead.c--;
			break;

			case DIRECTION.RT:
			snakeHead.c++;
			break;

			default:
			console.error('Unkown Direction');
		}

		// wrap the head if it went outside the gameboard bounds
		(snakeHead.r < 0 ? snakeHead.r = rows - 1 : (snakeHead.r >= rows ? snakeHead.r = 0 : /* NOP */ snakeHead));
		(snakeHead.c < 0 ? snakeHead.c = columns - 1 : (snakeHead.c >= columns ? snakeHead.c = 0 : /* NOP */ snakeHead));
		// insert snakeHead at index 0... CoffeeScript 1, JavaScript 0
		this._snake.splice(0, 0, snakeHead);

		var didLose = false;
		// if the head intersects the location of the tabemono...
		var didEat = (snakeHead.r === tabemono.r && snakeHead.c === tabemono.c);
		if (didEat) {
			// ...we generate a new tabemono without popping the tail which increases the
			// snake size. There is no way the user can lose in this situation, so don't check
			this._tabemono = tabemono = this._generateTabemono();
			this._score++;
		} else {
			// else, pop the tail, and set it empty on the gameboard
			var tail = this._snake.pop();
			this._gameBoard[tail.r][tail.c] = false;
			// if the new location is already occupied, the user lost
			didLose = this._gameBoard[snakeHead.r][snakeHead.c];
		}
		// set the new location to occupied in the gameboard
		this._gameBoard[snakeHead.r][snakeHead.c] = true;
		// if we lost, stop ticking
		if (didLose) {
			clearInterval(this._tickID);
		}
		// finally, update the GameScene
		this.emit('logicUpdated', {
			didLose: didLose,
			didEat: didEat,
			newLocation: snakeHead,
			tabemono: tabemono,
			score: this._score
		});

	}

	// Simply a function that prints the gameboard nicely
	this._debugGameBoard = function () {
		var board = '';
		for (var i = 0 ; i < rows ; ++i) {
			var row = '';
			for (var j = 0; j < columns ; ++j) {
				row += (this._gameBoard[i][j] ? '■' : '□');
			}
			board += row + '\n';
		}
		console.log(board);
	}

});


/* ---- EXPORT CONSTANTS ---- */

// GAME BOARD SIZE:
// because we have aspect ratio of 4:3
exports.ROWS = rows;
exports.COLUMNS = columns;		

exports.SNAKE_START_LENGTH = snakeStartLength;
exports.SNAKE_SPEED = snakeSpeed;

exports.DIRECTION = DIRECTION;

