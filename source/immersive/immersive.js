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
	self.message = ko.observable(null);
	self.appIsRunLocally = window.location.protocol === 'file:';
	
	if ( !self.appIsRunLocally ) {
		self.message('To access local files, <a href="">download RPG Ambience</a> and run it from your hard drive.');
	}
	
	self.clearMessage = function() {
		self.message(null);
	};
	
	self.adventure = new AdventureViewModel(self);
	
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
			fontWeight: scene.fontWeight,
			color: scene.fontColor
		};
		flatScene.backgroundColor = scene.backgroundColor;
		flatScene.imageStyle = { size: scene.size };
		flatScene.fadeDuration = scene.fadeDuration * 1000;
		flatScene.crossoverDuration = scene.crossoverSeconds;
		flatScene.crossfades = scene.crossfade;
		flatScene.loops = scene.loop;
		flatScene.layer = scene.layer;
		flatScene.isMixin = scene.mixin;
		
		ambience.play(flatScene);
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
	
	var showInterface = function(event) {
		event.stopPropagation();
		self.showInterface();
	};
	
	var theaterForm = document.getElementById('theater-form');
	theaterForm.addEventListener('mousemove', showInterface);
	theaterForm.addEventListener('mouseover', showInterface);
	
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
	}
	
	self.keyedScene = function(targetKey) {
		if ( targetKey ) {
			return self.scenes().first(function(scene) {
				return (
					scene.key &&
					scene.key === targetKey
				);
			});
		} else {
			return null;
		}
	};
	
	self.onKeyDown = function(event) {
		if ( !focusIsOnForm(event) ) {
			var key = Key.name(event.keyCode);
			if ( commands[key]  ) {
				event.preventDefault();
				commands[key]();
			} else {
				var scene = self.keyedScene(key);
				if ( scene ) {
					self.playScene(scene);
				}
			}
		}
	};
	
	self.sceneName = ko.observable('');
	self.onKeyPress = function(event) {
		if ( !focusIsOnForm(event) ) {
			var character = String.fromCharCode(event.charCode);
			var scene = self.keyedScene(character.toUpperCase());
			if ( scene ) {
				self.playScene(scene);
				self.sceneName('');
			} else if ( character ) {
				event.preventDefault();
				self.sceneName(self.sceneName() + character);
			}
		}
	};
	
	self.playNamedScene = function() {
		if ( self.sceneName().length === 0 ) {
			self.fadeOutTopmost();
		} else {
			var scene = self.namedScene(self.sceneName());
			if ( scene ) {
				self.playScene(scene);
			}
			self.sceneName('');
		}
	};
	
	self.namedScene = function(name) {
		if ( name.length > 0 ) {
			return self.scenes().first(function(scene) {
				return (
					scene.name &&
					scene.name.toUpperCase().startsWith(name.toUpperCase())
				);
			});
		} else {
			return null;
		}
	};
	
	self.backspaceSceneName = function() {
		if ( self.sceneName().length > 0 ) {
			self.sceneName(self.sceneName().substring(0, self.sceneName().length - 1));
		}
	};
	
	var formTagNames = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'OPTION', 'A'];
	var focusIsOnForm = function(event) {
		return formTagNames.indexOf(event.target.tagName) !== -1;
	};
	
	var commands = {
		'Enter': self.playNamedScene,
		'Backspace': self.backspaceSceneName,
		'Escape': function() {}
	};
};

window.addEventListener('load', function() {
	splitter = new Splitter(document.body, 0.6);
	
	ambience = new Ambience(
		new Ambience.Layer(document.getElementById('background')),
		new Ambience.Layer(document.getElementById('foreground'))
	);
	
	viewModel = new ViewModel();
	document.addEventListener('keypress', viewModel.onKeyPress);
	document.addEventListener('keydown', viewModel.onKeyDown);
	ko.applyBindings(viewModel);
	viewModel.adventure.add();
});