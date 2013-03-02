// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Adventure = function(app) {
	var self = this;
	
	self.title = '';
	self.scenes = [];
	
	// Adventure version, unrelated to application version.
	// Should be increased whenever the format of an adventure changes.
	self.version = 1;
	
	Object.defineProperty(self, 'media', {
		get: function() {
			return self.scenes.map(get('media')).flatten();
		}
	});
	
	self.onDrag = function(viewModel, dragEvent) {
		dragEvent.preventDefault();
		dragEvent.stopPropagation();
		dragEvent.dataTransfer.dropEffect = 'copy';
	};
	
	self.convertScene = function(scene) {
		var converted = new Ambience.Scene();
		
		converted.isMixin = scene.mixin;

		var fadeDuration = scene.fade * 1000;
		converted.fade = {
			in: scene.fadeDirection.contains('in') ? fadeDuration : 0,
			out: scene.fadeDirection.contains('out') ? fadeDuration : 0,
		};

		converted.background = { color: scene.background };
		
		if ( scene.image.path.length > 0 ) {
			converted.image = {
				url: scene.image.path,
				style: { backgroundSize: scene.image.size }
			};
		}
		
		var actualTracks = scene.sound.tracks.filter(function(track) {
			return track.path.length > 0 && track.isPlayable;
		});
		if ( actualTracks.length > 0 ) {
			converted.sound = {
				tracks: actualTracks.map(get('path')),
				overlap: scene.sound.crossover,
				shuffle: scene.sound.shuffle,
				loop: scene.sound.loop,
				volume: scene.sound.volume / 100
			}
		}
		
		if ( scene.text.string ) {
			converted.text = {
				string: scene.text.string,
				style: {
					fontSize: (window.innerWidth * scene.text.size / 100) + 'px',
					fontFamily: scene.text.font,
					fontStyle: scene.text.style,
					fontWeight: scene.text.weight,
					color: scene.text.color,
					textAlign: scene.text.alignment,
					padding: '0 ' + (window.innerWidth * scene.text.padding / 100) + 'px'
				}
			};
		}
		
		return converted;
	};
	
	self.fadeOutTopmost = function() {
		ambience.fadeOutTopmost();
	};
	
	self.current = undefined;
	
	self.select = function(scene) {
		self.current = scene;
	};
	
	self.addScene = function() {
		var newScene = new Ambience.App.Scene();
		self.scenes.push(newScene);
		self.select(newScene);
		
		return newScene;
	};
	
	Object.defineProperty(self, 'previous', {
		get: function() {
			var index = self.scenes.indexOf(self.current);
			if ( index > 0 ) {
				return self.scenes[index - 1];
			} else {
				return null;
			}
		}
	});
	
	Object.defineProperty(self, 'next', {
		get: function() {
			var index = self.scenes.indexOf(self.current);
			if ( index < self.scenes.length - 1 ) {
				return self.scenes[index + 1];
			} else {
				return null;
			}
		}
	});
	
	Object.defineProperty(self, 'last', {
		get: function() {
			var index = self.scenes.length - 1;
			if ( index !== -1 ) {
				return self.scenes[index];
			} else {
				return null;
			}
		}
	});
	
	self.removeSelected = function() {
		var previous = self.previous;
		var current = self.current;
		var next = self.next;
		
		if ( previous ) {
			self.select(previous);
		} else if ( next ) {
			self.select(next);
		} else {
			self.addScene();
		}
		
		// Note that `current` is now different from `self.current`.
		var index = self.scenes.indexOf(current);
		self.scenes.splice(index, 1);
	};
	
	self.copyScene = function(original) {
		return original.copy();
	};
	
	self.copySelected = function() {
		var newScene = self.copyScene(self.current);
		
		var index = self.scenes.indexOf(self.current) + 1
		self.scenes.splice(index, 0, newScene);
		self.select(newScene);
	};
	
	var bindableKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
	var specialKeyFound = false;
	self.bindSpecialKey = function(scene, event) {
		var keyName = Key.name(event.keyCode);
		if ( keyName === 'Tab' ) {
			specialKeyFound = true; // Prevent bindTextKey from triggering.
			return true;
		} else if ( ['Backspace', 'Delete'].contains(keyName) ) {
			specialKeyFound = true;
			scene.key = '';
			return true;
		} else if ( bindableKeys.contains(keyName) ) {
			specialKeyFound = true;
			scene.key = keyName;
		} else {
			return true;
		}
	};
	
	self.bindTextKey = function(scene, event) {
		if ( specialKeyFound ) {
			return true;
		} else {
			var keyText = String.fromCharCode(event.which);
			if ( keyText.isCharacter ) {
				scene.key = keyText.toUpperCase();
			}
		}
	};
	
	self.stopKeyBinding = function(scene, event) {
		specialKeyFound = false;
	};
	
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
	
	self.willBeRemoved = false;
	
	Object.defineProperty(self, 'dropdownTitle', {
		get: function() {
			if ( self.willBeRemoved ) {
				return self.title + ' (will be deleted)';
			} else {
				return self.title;
			}
		}
	});
	
	Object.defineProperty(self, 'removalButtonText', {
		get: function() {
			if ( self.willBeRemoved ) {
				return 'Recover Adventure';
			} else {
				return 'Delete Adventure';
			}
		}
	});
	
	var mediaLoaded = false;
	self.loadMedia = function() {
		if ( mediaLoaded ) {
			return;
		}
		
		mediaLoaded = true;
		
		self.scenes.forEach(function(scene) {
			if ( scene.image.id ) {
				app.media.load(scene.image.id, function(url) {
					scene.image.path = url;
				});
			}
			
			scene.sound.tracks.forEach(function(track) {
				// At first assume the track is playable.
				// This may be invalidated after loading the file.
				track.isPlayable = true;
				if ( track.id ) {
					app.media.load(track.id, function(url, mimeType) {
						track.path = url;
						track.isPlayable = Boolean(
							document.createElement('audio').canPlayType(mimeType)
						);
					});
				}
			});
		});
	};
};

Ambience.App.Adventure.version = 1;
