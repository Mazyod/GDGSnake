
import src.GameLogic as GameLogic;
import ui.View as View;
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
var tabemonoColor = '#FFF';

var blockLength;

exports = Class(View, function (supr) {
	
	this.init = function (opts) {
		// call super init, with 1 argument(s)
		supr(this, 'init', [opts]);
		// we assume 4:3 aspect ratio
		// If in doubt, ALWAYS USE BOC LAYOUT
		var canvas = new View({
			superview: this,
			layout: 'box',
			centerY: true,
			centerX: true,
			width: Math.floor((4.0/3.0) * device.screen.height),
			height: device.screen.height,
			backgroundColor: '#333333'
		});

		blockLength = (canvas.style.height / GameLogic.ROWS);

		this._canvas = canvas;

		var snake = [];
		var snakeLength = GameLogic.SNAKE_START_LENGTH;
		for (var i = 0; i < snakeLength ; i++) {
			snake.push(this._newSnakeBlock(snakeLength - i - 1, 0));
		};

		this._snake = snake;

		var tabemono = new View({
			superview: canvas,
			x: -blockLength,
			y: -blockLength,
			width: blockLength,
			height: blockLength,
			backgroundColor: tabemonoColor
		});

		this._tabemono = tabemono;

		// register touch events for inputView
		this.on('InputStart', touchBegan.bind(this));
		this.on('InputMove', touchMoved.bind(this));
		this.on('InputSelect', touchEnded.bind(this));
		this.on('InputOut', touchEnded.bind(this));

	}

	this.snakeMoved = function (args) {
		var didLose = args.didLose;
		var newLocation = args.newLocation;
		var didEat = args.didEat;
		var tabemono = args.tabemono;

		var newHead = (didEat ? this._newSnakeBlock(0, 0) : this._snake.pop());
		newHead.updateOpts({
			x: newLocation.c * blockLength,
			y: newLocation.r * blockLength
		});

		this._snake.splice(0, 0, newHead);

		if (didEat || this._tabemono.style.x < 0) {
			console.log('GUI ATE!!');
			this._tabemono.updateOpts({
				x: tabemono.c * blockLength,
				y: tabemono.r * blockLength
			});
		}
	}

	// create and return a view representing a block from the snake
	this._newSnakeBlock = function (xIndex, yIndex) {
		return new View({
			superview: this._canvas,
			x: xIndex * blockLength,
			y: yIndex * blockLength,
			width: blockLength * 1.05,
			height: blockLength * 1.05,
			backgroundColor: snakeColor
		});
	}

	/* ---- TOUCH HANDLER FUNCTIONS ---- */

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