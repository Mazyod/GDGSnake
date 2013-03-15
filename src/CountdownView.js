
import ui.TextView as TextView;
import animate;

/*
	CLASS DESCRIPTION:
	==================
		This class shows a countdown on the screen. The object should be
	created, and then, beginAnimation should be called to start the animation.
	By passing a callback to the beginAnimation, you will be notified when the 
	countdown anim ends.

		I believe this class is very straight forward and ecplains itself, so I
	will refrain from commenting here.
	
*/

exports = Class( function () {
	
	this.init = function () {
		this._textViews = [
		animationTextView('3'),
		animationTextView('2'),
		animationTextView('1'),
		animationTextView('GO!')];
	};

	this.beginAnimation = function (callback) {
		for (var i = 0; i < this._textViews.length; i++) {
			var textView = this._textViews[i];
			animateView(textView, i);
		}

		setTimeout(callback, 3200);
	}
	
	function animationTextView (text) {
		return new TextView({
			superview: GC.app.view,
			layout: "box",
			text: text,
			color: "#FFF",
			layoutWidth: '60%',
			layoutHeight: '60%',
			offsetY: -30,
			size: 10000,
			centerX: true,
			centerY: true,
			inLayout: false,
			opacity: 0.0,
			centerAnchor: true,
			fontFamily: 'Serif'
		});
	}

	function animateView (view, index) {
		return animate(view).wait(index * 1000).then({
			scale: 1.4,
			opacity: 1.0
		}, 600, animate.linear).then({
			scale: 1.6
		}, 300, animate.linear).then({
			scale: 1.8,
			opacity: 0.0
		}, 300, animate.linear).then(function () {
			view.removeFromSuperview();
		});
	}

});