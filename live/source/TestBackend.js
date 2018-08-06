// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

Ambience.TestBackend = function() {
	this.isOnline = true;
	this.imageLimit = 1;
	this.soundLimit = 1;
	this.sessionDuration = 300;
	this.loginAgainAdvance = 200;
};

Ambience.TestBackend.prototype = {
	name: 'Test',
	login: function() {
		var backend = this;
		
		return when.delay(100).then(function() {
			var expiration = new Date();
			expiration.setMilliseconds(expiration.getMilliseconds() + backend.sessionDuration);
			return expiration;
		});
	},
	loginAgain: function() {
		var backend = this;
		
		return when.delay(100).then(function() {
			var expiration = new Date();
			expiration.setMilliseconds(expiration.getMilliseconds() + backend.sessionDuration);
			return expiration;
		});
	},
	downloadAdventures: function() {
		var files = [new Ambience.BackendFile(), new Ambience.BackendFile()];
		files.forEach(function(file, index) {
			file.id = index;
			file.name = index;
			file.mimeType = 'application/json';
			file.contents = Ambience.ExampleAdventure.json;
		});
		
		return when.all([
			when.delay(100, files[0]),
			when.delay(200, files[1])
		]);
	},
	// Media files, whose contents will not be used directly but rather through URLs.
	downloadMediaFile: function(id) {
		if ( id === 'error' ) {
			return when.reject(when.delay(100));
		} else {
			return when.delay(100, {
				id: id,
				url: id + '.jpg',
				name: id,
				mimeType: 'image/jpeg'
			});
		}
	},
	uploadFile: function(file) {
		return when.delay(100).then(function() {
			return file.id || file.name;
		});
	},
	selectImageFile: function() {
		var deferred = when.defer();
		
		setTimeout(function() {
			deferred.notify(1);
		}, 100);
		
		setTimeout(function() {
			var media = {
				id: 'image',
				url: 'image.svg',
				name: 'image',
				mimeType: 'image/svg+xml'
			};
			deferred.resolve(media);
		}, 200);

		return deferred.promise;
	}
};

(function() {
	// Make all methods fail unless the backend is online.
	for ( var property in Ambience.TestBackend.prototype ) {
		var value = Ambience.TestBackend.prototype[property];
		if ( typeof value === 'function' ) {
			makeFallible(property);
		}
	}
	
	function makeFallible(property) {
		var originalMethod = Ambience.TestBackend.prototype[property];
		Ambience.TestBackend.prototype[property] = function callIfOnline() {
			if ( this.isOnline ) {
				return originalMethod.apply(this, arguments);
			} else {
				return when.reject(when.delay(100));
			}
		};
	}
})();