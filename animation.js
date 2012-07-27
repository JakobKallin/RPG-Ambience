function Animation(object, property) {
	var self = this;
	
	// Set relatively high compared to jQuery (which has 13), because of drifting.
	var interval = 50;
	var startValue;
	var endValue;
	
	// We could use a speed instead of a duration, but that makes it difficult to fade to and from values other than 1.
	var duration;
	var onCompleted;
	var onEnded;
	
	var difference;
	var tickCount;
	var amount;
	var direction;
	
	var value; // Separate state variable to avoid automatic type conversions.
	var timer;
	var hasStarted = false;
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
	
	this.start = function(newEndValue, newDuration, callbacks) {
		if ( !callbacks ) {
			callbacks = {};
		}
		
		if ( hasStarted ) {
			self.stop();
		}
		
		hasStarted = true;
		
		endValue = newEndValue;
		duration = newDuration;
		onCompleted = callbacks.completed;
		onEnded = callbacks.ended;
		
		value = startValue = Number(object[property]);
		difference = endValue - startValue;
		// If we don't round, we might get a non-integer tick count, which breaks the test at the end of the tick() function.
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
			
			if ( onEnded ) {
				onEnded();
			}
		}
	};
	
	this.complete = function() {
		if ( hasStarted ) {
			self.stop();
			object[property] = endValue; // If there are rounding errors.
			
			if ( onCompleted ) {
				onCompleted();
			}
		}
	}
}