var AdventureViewModel = function(editor) {
	var self = this;
	
	self.start = function() {
		self.add();
	};	
	
	self.scenes = ko.observableArray();
	self.basePath = ko.observable('');
	
	self.load = function(config) {
		self.basePath(config.basePath);
		
		self.scenes.splice(0);
		var newScenes = config.scenes;
		newScenes.map(function(sceneConfig) {
			var newScene = self.createScene();
			Object.overlay(newScene, sceneConfig);
			self.scenes.push(newScene);
		});
		
		if ( self.scenes().length > 0 ) {
			self.select(self.scenes()[0]);
		}
	};
	
	self.newScene = function() {
		return {
			name: '',
			key: '',
			layer: 'background',
			mixin: false,
			background: '#000000',
			fade: 0,
			fadeIn: true,
			fadeOut: true,
			get isForeground() {
				return this.layer === 'foreground'
			},
			
			image: {
				path: '',
				size: 'contain',
				get css() {
					return 'url("' + encodeURI(this.absolutePath) + '")';						
				},
				get absolutePath() {
					return self.absolutePath(this.path);
				}
			},
			
			sound: {
				files: [],
				removeFile: function(file) {
					this.files.remove(file);
				},
				addFile: function() {
					this.files.push({ path: '' });
				},
				loop: true,
				shuffle: false,
				volume: 1,
				crossover: 0
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
				get largePreviewSize() {
					return (this.size / 100) * 10 + 'em';
				},
				get smallPreviewSize() {
					return (this.size / 100) * 5 + 'em';
				},
				get previewPadding() {
					// The percentage is relative to the container's width, so the same property can be used for all previews.
					return '0 ' + this.padding + '%';
				}
			},
			
			// State
			get isSelected() {
				return this === self.current();
			}
		};
	};
	
	self.createScene = function() {
		var scene = self.newScene();
		knockwrap.wrapObject(scene);
		return scene;
	};
	
	self.convertScene = function(scene) {
		var converted = new Ambience.Scene();
		
		converted.name = scene.name;
		converted.key = scene.key;
		converted.layer = scene.layer;
		converted.isMixin = scene.mixin;
		converted.backgroundColor = scene.background;
		converted.fadeDuration = scene.fade * 1000;
		converted.fadesIn = scene.fadeIn;
		converted.fadesOut = scene.fadeOut;
		
		if ( scene.image.path.length > 0 ) {
			converted.image = scene.image.absolutePath;
			converted.imageStyle = { backgroundSize: scene.image.size };
		}
		
		var actualSoundFiles = scene.sound.files.filter(function(file) {
			return file.path.length > 0;
		});
		if ( actualSoundFiles.length > 0 ) {
			converted.sounds = actualSoundFiles.map(function(file) {
				return self.absolutePath(file.path);
			});
		}
		
		converted.soundOrder = (scene.sound.shuffle) ? 'random' : 'linear';
		converted.loops = scene.sound.loop;
		converted.volume = scene.sound.volume;
		converted.crossoverDuration = scene.sound.crossover;
		
		var text = scene.text;
		converted.text = text.string;
		converted.textStyle = {
			fontSize: text.size + 'vw',
			fontFamily: text.font,
			fontStyle: text.style,
			fontWeight: text.weight,
			color: text.color,
			textAlign: text.alignment,
			padding: '0 ' + text.padding + 'vw'
		};
		
		return converted;
	};
	
	self.fadeOutTopmost = function() {
		ambience.fadeOutTopmost();
	};
	
	self.current = ko.observable();
	
	var selectedTab = ko.observable(0);
	self.select = function(scene) {
		self.current(scene);
		var specificOptions = $('.selected-item .options.specific');
		specificOptions.tabs({
			select: function(event, ui) {
				selectedTab(ui.index);
			}
		});
		specificOptions.tabs('select', selectedTab());
		
		editor.splitter.update();
	};
	
	self.add = function() {
		var newScene = self.createScene();
		self.scenes.push(newScene);
		newScene.sound.addFile({ path: '' });
		self.select(newScene);
	};
	
	self.previous = function() {
		var index = self.scenes.indexOf(self.current());
		if ( index > 0 ) {
			return self.scenes()[index - 1];
		} else {
			return null;
		}
	};
	
	self.next = function() {
		var index = self.scenes.indexOf(self.current());
		if ( index < self.scenes().length - 1 ) {
			return self.scenes()[index + 1];
		} else {
			return null;
		}
	};
	
	self.last = function() {
		var index = self.scenes().length - 1;
		if ( index !== -1 ) {
			return self.scenes()[index];
		} else {
			return null;
		}
	};
	
	self.removeSelected = function() {
		var previous = self.previous();
		var next = self.next();
		
		if ( self.previous() ) {
			self.select(previous);
		} else if ( next ) {
			self.select(next);
		} else {
			self.add();
		}
		
		var index = self.scenes.indexOf(this);
		self.scenes.splice(index, 1);
	};
	
	self.copyScene = function(original) {
		return original.copy();
	};
	
	self.copySelected = function() {
		var newScene = self.copyScene(this);
		
		var index = self.scenes.indexOf(self.current()) + 1
		self.scenes.splice(index, 0, newScene);
		self.select(newScene);
	};
	
	var bindableKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
	var specialKeyFound = false;
	self.bindSpecialKey = function(scene, event) {
		var keyName = Key.name(event.keyCode);
		if ( bindableKeys.contains(keyName) ) {
			specialKeyFound = true;
			var keyHasCommand = keyName in editor.commands;
			if ( !keyHasCommand ) {
				scene.key = keyName;
			}
		} else {
			return true;
		}
	};
	
	self.bindTextKey = function(scene, event) {
		if ( !specialKeyFound ) {
			var keyText = String.fromCharCode(event.which);
			if ( keyText ) {
				scene.key = keyText.toUpperCase();
			}
		}
	};
	
	self.stopKeyBinding = function(scene, event) {
		specialKeyFound = false;
	};
	
	self.namedScene = function(name) {
		if ( name.length > 0 ) {
			return self.scenes().first(function(scene) {
				return scene.name && scene.name.toUpperCase().startsWith(name.toUpperCase());
			});
		} else {
			return null;
		}
	};
	
	self.keyedScene = function(targetKey) {
		if ( targetKey ) {
			return self.scenes().first(function(scene) {
				return scene.key && scene.key === targetKey;
			});
		} else {
			return null;
		}
	};
	
	self.absolutePath = function(path) {
		var pathIsAbsolute = path.startsWith('file://') || path.startsWith('http://');
		if ( !pathIsAbsolute ) {
			return self.basePath() + path;
		} else {
			return path;			
		}
	};
};