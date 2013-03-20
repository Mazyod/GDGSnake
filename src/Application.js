/* @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with the Game Closure SDK.  If not, see <http://www.gnu.org/licenses/>.
 */

import ui.View as View;
import device;
import src.CountdownView as CountdownView;
import src.GameLogic as GameLogic;
import src.GameScene as GameScene;

exports = Class(GC.Application, function () {

	this.initUI = function () {
		// set up our object
		var gameScene = new GameScene({
			superview: this,
			layout: 'box',
			layoutWidth: '100%',
			layoutHeight: '100%'
		});

		var countdown = new CountdownView();
		var gameLogic = new GameLogic();
		// make the gameScene listen to the gamelogic's ticks
		gameScene.on('newDirection', bind(gameLogic, 'moveSnake'));
		// make the logic listen to the gamescene's user input
		gameLogic.on('logicUpdated', bind(gameScene, 'snakeMoved'));
		// make the application listen to a reset event
		gameScene.on('resetGame', bind(this, 'resetGame'));
		// start the countdown ater 1.5 sec
		setTimeout( function () {
			countdown.beginAnimation(countdownCallback.bind(this));
		}.bind(this), 1500);

		this._gameLogic = gameLogic;
		this._gameScene = gameScene;
	};

	// resets the game, both logic and scene
	this.resetGame = function () {
		this._gameLogic.reset();
		this._gameScene.reset();

		new CountdownView().beginAnimation(countdownCallback.bind(this));
	}

	// start the game as soon as the countdown finishes
	function countdownCallback () {
		this._gameLogic.startGame();
	}
	
	this.launchUI = function () {};
});
