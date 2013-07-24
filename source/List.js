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