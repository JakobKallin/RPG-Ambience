function Animation(object, property) {
	var self = this;
	
	// Interval taken from jQuery (13) but rounded up.
	// Rounding down to only 10 makes setInterval drift.
	var interval = 20;
	var startValue;
	var endValue;
	var speed;
	var onCompleted;
	var onStopped;
	
	var difference;
	var duration;
	var tickCount;
	var amount;
	var direction;
	
	var value; // Separate state variable to avoid automatic type conversions.
	var timer;
	var hasStarted = false;
	var isPaused = false;
	var tickIndex;
	var lastTickIndex;
	
	var tick = function() {
		tickIndex += 1;
		value += amount;
		
		if ( direction === 'increase' ) {
			value = Math.min(value, endValue);
		} else {
			value = Math.max(value, endValue);
		}
		
		object[property] = value;
		
		if ( tickIndex === lastTickIndex ) {
			self.complete();
		}
	};
	
	this.start = function(newEndValue, newSpeed, newOnCompleted, newonStopped) {
		if ( hasStarted ) {
			self.stop();
		}
		
		hasStarted = true;
		
		endValue = newEndValue;
		speed = newSpeed;
		onCompleted = newOnCompleted;
		onStopped = newonStopped;
		
		value = startValue = Number(object[property]);
		difference = endValue - startValue;
		duration = speed * Math.abs(difference);
		// If we don't round, we might get a non-integer tick count, which screws up tickIndex === lastTickIndex in tick() function.
		tickCount = Math.round(duration / interval);
		
		if ( endValue >= startValue ) {
			direction = 'increase';
		} else {
			direction = 'decrease';
		}
		
		if ( tickCount === 0 ) {
			self.complete(); // If we don't do this, we would divide by zero when calculating amount.
		} else {
			amount = difference / tickCount;
			tickIndex = -1;
			lastTickIndex = tickCount - 1;
			
			timer = window.setInterval(tick, interval);
		}
	};
	
	this.stop = function() {
		if ( hasStarted ) {
			if ( timer !== null ) {
				window.clearInterval(timer);
			}
			
			hasStarted = false;
			isPaused = false;
			
			if ( onStopped !== undefined ) {
				onStopped();
			}
		}
	};
	
	this.complete = function() {
		if ( hasStarted ) {
			self.stop();
			object[property] = endValue; // If there are rounding errors.
			
			if ( onCompleted !== undefined ) {
				onCompleted();
			}
		}
	}
	
	this.pause = function() {
		if ( hasStarted && !isPaused ) {
			window.clearInterval(timer);
			isPaused = true;
		}
	};
	
	this.resume = function() {
		if ( hasStarted && isPaused ) {
			isPaused = false;
			timer = window.setInterval(tick, interval);
		}
	};
}