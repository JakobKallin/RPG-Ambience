var splitter;
var ambience;
var viewModel;
		
var ViewModel = function(editorWidth) {
	var self = this;
	
	self.editorWidth = editorWidth;
	self.editorIsVisible = ko.observable(true);
	self.editorIsHidden = ko.computed(function() {
		return !self.editorIsVisible();
	});
	self.interfaceIsVisible = ko.observable(true);
	
	self.scenes = ko.observableArray();
	
	var baseScene = {
		name: 'Untitled scene',
		key: 'F1',
		image: '',
		loop: true,
		shuffle: false,
		volume: 1,
		text: '',
		color: '#000000',
		size: 'contain',
		fadeDuration: 0,
		fontSize: 5,
		fontFamily: '',
		bold: false,
		italic: false,
		get imageCss() {
			return 'url("' + this.image + '")';
		},
		get isSelected() {
			return this === self.current();
		},
		get previewFontSize() {
			return (this.fontSize / 100) * 15 + 'em';
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
	
	self.playScene = function(scene) {
		var flatScene = new Ambience.Scene();
		flatScene.name = scene.name;
		flatScene.key = scene.key;
		flatScene.image = encodeURI(scene.image);
		flatScene.sounds = scene.sounds.map(function(sound) {
			return encodeURI(sound.path);
		});
		
		if ( scene.shuffle ) {
			flatScene.soundOrder = 'random';
		} else {
			flatScene.soundOrder = 'linear';
		}
		
		flatScene.volume = scene.volume;
		flatScene.text = scene.text;
		flatScene.textStyle = {
			fontSize: scene.fontSize + 'vw',
			fontFamily: scene.fontFamily,
			fontStyle: scene.fontStyle,
			fontWeight: scene.fontWeight
		};
		flatScene.backgroundColor = scene.color;
		flatScene.imageStyle = { size: scene.size };
		flatScene.fadeDuration = scene.fadeDuration * 1000;
		flatScene.loops = scene.loop;
		
		ambience.play(flatScene);
	};
	
	self.current = ko.observable();
	
	self.select = function(scene) {
		self.current(scene);
		$('details').details();
		splitter.update();
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
		
		var index = viewModel.scenes.indexOf(this);
		self.scenes.splice(index, 1);
	};
	
	self.playSelected = function() {
		self.playScene(self.current());
	};
	
	self.copySelected = function() {
		var newScene = self.createScene();
		// This for loop does not work in Opera.
		for ( var property in this ) {
			var propertyIsGetter = Boolean(Object.getPropertyDescriptor(this, property));
			if ( !propertyIsGetter ) {
				newScene[property] = this[property];
			}
		};
		
		this.sounds.map(function(sound) {
			var newSound = new SoundViewModel(newScene);
			newSound.path = sound.path;
			newScene.sounds.push(newSound);
		});
		
		var index = self.scenes.indexOf(self.current()) + 1
		self.scenes.splice(index, 0, newScene);
		self.select(newScene);
	};
	
	function SoundViewModel(scene) {
		this.path = '';
		this.remove = function() {
			var index = scene.sounds.indexOf(this);
			scene.sounds.splice(index, 1);
		};
	};
	
	self.addSound = function() {
		var sound = new SoundViewModel(this);
		this.sounds.push(sound);
	};
	
	self.removeSound = function(e) {
		var a = 5;
	};
	
	self.handleDroppedFile = function(scene, event) {
		event.preventDefault();
		event.stopPropagation();
		
		var file = event.originalEvent.dataTransfer.files[0];
		var reader = new FileReader();
		reader.onload = function(event) {
			scene.image = event.target.result;
		}
		reader.readAsDataURL(file);
	};
	
	self.handleDrag = function(scene, event) {
		event.preventDefault();
		event.stopPropagation();
		event.dataTransfer.dropEffect = 'copy';
	};
	
	self.hideEditor = function() {
		self.editorWidth = splitter.leftWidth;
		self.editorIsVisible(false);
		splitter.update(0);
	};
	
	self.showEditor = function() {
		splitter.update(self.editorWidth);
		self.editorIsVisible(true);
	};
	
	var theater = document.getElementById('theater');
	var cursorTimer;
	var cursorHideDelay = 1000;
	var previousX;
	var previousY;
	
	var theaterButtons = theater.getElementsByTagName('button');
	var showInterface = function(event) {
		event.stopPropagation();
		self.showInterface();
	};
	for ( var i = 0; i < theaterButtons.length; i += 1 ) {
		theaterButtons[i].addEventListener('mousemove', showInterface);
		theaterButtons[i].addEventListener('mouseover', showInterface);
	}
	
	self.scheduleHiddenInterface = function(viewModel, event) {
		// Setting the cursor style seems to trigger a mousemove event, so we have to make sure that the mouse has really moved or we will be stuck in an infinite loop.
		var mouseHasMoved = event.screenX !== previousX || event.screenY !== previousY;
		if ( mouseHasMoved ) {
			self.showInterface();
			cursorTimer = window.setTimeout(self.hideInterface, cursorHideDelay);
		}

		previousX = event.screenX;
		previousY = event.screenY;
	};
	
	self.hideInterface = function() {
		theater.style.cursor = 'none';
		self.interfaceIsVisible(false);
	};

	self.showInterface = function() {
		clearTimeout(cursorTimer);
		theater.style.cursor = 'auto';
		self.interfaceIsVisible(true);
	};
	
	self.showButtonIsVisible = ko.computed(function() {
		return self.editorIsHidden() && self.interfaceIsVisible();
	});
	
	self.hideButtonIsVisible = ko.computed(function() {
		return self.editorIsVisible() && self.interfaceIsVisible();
	});
	
	var specialKeyFound = false;
	self.bindSpecialKey = function(scene, event) {
		var keyName = Key.name(event.keyCode);
		if ( keyName ) {
			event.preventDefault();
			scene.key = keyName;
			specialKeyFound = true;
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
		specialKeyFound = false; // We could do this in keyUp as well.
	};
};

window.addEventListener('load', function() {
	splitter = new Splitter(document.body, 0.6);
	
	ambience = new Ambience(
		new Ambience.Layer(document.getElementById('background')),
		new Ambience.Layer(document.getElementById('foreground'))
	);
	
	viewModel = new ViewModel();
	ko.applyBindings(viewModel);
	viewModel.add();
});