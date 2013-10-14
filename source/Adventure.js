// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Adventure = function() {
	var self = this;
	
	self.title = '';
	self.scenes = [];
	self.creationDate = new Date();
	self.modificationDate = self.creationDate;
	
	self.version = Ambience.Adventure.version;
	
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

Ambience.Adventure.prototype.toConfig = function() {
	var copy = copyObject(this);
	
	copy.scenes.forEach(function(scene) {
		// Delete URLs as these are likely or guaranteed to change between sessions.
		// Filenames and MIME types might change, but they usually don't and will provide useful information while files are loading, so keep them.
		
		if ( scene.image.file ) {
			delete scene.image.file.url;
			delete scene.image.file.previewUrl;
		}
		
		scene.sound.tracks.forEach(function(sound) {
			delete sound.url;
		});
		
		// Remove file load progress because this is only a GUI concern.
		// Note that we're working on a copy, so the getter property "media" is not available.
		// The reason getters are not copied is because they would be redundantly serialized, which is not desirable.
		if ( scene.image.file ) {
			delete scene.image.file.progress;
		}
		scene.sound.tracks.forEach(function(file) {
			delete file.progress;
			delete file.previewUrl;
		});
	});
	
	// Delete adventure ID; this is storage-specific.
	delete copy.id;
	
	// Delete info on editing rights from Google Drive.
	delete copy.isEditable;
	
	// Delete these; they are stored as file metadata.
	delete copy.creationDate;
	delete copy.modificationDate;
	
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

Ambience.Adventure.fromConfig = function(config) {
	Ambience.Adventure.upgradeConfig(config);

	var adventure = new Ambience.Adventure();
	adventure.title = config.title;
	adventure.version = config.version;
	
	config.scenes.forEach(function(sceneConfig) {
		var scene = Ambience.App.Scene.fromConfig(sceneConfig);
		adventure.scenes.push(scene);
	});
	
	return adventure;
};

Ambience.Adventure.upgradeConfig = function(config) {
	if ( config.version === 2 ) {
		// Adventures of version 2 only contain IDs of media files, not names and MIME types.
		// Add these here so that they are properly queued when downloaded.
		config.scenes.forEach(function(scene) {
			var imageFile = scene.image.file;
			if ( imageFile ) {
				imageFile.name = 'Unknown filename';
				imageFile.mimeType = 'image/unknown';
			}
			
			scene.sound.tracks.forEach(function(soundFile) {
				soundFile.name = 'Unknown filename';
				soundFile.mimeType = 'audio/unknown';
			});
		});
		
		config.version = 3;
	}
};

// Adventure version, unrelated to application version.
// Should be increased whenever the format of an adventure changes.
Ambience.Adventure.version = 3;

// New in version 3: Names and MIME types of files are serialized.