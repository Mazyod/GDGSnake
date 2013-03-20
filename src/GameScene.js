
import src.GameLogic as GameLogic;
import ui.View as View;
import ui.TextView as TextView;
import ui.widget.ButtonView as ButtonView;
import device;

/*
	CLASS DESCRIPTION:
	==================
		The main GUI of the game is created and added here. Currently,
	the only components are:
		1- Canvas:
			The plane where the snake can more around. In order to make 
			the size of the plane consistent on all devices, we assumed
			4:3 ratio, and all remaining space is simply black.

		2- Snake:
			An array of views that represent the snake's body. The snake
			is moved by removing the last block, and repositioning it to
			the new location of the snake.

		3- Tabemono:
			This is a word in Japanese for 'edible'. So, this represents
			the food that the snake eats in order to score and grow.

*/

/* ---- GAME SCENE CONSTANTS ---- */

var snakeColor = '#0A0';
var snakeLoseColor = '#F00';
var tabemonoColor = '#FFF';

var blockLength;

exports = Class(View, function (supr) {
	// Puts the components into place, but not game initializations
	this.init = function (opts) {
		// call super init, with 1 argument(s)
		supr(this, 'init', [opts]);
		// Setup our canvas which holds the whole game
		var canvas = new View({
			superview: this,
			// If in doubt, ALWAYS USE BOX LAYOUT
			layout: 'linear',
			centerY: true,
			centerX: true,
			// we assume 4:3 aspect ratio
			width: Math.floor((4.0/3.0) * device.screen.height),
			height: device.screen.height,
			backgroundColor: '#333333',
			justifyContent: 'end',
			direction: 'vertical'
		});

		this._canvas = canvas;

		blockLength = (canvas.style.height / GameLogic.ROWS);

		this._initializeGame();

		// register touch events for inputView
		this.on('InputStart', touchBegan.bind(this));
		this.on('InputMove', touchMoved.bind(this));
		this.on('InputSelect', touchEnded.bind(this));
		this.on('InputOut', touchEnded.bind(this));
	}

	this._initializeGame = function () {
		// Setup the scrore label
		var scoreLabel = new TextView({
			superview: this._canvas,
			layout: 'box',
			color: '#555',
			horizontalAlign: 'left',
			size: 100,
			layoutWidth: '100%',
			layoutHeight: '14%',
			padding: '10 10 10 10'
		});

		scoreLabel.updateOpts({
			text: ''
		});

		this._scoreLabel = scoreLabel;

		// the snake is basically an array of block views
		var snake = [];
		var snakeLength = GameLogic.SNAKE_START_LENGTH;
		for (var i = 0; i < snakeLength ; i++) {
			snake.push(this._newSnakeBlock(0, snakeLength - i - 1));
		};

		this._snake = snake;
		// the food representation
		var tabemono = new View({
			superview: this._canvas,
			x: -blockLength,
			y: -blockLength,
			width: blockLength,
			height: blockLength,
			backgroundColor: tabemonoColor,
			inLayout: false
		});

		this._tabemono = tabemono;
	}

	// Update the GUI after the logic changed
	this.snakeMoved = function (args) {
		var didLose = args.didLose;
		var newLocation = args.newLocation;
		var didEat = args.didEat;
		var tabemono = args.tabemono;
		var score = args.score;
		// if we ate, create a new block as a head, otherwise move the tail head
		var newHead = (didEat ? this._newSnakeBlock(0, 0) : this._snake.pop());
		newHead.updateOpts({
			x: newLocation.c * blockLength,
			y: newLocation.r * blockLength,
		});
		// insert the new head at the beginning of the array
		this._snake.splice(0, 0, newHead);
		// if we ate, or this is the first time we are running
		if (didEat || this._tabemono.style.x < 0) {
			// Move the tabemono to the Logic's new location
			this._tabemono.updateOpts({
				x: tabemono.c * blockLength,
				y: tabemono.r * blockLength
			});
			// update the score label
			this._scoreLabel.updateOpts({
				text: 'SCORE: ' + (score * 25)
			});
		} else if (didLose) {
			this._showEndGameSequence(newLocation);
		}
	}

	// reset the game
	this.reset = function () {
		// remove old stuff
		this._canvas.removeAllSubviews();
		this._initializeGame();
	}

	// Called when the game ends (ie, user loses)
	this._showEndGameSequence = function (newLocation) {
		// else if we lost, add a red block where the collision happened
		var collisionBlock = this._newSnakeBlock(newLocation.r, newLocation.c).updateOpts({
			backgroundColor: snakeLoseColor
		});
		// push it to the snake for the sake of maintaining a ref to it
		this._snake.push(collisionBlock);
		// add a tranparent button in the middle to reset
		var resetButton = new ButtonView({
			superview: this._canvas,
			title: 'Play Again',
			layout: 'box',
			inLayout: false,
			backgroundColor: '#999',
			opacity: 0.7,
			text: {
				color: '#FFFFFF',
				size: 24
			},
			width: 160,
			height: 50,
			centerX: true,
			centerY: true,
			// event handling
			on : {
				up: resetPressed.bind(this)
			}
		});

		this._resetButton = resetButton;
	}

	// create and return a view representing a block from the snake
	this._newSnakeBlock = function (row, column) {
		return new View({
			superview: this._canvas,
			inLayout: false,
			x: column * blockLength,
			y: row * blockLength,
			// IMPORTANT: Increase block size a bit to fill gaps between blocks
			width: blockLength * 1.05,
			height: blockLength * 1.05,
			backgroundColor: snakeColor
		});
	}

	/* ---- TOUCH HANDLER FUNCTIONS ---- */

	function resetPressed (event) {
		this.emit('resetGame');
	}

	var _capturedTouches = null;
	// Capture the initial point we touched upon
	function touchBegan (event, point) {
		_capturedTouches = [point];
	}

	// Capture drag event to calculate the direction
	function touchMoved (event, point) {
		// If the event didn't start within our bounds, ignore
		if (_capturedTouches === null) {
			return;
		}
		// add the new captured touch to our array
		_capturedTouches.push(point);
		// Capture 3 additional points for accuracy
		if (_capturedTouches.length > 3) {

			var totalDeltaX = 0, prevX = 0;
			var totalDeltaY = 0, prevY = 0;
			// calculate the deltas to know which direction the swipe was
			_capturedTouches.forEach(function (arrPoint) {
				if (prevX !== 0) {
					totalDeltaX += (arrPoint.x - prevX);
					totalDeltaY += (arrPoint.y - prevY);
				}

				prevX = arrPoint.x;
				prevY = arrPoint.y;
			});

			var direction;
			if (Math.abs(totalDeltaX) > Math.abs(totalDeltaY)) {
				if (totalDeltaX > 0) {
					direction = GameLogic.DIRECTION.RT;
				} else {
					direction = GameLogic.DIRECTION.LF;
				}
			} else {
				if (totalDeltaY > 0) {
					direction = GameLogic.DIRECTION.DN;
				} else {
					direction = GameLogic.DIRECTION.UP;
				}
			}
			// Finally, inform the logic of this input
			this.emit('newDirection', direction);
			// reset current touches, but continue capturing more
			_capturedTouches = [];
		}
	}

	// reset everything when the touch ends
	function touchEnded (event, point) {
		_capturedTouches = null;
	}

});