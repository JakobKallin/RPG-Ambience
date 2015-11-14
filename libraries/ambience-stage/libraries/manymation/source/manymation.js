window.requestAnimationFrame =
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.msRequestAnimationFrame;

var Manymation = {};

Manymation.animate = function(duration, onEnded, targets) {
	var animation = new Manymation.Animation(duration, onEnded, targets);
	animation.start();
	
	return animation;
};

Manymation.Animation = function(duration, onEnded, targets) {
	targets = targets || [];
	
	// This needs to be zero because we can track targets before starting the
	// animation.
	var elapsedTime = 0;
	var startTime;
	
	var hasBegun = false;
	var hasEnded = false;
	
	var tick = function tick() {
		var time = Number(new Date());
		elapsedTime = time - startTime;
		
		var isOver = elapsedTime >= duration || hasEnded;
		if ( isOver ) {
			complete(onEnded);
		} else {
			targets.map(function(target) {
				update(target, progress(elapsedTime));
			});
			
			window.requestAnimationFrame(tick);
		}
	};
	
	var start = function() {
		if ( hasBegun ) {
			return;
		}
		
		hasBegun = true;
		
		startTime = Number(new Date());
		elapsedTime = 0;
		
		if ( duration === 0 ) {
			complete(onEnded);
		} else {
			window.requestAnimationFrame(tick);
		}
	};
	
	var complete = function() {
		if ( hasEnded ) {
			return;
		}
		
		hasEnded = true;
		
		if ( onEnded ) {
			if ( !(onEnded instanceof Array) ) {
				onEnded = [onEnded];
			}
			onEnded.forEach(function(callback) {
				callback();
			});
		}
		
		targets.map(function(target) {
			update(target, 1);
		});
	};

	var cancel = function() {
		if ( hasEnded ) {
			return;
		};

		hasEnded = true;
	};
	
	var Target = function(object, property, startValue, endValue) {
		this.object = object;
		this.property = property;
		this.startValue = startValue;
		this.endValue = endValue;
	};
	
	Object.defineProperty(Target.prototype, 'difference', {
		get: function() {
			return this.endValue - this.startValue;
		}
	});
	
	Object.defineProperty(Target.prototype, 'highestValue', {
		get: function() {
			return Math.max(this.startValue, this.endValue);
		}
	});
	
	Object.defineProperty(Target.prototype, 'lowestValue', {
		get: function() {
			return Math.min(this.startValue, this.endValue);
		}
	});
	
	var update = function(target, progress) {
		var value = target.startValue + progress * target.difference;
		
		if ( isNaN(value) ) {
			/*
			 * This prevents a horrible bug in Chrome (and possibly other
			 * browsers) that emits a loud noise if the volume of an <audio>
			 * element is set to NaN. This should not normally happen, but it is
			 * a way of guarding against limitations of this library and bugs in
			 * its code.
			 */
			throw new Error('Animation value is not a number.');
		} else {
			
			var roundedValue = Math.min(Math.max(value, target.lowestValue),
				target.highestValue);
			target.object[target.property] = roundedValue;
		}
	};
	
	var track = function(object, property, startValue, endValue) {
		var target = new Target(object, property, startValue, endValue)
		targets.push(target);
		update(target, progress(elapsedTime));
	};
	
	var progress = function(elapsedTime) {
		if ( duration === 0 && !hasBegun ) {
			return 0;
		} else if ( duration === 0 && hasBegun ) {
			return 1;
		} else if ( hasEnded ) {
			return 1;
		} else {
			return elapsedTime / duration;
		}
	};
	
	return {
		track: track,
		targets: targets,
		start: start,
		complete: complete,
		cancel: cancel
	};
};