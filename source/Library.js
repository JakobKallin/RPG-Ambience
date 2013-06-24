// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Library = function(backend) {
	this.backend = backend;
	this.adventures = null;
	this.latestFileContents = {};
	// Promises that immediately return, used as base cases for "loadImage" and "loadSound" below.
	this.latestImagePromise = when(true);
	this.latestSoundPromise = when(true);
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
	// Load image files and sound files one at a time, respectively.
	// This can probably be optimized by allowing more simultaneous downloads (especially of images), but that might be a bit more complex. The when.js abstractions should be helpful.
	// For each media type (image and sound), a promise is created whenever a download is started from the backend. Whenever this method is called, the start of that download is added as a success handler for the latest of these promises. The effect is that a chain of promises is created, each one being triggered after the previous one has completed.
	loadMedia: function(media) {
		var mediaType = media.mimeType.startsWith('audio') ? 'sound' : 'image';
		var latestPromiseProperty = 'latest' + mediaType.firstToUpperCase() + 'Promise';
		var latestPromise = this[latestPromiseProperty];
		var backend = this.backend;
		
		var download = function() {
			return backend.downloadMediaFile(media.id);
		};
		
		// This seems to be equivalent to the "always" method in when.js, which is now deprecated. I believe it could cause a problem since the failure of the "latestPromise" will not be notified because the new download is triggered in its "catch block". It does not seem to be a problem here, however, since the next download is always started after the previous one has already notified its failure.
		// At any rate, using one of the other when.js abstractions to implement this rate limiting might solve it in a more elegant way.
		return this[latestPromiseProperty] = latestPromise.then(download, download);
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