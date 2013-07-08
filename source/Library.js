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
				.then(parseAdventureJSON)
				.then(addAdventures)
			);
			
			function parseAdventureJSON(jsonList) {
				return when.map(jsonList, function(json) {
					var config = JSON.parse(json);
					return Ambience.Adventure.fromConfig(config);
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
		saveAdventures: function() {
			var library = this;
			var backend = this.backend;
			
			return when.parallel(
				library.adventures
				.map(function(adventure) {
					var file = {
						id: adventure.id,
						name: adventure.title,
						contents: adventure.toConfig()
					};
					return function() {
						return library.saveFile(file);
					};
				})
			);
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
