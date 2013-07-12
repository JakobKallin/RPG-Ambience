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
					return backend.removeFile(adventure.id);
				} else {
					console.log('Not removing adventure "' + adventure.title + '" because it has not been saved yet');
					return true;
				}
			});
			library.adventuresToRemove.clear();
			
			return when.all(savePromises.concat(removePromises));
		},
		filesBeingSaved: 0,
		get adventuresAreBeingSaved() {
			return this.filesBeingSaved > 0;
		},
		saveFile: function(file) {
			var library = this;
			
			if ( file.id && file.contents === library.latestFileContents[file.id] ) {
				console.log('Not uploading file "' + file.name + '", because it is unchanged.');
				return when(file.id);
			} else {
				library.filesBeingSaved += 1;
				return library.backend.uploadFile(file).then(function(fileId) {
					// "fileId" is new if there was none before.
					library.latestFileContents[fileId] = file.contents;
					return fileId;
				})
				.otherwise(function(e) {
					console.log('There was an error uploading file "' + file.name + '"');
				})
				.ensure(function() {
					library.filesBeingSaved -= 1;
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
		
		// Load image files and sound files in batches.
		loadMediaFile: function(file) {
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
		}
	};

	Ambience.TaskQueue = function(limit) {
		var inLine = [];
		var inProgress = [];
		
		var add = function(task) {
			var deferred = when.defer();
			deferred.task = task;
			
			if ( inProgress.length < limit ) {
				execute(deferred);
			} else {
				inLine.push(deferred);
			}
			
			return deferred.promise;
		};
		
		var execute = function(deferred) {
			inProgress.push(deferred);
			return (
				deferred.task()
				.then(deferred.resolve, deferred.reject, deferred.notify)
				.ensure(function() {
					onDeferredCompleted(deferred)
				})
			);
		};
		
		var onDeferredCompleted = function(deferred) {
			inProgress.remove(deferred);
			var nextDeferred = inLine.shift();
			if ( nextDeferred ) {
				execute(nextDeferred);
			}
		};
		
		return {
			add: add
		};
	};
})();
