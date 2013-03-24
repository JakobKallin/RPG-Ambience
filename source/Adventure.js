// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Adventure = function() {
	var self = this;
	
	self.title = '';
	self.scenes = [];
	self.creationDate = new Date();
	
	self.version = Ambience.App.Adventure.version;
	
	Object.defineProperty(self, 'media', {
		get: function() {
			return self.scenes.map(get('media')).flatten();
		}
	});
	
	self.namedScene = function(name) {
		if ( name.length > 0 ) {
			return self.scenes.first(function(scene) {
				return scene.name && scene.name.toUpperCase().startsWith(name.toUpperCase());
			});
		} else {
			return null;
		}
	};
	
	self.keyedScenes = function(targetKey) {
		if ( targetKey ) {
			return self.scenes.filter(function(scene) {
				return scene.key && scene.key === targetKey;
			});
		} else {
			return [];
		}
	};
	
	// var mediaLoaded = false;
	// self.loadMedia = function() {
	// 	if ( mediaLoaded ) {
	// 		return;
	// 	}
		
	// 	mediaLoaded = true;
		
	// 	self.scenes.forEach(function(scene) {
	// 		if ( scene.image.id ) {
	// 			app.media.load(scene.image.id, function(url) {
	// 				scene.image.path = url;
	// 			});
	// 		}
			
	// 		scene.sound.tracks.forEach(function(track) {
	// 			// At first assume the track is playable.
	// 			// This may be invalidated after loading the file.
	// 			track.isPlayable = true;
	// 			if ( track.id ) {
	// 				app.media.load(track.id, function(url, mimeType) {
	// 					track.path = url;
	// 					track.isPlayable = Boolean(
	// 						document.createElement('audio').canPlayType(mimeType)
	// 					);
	// 				});
	// 			}
	// 		});
	// 	});
	// };
};

Ambience.App.Adventure.prototype.toConfig = function() {
	return copyObject(this);
	
	function copyObject(original) {
		var copy = {};
		for ( var property in original ) {
			copyProperty(original, property, copy);
		}
		
		return copy;
	}
	
	function copyProperty(original, property, copy) {
		var value = original[property];
		var descriptor = Object.getPropertyDescriptor(original, property);
		
		// Do not copy if getter and/or setter.
		if ( !descriptor.get && !descriptor.set ) {
			if ( value instanceof Date ) {
				copy[property] = new Date(value.getTime());
			} else if ( value instanceof Array ) {
				copy[property] = new Array(value.length);
				for ( var i = 0; i < value.length; ++i ) {
					copyProperty(value, i, copy[property]);
				}
			} else if ( value instanceof Function ) {
				// Do nothing.
			} else if ( value instanceof Object ) {
				copy[property] = copyObject(value);
			} else {
				copy[property] = value;
			}
		}
	}
};

Ambience.App.Adventure.fromConfig = function(config) {
	var adventure = new Ambience.App.Adventure();
	
	adventure.title = config.title;
	adventure.version = config.version;
	adventure.creationDate = new Date(config.creationDate);
	
	config.scenes.forEach(function(sceneConfig) {
		var scene = new Ambience.App.Scene();
		Object.overlay(scene, sceneConfig);
		adventure.scenes.push(scene);
	});
	
	return adventure;
};

// Adventure version, unrelated to application version.
// Should be increased whenever the format of an adventure changes.
Ambience.App.Adventure.version = 2;