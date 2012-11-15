window.requestAnimationFrame =
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame;

var Manymation = function() {
	var targets = [];
	var elapsed = 0;
	var duration = 0;
	var onEnded;
	var reverse = false;
	var start = 0;
	var isRunning = false;
	var isPlaying = false;
	var isReversing = false;
	
	var tick = function tick(time) {
		time = time || Number(new Date());
		elapsed = time - start;
		
		var isOver = elapsed >= duration || !isRunning;
		if ( isOver ) {
			end(onEnded);
		} else {
			targets.map(function(target) {
				target.update(elapsed);
			});
			window.requestAnimationFrame(tick);
		}
	};
	
	var run = function(newDuration, newOnEnded, newReverse) {
		if ( isRunning ) {
			complete();
		}
		
		elapsed = 0;
		duration = newDuration;
		
		if ( onEnded && !newOnEnded ) {
			// Do nothing.
		} else if ( onEnded && newOnEnded ) {
			var oldOnEnded = onEnded;
			onEnded = function() {
				oldOnEnded();
				newOnEnded();
			};
		} else {
			onEnded = newOnEnded;
		}
		
		reverse = newReverse;
		start = window.mozAnimationStartTime || Number(new Date());
		
		isRunning = true;
		if ( reverse ) {
			isReversing = true;
		} else {
			isPlaying = true;
		}
		
		if ( duration === 0 ) {
			end(onEnded);
		} else {
			window.requestAnimationFrame(tick);
		}
	};
	
	var play = function(duration, onEnded) {
		run(duration, onEnded, false);
	};
	
	var reverse = function(duration, onEnded) {
		run(duration, onEnded, true);
	};
	
	var end = function() {
		if ( onEnded ) {
			onEnded();
		}
		complete();
	};
	
	var complete = function() {
		targets.map(function(target) {
			target.update(duration);
		});
		isRunning = false;
		isPlaying = false;
		isReversing = false;
	};
	
	var Target = function(object, property, endValue) {
		return {
			update: function(elapsed) {
				var value = progress(elapsed) * endValue;
				if ( reverse ) {
					value = endValue - value;
				}
				
				if ( isNaN(value) ) {
					// This prevents a horrible bug in Chrome (and possibly other browsers) that emits a loud noise if the volume of an <audio> element is set to NaN.
					// This should not normally happen, but it is a way of guarding against limitations of this library and bugs in its code.
					throw new Error('Animation value is not a number.');
				} else {
					var roundedValue = Math.min(Math.max(value, 0), endValue);
					object[property] = roundedValue;
				}
			}
		};
	};
	
	var track = function(object, property, endValue) {
		var target = new Target(object, property, endValue)
		targets.push(target);
		
		if ( isRunning ) {
			target.update(elapsed);
		}
	};
	
	var progress = function(elapsed) {
		if ( elapsed === duration ) {
			return 1;
		} else {
			return elapsed / duration;
		}
	};
	
	return {
		track: track,
		play: play,
		reverse: reverse,
		complete: complete,
		get isPlaying() {
			return isPlaying;
		},
		get isReversing() {
			return isReversing;
		}
	};
};