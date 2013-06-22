// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Library = function(backend) {
	this.backend = backend;
};

Ambience.Library.prototype = {
	adventures: null,
	loadAdventures: function() {
		var library = this;
		return this.backend.loadAdventures().then(function(loadedAdventures) {
			library.adventures = loadedAdventures;
		});
	},
	selectImage: function() {
		return this.backend.selectImage();
	}
};