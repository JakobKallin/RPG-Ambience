// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.TestBackend = function() {
	this.isOnline = true;
};

Ambience.TestBackend.prototype = {
	listAdventures: function() {
		return when.parallel([
			function() {
				return when.delay(100, 'Adventure one');
			},
			function() {
				return when.delay(200, 'Adventure two');
			}
		]);
	},
	// Files with text contents (adventures in this case).
	downloadTextFile: function(id) {
		return when.delay(100, {
			id: id,
			contents: JSON.stringify({ id: id })
		});
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
		return when.delay(100);
	},
	selectImage: function() {
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