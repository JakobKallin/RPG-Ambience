// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Library = function(backend) {
	this.backend = backend;
	this.adventures = null;
	this.latestFileContents = {};
	// A promise that immediately returns, used as a base case for "loadMedia" below.
	this.latestMediaPromise = when(true);
};

Ambience.Library.prototype = {
	loadAdventures: function() {
		var library = this;
		
		return (
			this.backend
			.listAdventures()
			.then(downloadAdventureFiles)
			.then(parseAdventureFiles)
			.then(addAdventures)
		);
		
		function downloadAdventureFiles(ids) {
			return when.parallel(ids.map(function(id) {
				return function() {
					return library.backend.downloadTextFile(id);
				};
			}));
		}
		
		function parseAdventureFiles(files) {
			return when.map(files, function(file) {
				return JSON.parse(file.contents);
			});
		}
		
		function addAdventures(adventures) {
			library.adventures = adventures;
		}
	},
	saveAdventures: function() {
		var library = this;
		var backend = this.backend;
		
		return when.parallel(
			library.adventures
			.map(function(adventure) {
				var file = {
					id: adventure.id,
					name: adventure.title,
					contents: JSON.stringify(adventure)
				};
				return function() {
					return library.saveFile(file);
				};
			})
		);
	},
	// Load media files one at a time.
	// This can probably be implemented using some of the abstractions in when.js.
	// It should also be improved so that it loads images before audio.
	loadMedia: function(id) {
		var backend = this.backend;
		
		var newMediaPromise = this.latestMediaPromise.then(function() {
			return backend.downloadMediaFile(id);
		});
		this.latestMediaPromise = newMediaPromise;
		return this.latestMediaPromise;
	},
	saveFile: function(file) {
		var library = this;
		
		if ( file.contents === this.latestFileContents[file.id] ) {
			// "false" means that the file has not been uploaded.
			return false;
		} else {
			return this.backend.uploadFile(file).then(function() {
				library.latestFileContents[file.id] = file.contents;
				// "true" means that the file has been uploaded.
				return true;
			});
		}
	},
	selectImage: function() {
		return this.backend.selectImage();
	}
};