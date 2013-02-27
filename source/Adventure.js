// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Adventure = function(app) {
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
	
	self.newScene = function() {
		return {
			name: '',
			key: '',
			layer: 'background',
			mixin: false,
			background: {
				color: '#000000'
			},
			fade: 0,
			fadeDirection: 'in out',
			get isForeground() {
				return this.layer === 'foreground'
			},
			
			image: {
				path: '',
				name: '',
				id: '',
				size: 'contain',
				get css() {
					return 'url("' + this.path + '")';						
				},
				onSelected: function(viewModel, changeEvent) {
					var file = changeEvent.target.files[0];
					if ( file ) {
						this.load(file);
					};
				},
				load: function(file) {
					var objectURL = window.URL.createObjectURL(file);
					var id = objectURL.replace(/^blob:/, '');
					
					var scene = this;
					var fileName = file.name; // This is to make sure the file object isn't removed.
					var onSaved = function() {
						scene.name = fileName;
						scene.path = objectURL;
						scene.id = id;
					};
					
					app.media.save(id, file, onSaved);
				},
				unload: function() {
					this.path = '';
					this.name = '';
					this.id = '';
				}
			},
			
			sound: {
				tracks: [],
				loop: true,
				shuffle: false,
				volume: 100,
				crossover: 0,
				onSelected: function(viewModel, selectEvent) {
					var newFiles = selectEvent.target.files;
					for ( var i = 0; i < newFiles.length; ++i ) {
						this.load(newFiles[i]);
					}
				},
				load: function(file) {
					var objectURL = window.URL.createObjectURL(file)
					var id = objectURL.replace(/^blob:/, '');
					
					var sound = this;
					// This is to make sure the file object isn't removed.
					var fileName = file.name;
					var fileType = file.type;
					
					var onSaved = function() {
						sound.tracks.push({
							name: fileName,
							path: objectURL,
							id: id,
							isPlayable: Boolean(
								document.createElement('audio').canPlayType(fileType)
							)
						});
					};
					
					app.media.save(id, file, onSaved);
				},
				unload: function(track) {
					this.tracks.remove(track);
				}
			},
			
			text: {
				string: '',
				size: 5,
				font: '',
				color: '#ffffff',
				bold: false,
				italic: false,
				alignment: 'center',
				padding: 0,
				get style() {
					return (this.italic) ? 'italic' : 'normal';
				},
				get weight() {
					return (this.bold) ? 'bold' : 'normal';
				},
				get previewSize() {
					return (this.size / 100) + 'em';
				},
				get previewPadding() {
					// The percentage is relative to the container's width, so the same property can be used for all previews.
					return '0 ' + this.padding + '%';
				}
			},
			
			get media() {
				// We use this convoluted code because concat does not work as expected on array-like objects.
				var tracks = this.sound.tracks.map(function(track) { return track; });
				if ( this.image.id || this.image.path ) {
					tracks.push(this.image);
				}
				return tracks;
			},
			
			// State
			get isSelected() {
				return this === self.current;
			},
			
			onFilesDropped: function(viewModel, dropEvent) {
				dropEvent.preventDefault();
				
				var files = dropEvent.dataTransfer.files;
				for ( var i = 0; i < files.length; ++i ) {
					this.load(files[i]);
				}
			},
			
			onDrag: function(viewModel, dragEvent) {
				dragEvent.preventDefault();
				dragEvent.dataTransfer.dropEffect = 'copy';
			},
			
			load: function(file) {
				if ( file.name.match(/\.(wav|mp3|ogg|webm|aac)$/i) ) {
					this.sound.load(file);
				} else if ( file.name.match(/\.(jpg|jpeg|gif|png|bmp|svg)$/i) ) {
					this.image.load(file);
				}
			}
		};
	};
	
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
	
	self.add = function() {
		var newScene = self.newScene();
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
			self.add();
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

Ambience.Adventure.version = 1;