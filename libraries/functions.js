Array.prototype.contains = function(value) {
	return this.indexOf(value) !== -1;
};

Array.prototype.first = function(predicate) {
	for ( var i = 0; i < this.length; i++ ) {
		var value = this[i];
		if ( predicate(value) ) {
			return value;
		}
	}
	return null;
};

Array.prototype.randomIndex = function() {
	return Math.floor(Math.random() * this.length);
};

String.prototype.startsWith = function(prefix) {
	return this.indexOf(prefix) === 0;
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};