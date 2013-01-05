// This file is part of Ambience Stage
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Array.prototype.contains = function(value) {
	return this.indexOf(value) !== -1;
};

Array.prototype.remove = function(value) {
	var index = this.indexOf(value);
	if ( index !== -1 ) {
		this.splice(index, 1);
	}
};

Array.prototype.clear = function() {
	this.splice(0);
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

String.prototype.contains = function(substring) {
	return this.indexOf(substring) !== -1;
};

String.prototype.startsWith = function(prefix) {
	return this.indexOf(prefix) === 0;
};

String.prototype.endsWith = function(suffix) {
	return this.lastIndexOf(suffix) === this.length - suffix.length;
};
