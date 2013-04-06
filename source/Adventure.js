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
			return this.scenes.map(get('media')).flatten();
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
};

Ambience.App.Adventure.prototype.toConfig = function() {
	var copy = copyObject(this);
	
	// Delete everything except the file IDs, because other info might change.
	copy.scenes.forEach(function(scene) {
		if ( scene.image.file ) {
			delete scene.image.file.url;
			delete scene.image.file.thumbnail;
			delete scene.image.file.name;
			delete scene.image.file.mimeType;
		}
		
		scene.sound.tracks.forEach(function(sound) {
			delete sound.url;
			delete sound.name;
			delete sound.mimeType;
		})
	});
	
	// Delete adventure ID; this is storage-specific.
	delete copy.id;
	
	// Delete info on editing rights from Google Drive.
	delete copy.isEditable;
	
	return copy;
	
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