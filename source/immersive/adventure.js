var AdventureViewModel = function(editor) {
	var self = this;
	
	self.scenes = ko.observableArray();
	
	var baseScene = {
		name: 'Untitled',
		key: '',
		layer: 'background',
		mixin: false,
		image: '',
		loop: true,
		shuffle: false,
		volume: 1,
		text: '',
		backgroundColor: '#000000',
		size: 'contain',
		fadeDuration: 0,
		crossoverSeconds: 0,
		crossfade: false,
		fontSize: 5,
		fontFamily: '',
		fontColor: '#ffffff',
		bold: false,
		italic: false,
		get imageCss() {
			return 'url("' + this.image + '")';
		},
		get isSelected() {
			return this === self.current();
		},
		get previewFontSize() {
			return (this.fontSize / 100) * 10 + 'em';
		},
		get fontStyle() {
			if ( this.italic ) {
				return 'italic';
			} else {
				return 'normal';
			}
		},
		get fontWeight() {
			if ( this.bold ) {
				return 'bold';
			} else {
				return 'normal';
			}
		},
		get soundString() {
			var soundPaths = this.sounds.map(function(sound) {
				return sound.path;
			});
			
			return soundPaths.join(', ');
		}
	};
	
	self.createScene = function() {
		var scene = Object.create(baseScene);
		scene.sounds = []; // Defined here because each scene needs its own list, not that of its prototype.
		self.wrapScene(scene);
		return scene;
	};
	
	self.wrapScene = function(scene) {
		knockwrap.wrapObject(scene);
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
		self.scenes.push(self.createScene());
		self.select(self.last());
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
	
	self.playSelected = function() {
		editor.playScene(self.current());
	};
	
	self.copySelected = function() {
		var newScene = self.createScene();
		for ( var property in this ) {
			if ( !(this[property] instanceof Object) ) {
 				newScene[property] = this[property];
 			}
		}

		this.sounds.map(function(sound) {
			newScene.sounds.push(Object.copy(sound));
		});
		
		var index = self.scenes.indexOf(self.current()) + 1
		self.scenes.splice(index, 0, newScene);
		self.select(newScene);
	};
	
	self.addSound = function() {
		this.sounds.push({ path: '' });
	};
	
	self.removeSound = function() {
		self.current().sounds.remove(this);
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
};