// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

Ambience.Library = function(backend) {
	this.sessionExpiration = null;
	this.hasLoggedOut = false;
	
	this.backend = backend;
	this.adventures = null;
	this.latestFileContents = {};
	this.imageQueue = new Ambience.TaskQueue(this.backend.imageLimit);
	this.soundQueue = new Ambience.TaskQueue(this.backend.soundLimit);
};

Ambience.Library.prototype = {
	login: function() {
		console.log('Logging in to backend');
		
		var library = this;
		var backend = this.backend;
		
		return this.backend.login().then(extendSession);
		
		function extendSession(sessionExpiration) {
			if ( library.hasLoggedOut ) {
				return;
			}
			
			library.sessionExpiration = sessionExpiration;
			
			var now = new Date();
			var timeToExpiration = sessionExpiration.getTime() - now.getTime();
			var timeToNextLogin = timeToExpiration - backend.loginAgainAdvance;
			console.log('Time to expiration: ' + timeToExpiration);
			console.log('Time to next login: ' + timeToNextLogin);
			
			window.setTimeout(loginAgain, timeToNextLogin);
		}
		
		function loginAgain() {
			if ( library.hasLoggedOut ) {
				return;
			}
			
			console.log('Logging in to backend again')
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
	loadMedia: function(media) {
		var mediaType = media.mimeType.startsWith('audio') ? 'sound' : 'image';
		var queue = this[mediaType + 'Queue'];
		var backend = this.backend;
		
		var download = function() {
			return backend.downloadMediaFile(media.id);
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
	selectImage: function() {
		return this.backend.selectImage();
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
			.then(deferred.resolve)
			.otherwise(deferred.reject)
			.ensure(function() {
				onDeferredCompleted(deferred)
			})
		);
	};
	
	var onDeferredCompleted = function(deferred) {
		inProgress.remove(deferred);
		var nextTask = inLine.shift();
		if ( nextTask ) {
			execute(nextTask);
		}
	};
	
	return {
		add: add
	};
};