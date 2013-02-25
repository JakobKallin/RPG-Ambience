Object.overlay = function(base, overlay) {
	for ( var property in base ) {
		if ( property in overlay ) {
			if ( base[property] instanceof Array ) {
				overlay[property].map(function(subvalue) {
					base[property].push(subvalue);
				});
			} else if ( base[property] instanceof Object ) {
				Object.overlay(base[property], overlay[property])
			} else {
				base[property] = overlay[property];
			}
		}
	}
};

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

Array.prototype.flatten = function() {
	var array = [];
	return array.concat.apply(array, this);
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

String.prototype.firstToLowerCase = function() {
	return this.charAt(0).toLowerCase() + this.substring(1);
};

Object.defineProperty(String.prototype, 'isCharacter', {
	get: function() {
		return this.match(/^[^\b\f\r\n\t\v\s\0]$/);
	}
});

window.get = function(property) {
	return function(object) {
		return object[property];
	};
};