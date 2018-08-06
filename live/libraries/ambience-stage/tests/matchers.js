jasmine.Matchers.prototype.toBeBetween = function(first, second) {
	var lowest = Math.min(first, second);
	var highest = Math.max(first, second);
	
	return lowest <= this.actual && this.actual <= highest;
};