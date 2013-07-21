// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

(function() {
	Ambience.Library = function(backend) {
		this.sessionExpiration = null;
		this.hasLoggedOut = false;
		
		this.backend = backend;
		this.adventures = null;
		this.adventuresToRemove = [];
		this.latestFileContents = {};
		this.imageQueue = new Ambience.TaskQueue(this.backend.imageLimit || 1);
		this.soundQueue = new Ambience.TaskQueue(this.backend.soundLimit || 1);
	};

	Ambience.Library.prototype = {
		get name() {
			return this.backend.name;
		},
		login: function() {
			console.log('Logging in to backend ' + this.backend.name);
			
			var library = this;
			var backend = this.backend;
			
			return this.backend.login().then(extendSession);
			
			function extendSession(sessionExpiration) {
				if ( library.hasLoggedOut ) {
					return;
				}
				
				library.sessionExpiration = sessionExpiration;
				
				if ( sessionExpiration === Infinity ) {
					// Do nothing; we never need to login again.
					// This will likely only ever apply to a local backend.
				} else if ( sessionExpiration instanceof Date ) {
					var now = new Date();
					var timeToExpiration = sessionExpiration.getTime() - now.getTime();
					var timeToNextLogin = timeToExpiration - (backend.loginAgainAdvance || 60 * 1000);
					window.setTimeout(loginAgain, timeToNextLogin);
					
					console.log('Time to expiration: ' + timeToExpiration);
					console.log('Time to next login: ' + timeToNextLogin);
				} else {
					throw new Error('Logging in to backend did not return a valid expiration date.');
				}
			}
			
			function loginAgain() {
				if ( library.hasLoggedOut ) {
					return;
				}
				
				console.log('Logging in to backend ' + backend.name + ' again')
				return backend.loginAgain().then(extendSession);
			}
		},
		// Logging out is currently only used to stop callbacks in the test suite.
		logout: function() {
			this.hasLoggedOut = true;
		},
		get isLoggedIn() {
			var now = new Date();
			return now < this.sessionExpiration;
		},
		loadAdventures: function() {
			var library = this;
			
			return (
				this.backend
				.downloadAdventures()
				.then(parseAdventureFiles)
				.then(addAdventures)
			);
			
			function parseAdventureFiles(files) {
				return when.map(files, function(file) {
					// Important: store the file contents so that it will not be saved if unchanged.
					// Without this, every adventure will be saved once even if it is unchanged.
					// This is because "latestFileContents" is otherwise only set when uploading, not when downloading.
					library.latestFileContents[file.id] = file.contents;
					
					var config = JSON.parse(file.contents);
					var adventure = Ambience.Adventure.fromConfig(config);
					adventure.id = file.id;
					console.log('Parsed adventure "' + adventure.title + '" (' + adventure.id + ')');
					return adventure;
				});
			}
			
			function addAdventures(adventures) {
				adventures.sort(function(a, b) {
					return b.creationDate - a.creationDate;
				});
				library.adventures = adventures;
				return adventures;
			}
		},
		syncAdventures: function() {
			var library = this;
			var backend = this.backend;
			
			var savePromises = library.adventures.map(function(adventure) {
				// Note that the file object is only used once; the resulting file ID is saved into the adventure itself. A new file object is created the next time that the adventure is saved.
				var file = library.fileFromAdventure(adventure);
				return library.saveFile(file).then(function(fileId) {
					// Save the ID so that it can be used later to prevent uploads of unchanged files.
					adventure.id = fileId;
				});
			});
			
			var removePromises = library.adventuresToRemove.map(function(adventure) {
				// We can only remove the adventure if it has an ID, which means that it's already saved.
				if ( adventure.id ) {
					console.log('Removing adventure "' + adventure.title + '"');
					library.filesBeingSynced += 1;
					return backend.removeFile(adventure.id).then(function() {
						library.filesBeingSynced -= 1;
					});
				} else {
					console.log('Not removing adventure "' + adventure.title + '" because it has not been saved yet');
					return true;
				}
			});
			library.adventuresToRemove.clear();
			
			return when.all(savePromises.concat(removePromises));
		},
		filesBeingSynced: 0,
		get adventuresAreBeingSynced() {
			return this.filesBeingSynced > 0;
		},
		saveFile: function(file) {
			var library = this;
			
			if ( file.id && file.contents === library.latestFileContents[file.id] ) {
				console.log('Not uploading file "' + file.name + '", because it is unchanged.');
				return when(file.id);
			} else {
				library.filesBeingSynced += 1;
				return library.backend.uploadFile(file).then(function(fileId) {
					// "fileId" is new if there was none before.
					library.latestFileContents[fileId] = file.contents;
					return fileId;
				})
				.otherwise(function(e) {
					console.log('There was an error uploading file "' + file.name + '"');
				})
				.ensure(function() {
					library.filesBeingSynced -= 1;
				});
			}
		},
		fileFromAdventure: function(adventure) {
			var file = new Ambience.BackendFile();
			file.id = adventure.id;
			file.name = adventure.title + '.ambience';
			file.mimeType = 'application/json';
			
			var config = adventure.toConfig();
			var json = angular.toJson(config);
			file.contents = json;
			
			return file;
		},
		
		exampleMedia: {
			'example:city': { name: 'ishtar_rooftop', type: 'image' },
			'example:dragon-image': { name: 'sintel-wallpaper-dragon', type: 'image' },
			'example:dragon-sound': { name: 'dragon', type: 'audio' },
			'example:music': { name: '9-Trailer_Music', type: 'audio' }
		},
		loadExampleMediaFile: function(file) {
			var name = this.exampleMedia[file.id].name;
			var type = this.exampleMedia[file.id].type;
			if ( type === 'audio' && window.audioCanPlayType('audio/ogg') ) {
				var mimeType = 'audio/ogg';
				var extension = 'ogg';
			} else if ( type === 'audio' ) {
				var mimeType = 'audio/mpeg';
				var extension = 'mp3';
			} else {
				var mimeType = 'image/jpeg';
				var extension = 'jpg';
			}
			
			file.url = 'example/' + name + '.' + extension;
			file.name = name + '.' + extension;
			file.mimeType = mimeType;
			
			// We don't have a "deferred" to send progress events through, so simply set 100% completion directly on the file.
			file.progress = 1.0;
			
			return when(file);
		},
		// Load image files and sound files in batches.
		loadMediaFile: function(file) {
			if ( this.exampleMedia[file.id] ) {
				return this.loadExampleMediaFile(file);
			}
			
			var queue = file.mimeType.startsWith('image') ? this.imageQueue : this.soundQueue;
			var backend = this.backend;
			
			var download = function() {
				return backend.downloadMediaFile(file);
			};
			
			return queue.add(download);
		},
		
		selectImageFile: function() {
			return this.backend.selectImageFile();
		},
		get selectImageFileLabel() {
			return this.backend.selectImageFileLabel;
		},
		
		selectSoundFiles: function() {
			return this.backend.selectSoundFiles();
		},
		get selectSoundFilesLabel() {
			return this.backend.selectSoundFilesLabel;
		},
		
		saveAdventureToComputer: function(adventure) {
			var json = angular.toJson(adventure.toConfig());
			var blob = new Blob([json], { type: 'application/json' });
			var filename = adventure.title + '.ambience';
			
			if ( navigator.msSaveBlob ) {
				navigator.msSaveBlob(blob, filename);
			} else {
				var url = URL.createObjectURL(blob);
				var link = document.createElement('a');
				link.download = filename;
				link.href = url;
				link.target = '_blank';
				link.style.display = 'none';
				
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				
				// Revoking the blob URL here seems to cause download failures sometimes, so let's not do it.
				// URL.revokeObjectURL(url);
			}
		}
	};
})();