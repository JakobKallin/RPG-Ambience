Object.overlay = function(base, overlay) {
	for ( var property in base ) {
		if ( property in overlay ) {
			if ( base[property] instanceof Array ) {
				overlay[property].forEach(function(subvalue) {
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

Object.getPropertyDescriptor = function(object, property) {
	var ownDescriptor = Object.getOwnPropertyDescriptor(object, property);
	var proto = Object.getPrototypeOf(object);	
	return ownDescriptor || Object.getPropertyDescriptor(proto, property) || undefined;
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

Array.prototype.closest = function(value) {
	var index = this.indexOf(value);
	
	// If there is a next value, choose it.
	if ( (index + 1) in this ) {
		return this[index + 1];
	// Otherwise choose the previous value.
	} else if ( (index - 1) in this ) {
		return this[index - 1];
	// Otherwise there is no value at all.
	} else {
		return null;
	}
};

Array.prototype.insertAfter = function(value, previous) {
	// "index" is 0 if previous is not in the list, so "value" is added to the beginning.
	var index = this.indexOf(previous) + 1;
	this.splice(index, 0, value);
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

String.prototype.firstToUpperCase = function() {
	return this.charAt(0).toUpperCase() + this.substring(1);
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

(function() {
	var audio = document.createElement('audio');
	window.audioCanPlayType = function(mimeType) {
		return Boolean(audio.canPlayType(mimeType));
	}
})();