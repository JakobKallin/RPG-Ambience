// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

window.List = function() {};

window.List.prototype = [];

Object.defineProperty(window.List.prototype, 'last', {
	get: function() {
		return this[this.length - 1];
	}
});