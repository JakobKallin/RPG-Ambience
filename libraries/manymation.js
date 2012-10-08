var Manymation = function() {
	var interval = 50;
	var timer;
	var animations = [];
	
	var tickCount;
	var tickIndex;
	var lastTickIndex;
	
	var hasStartedPlaying = false;
	var hasStartedRewinding = false;
	var hasEnded = false
	
	var rewindListeners = [];
	
	var play = function(duration) {
		if ( hasStartedPlaying || hasEnded ) {
			return;
		}
		
		hasStartedPlaying = true;
		
		// If we don't round, we might get a non-integer tick count, which would break the conditional at the end of the tick() function.
		tickCount = Math.round(duration / interval);
		tickIndex = -1;
		lastTickIndex = tickCount - 1;
		
		if ( tickCount === 0 ) {
			animations.map(function(anim) {
				anim.value = anim.endValue;
			});
		} else {
			var tick = function() {
				tickIndex += 1;
				
				animations.map(function(anim) {
					var value = progress() * anim.endValue;
					anim.value = value;
				});
				
				var animationIsOver = tickIndex === lastTickIndex;
				if ( animationIsOver ) {
					window.clearInterval(timer);
				}
			};
			
			timer = window.setInterval(tick, interval);
		}
	};
	
	var rewind = function(duration) {
		if ( hasStartedRewinding || hasEnded ) {
			return;
		}
		
		hasStartedRewinding = true;
		
		// If we don't round, we might get a non-integer tick count, which would break the conditional at the end of the tick() function.
		var playProgress = progress(); // Save the current progress before calculating new ticks.
		tickCount = Math.round(duration / interval);
		tickIndex = Math.round(tickCount * playProgress);
		lastTickIndex = tickCount - 1;
		
		window.clearInterval(timer);
		
		if ( tickCount === 0 ) {
			animations.map(function(anim) {
				anim.value = 0;
			});
			hasEnded = true;
		} else {
			var tick = function() {
				tickIndex -= 1;
				
				animations.map(function(anim) {
					var value = progress() * anim.endValue;
					anim.value = value;
				});
				
				var animationIsOver = tickIndex === 0;
				if ( animationIsOver ) {
					window.clearInterval(timer);
					hasEnded = true;
					rewindEnded();
				}
			};
			
			timer = window.setInterval(tick, interval);
		}
	};
	
	var stop = function() {
		window.clearInterval(timer);
		hasEnded = true;
	};
	
	var onRewindEnded = function(listener) {
		rewindListeners.push(listener);
	};
	
	var rewindEnded = function() {
		rewindListeners.map(function(listener) { listener(); });
	}
	
	var Animation = function(target, property, endValue) {
		return {
			endValue: endValue,
			set value(value) {
				if ( isNaN(value) ) {
					// This prevents a horrible bug in Chrome (and possibly other browsers) that emits a loud noise if the volume of an <audio> element is set to NaN.
					// This should not normally happen, but it is a way of guarding against limitations of this library and bugs in its code.
					throw new Error('Animation value is not a number.');
				} else {
					target[property] = value;
				}
			}
		};
	};
	
	var track = function(target, property, endValue) {
		var anim = new Animation(target, property, endValue)
		animations.push(anim);
		
		var startValue = progress() * endValue;
		anim.value = startValue;
	};
	
	var progress = function() {
		if ( tickCount === 0 ) {
			return (hasStartedPlaying) ? 1 : 0;
		}
		else if ( tickIndex === -1 || !hasStartedPlaying ) {
			return 0;
		} else {
			return tickIndex / lastTickIndex;
		}
	};
	
	return {
		play: play,
		rewind: rewind,
		stop: stop,
		track: track,
		onRewindEnded: onRewindEnded,
		get isRewinding() {
			return hasStartedRewinding && !hasEnded;
		}
	};
};