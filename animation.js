function Animation(object, property) {
	var self = this;
	
	// Interval taken from jQuery (13) but rounded up.
	// Rounding down to only 10 makes setInterval drift.
	var interval = 20;
	var startValue;
	var endValue;
	var duration;
	var onCompleted;
	var onStopped;
	
	var difference;
	var tickCount;
	var amount;
	
	var value; // Separate state variable to avoid automatic type conversions.
	var timer;
	var hasStarted = false;
	var isPaused = false;
	var tickIndex;
	var lastTickIndex;
	
	var tick = function() {
		tickIndex += 1;
		value += amount;
		object[property] = value;
		
		if ( tickIndex === lastTickIndex ) {
			self.complete();
		}
	};
	
	this.start = function(newEndValue, newDuration, newOnCompleted, newonStopped) {
		if ( hasStarted ) {
			self.stop();
		}
		
		hasStarted = true;
		
		endValue = newEndValue;
		duration = newDuration;
		onCompleted = newOnCompleted;
		onStopped = newonStopped;
		
		value = startValue = Number(object[property]);
		difference = endValue - startValue;
		tickCount = duration / interval;
		
		if ( tickCount === 0 ) {
			this.complete(); // If we don't do this, we would divide by zero when calculating amount.
		} else {
			amount = difference / tickCount;
			tickIndex = -1;
			lastTickIndex = tickCount - 1;
			
			timer = window.setInterval(tick, interval);
		}
	};
	
	this.stop = function() {
		if ( timer !== null ) {
			window.clearInterval(timer);
		}
		
		hasStarted = false;
		isPaused = false;
		
		if ( onStopped !== undefined ) {
			onStopped();
		}
	};
	
	this.complete = function() {
		this.stop();
		object[property] = endValue; // If there are rounding errors.
		
		if ( onCompleted !== undefined ) {
			onCompleted();
		}
	}
	
	this.pause = function() {
		if ( hasStarted && !isPaused ) {
			window.clearInterval(timer);
			
			var elapsed = (tickIndex + 1) * interval;
			var newDuration = duration - elapsed;
			duration = newDuration;
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