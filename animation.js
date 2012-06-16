function Animation(object, property, endValue, duration) {
	var self = this;
	
	// Interval taken from jQuery (13) but rounded up.
	// Rounding down to only 10 makes setInterval drift.
	var interval = 20;
	var startValue;
	var difference;
	var tickCount;
	var amount;
	
	var value; // Separate state variable to avoid automatic type conversions.
	var timer;
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
	
	this.start = function() {
		self.cancel();
		
		value = startValue = Number(object[property]);
		difference = endValue - startValue;
		tickCount = duration / interval;
		amount = difference / tickCount;
		
		tickIndex = -1;
		lastTickIndex = tickCount - 1
		
		timer = window.setInterval(tick, interval);
	};
	
	this.cancel = function() {
		window.clearInterval(timer);
	};
	
	this.complete = function() {
		window.clearInterval(timer);
		object[property] = endValue; // If there are rounding errors.
	}
}