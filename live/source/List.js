// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

var List = function() {};

List.prototype = [];

List.prototype.remove = function(value) {
	var index = this.indexOf(value);
	if ( index !== -1 ) {
		this.splice(index, 1);
	}
};

List.prototype.clear = function() {
	return this.splice(0, this.length);
};

Object.defineProperty(List.prototype, 'last', {
	get: function() {
		return this[this.length - 1];
	}
});