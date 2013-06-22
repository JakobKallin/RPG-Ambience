// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Library = function(backend) {
	this.backend = backend;
};

Ambience.Library.prototype = {
	loadAdventures: function() {
		return this.backend.loadAdventures();
	},
	selectImage: function() {
		return this.backend.selectImage();
	}
};