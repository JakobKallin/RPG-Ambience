var ViewModel = function(db, editorWidth) {
	var self = this;
	
	self.start = function() {
		startAmbience();
		startInterface();
	}
	
	var ambience;
	function startAmbience() {
		ambience = new Ambience(
			new Ambience.Layer(document.getElementById('background')),
			new Ambience.Layer(document.getElementById('foreground'))
		);
	}
	
	self.playScene = function(scene) {
		converted = self.adventure.convertScene(scene);
		ambience.play(converted);
	};
	
	self.playSelected = function() {
		self.playScene(self.adventure.current);
	};
	
	self.stopCurrent = function() {
		ambience.fadeOutTopmost();
	};
	
	self.adventure = undefined
	self.adventures = [];
	self.createAdventure = function() {
		var adventure = new AdventureViewModel(self);
		adventure.title = 'Untitled adventure';
		adventure.add();
		
		self.addAdventure(adventure);
	};
	
	self.addAdventure = function(adventure) {
		self.adventures.push(adventure);
		self.adventure = adventure;
		self.adventure.select(adventure.scenes[0]);
	};
	
	self.library = new AdventureLibrary(self);
	self.loadAdventure = function() {
		//var adventure = self.library.load();
		//if ( adventure ) {
		//	self.addAdventure(adventure);
		//} else {
			self.addAdventure(self.library.loadExample());
		//}
	};
	
	self.renameInProgress = false;
	self.startRename = function() {
		self.renameInProgress = true;
		document.getElementById('rename').focus();
		document.getElementById('rename').select();
	};
	self.stopRename = function() {
		self.renameInProgress = false;
	};
	
	self.media = new MediaLibrary(db);
	
	function startInterface() {
		self.splitter = new Splitter(document.getElementById('interface'), editorWidth);
		
		document.addEventListener('keypress', self.onKeyPress);
		document.addEventListener('keydown', self.onKeyDown);
	}
	
	self.editorWidth = editorWidth;
	self.editorIsVisible = true;
	Object.defineProperty(self, 'editorIsHidden', {
		get: function() {
			return !self.editorIsVisible;
		}
	});
	
	self.toggleEditor = function(viewModel, event) {
		if ( self.editorIsVisible ) {
			self.hideEditor();
		} else {
			self.showEditor();
		}
		
		event.stopPropagation();
	};
	
	self.hideEditor = function() {
		self.editorWidth = self.splitter.leftWidth;
		self.editorIsVisible = false;
		self.splitter.update(0);
	};
	
	self.showEditor = function() {
		self.splitter.update(self.editorWidth);
		self.editorIsVisible = true;
	};
	
	Object.defineProperty(self, 'toggleButtonText', {
		get: function() {
			if ( self.editorIsVisible ) {
				return 'Hide Editor';
			} else {
				return 'Show Editor';
			}
		}
	});
	
	self.mouseHasRecentlyMoved = true;
	var theater = document.getElementById('theater');
	var cursorTimer;
	var cursorHideDelay = 1000;
	var previousX;
	var previousY;
	
	self.hideInterface = function() {
		theater.style.cursor = 'none';
		self.mouseHasRecentlyMoved = false;
	};

	self.showInterface = function() {
		clearTimeout(cursorTimer);
		theater.style.cursor = 'auto';
		self.mouseHasRecentlyMoved = true;
	};
	
	self.showInterfaceIndef = function(viewModel, event) {
		event.stopPropagation();
		self.showInterface();
	};
	
	Object.defineProperty(self, 'guiEditorIsVisible', {
		get: function() {
			return self.editorIsVisible || self.mouseHasRecentlyMoved;
		}
	});
	
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
	
	self.stopPropagation = function(viewModel, event) {
		event.stopPropagation();
		return true;
	}
	
	self.onKeyDown = function(event) {
		var key = Key.name(event.keyCode);
		if ( self.commands[key]  ) {
			event.preventDefault();
			self.commands[key]();
		} else {
			var scene = self.adventure.keyedScene(key);
			if ( scene ) {
				event.preventDefault();
				self.playScene(scene);
			}
		}
	};
	
	self.sceneName = '';
	self.onKeyPress = function(event) {
		// Firefox handles charCode 0 as a string so we guard against it here.
		if ( event.charCode !== 0 ) {
			var character = String.fromCharCode(event.charCode);
			var scene = self.adventure.keyedScene(character.toUpperCase());
			if ( scene ) {
				self.playScene(scene);
				self.sceneName = '';
			} else if ( character ) {
				self.sceneName = self.sceneName + character;
			}
		}
	};
	
	self.backspaceSceneName = function() {
		if ( self.sceneName.length > 0 ) {
			self.sceneName = self.sceneName.substring(0, self.sceneName.length - 1);
		}
	};
	
	self.playNamedScene = function() {
		if ( self.sceneName.length === 0 ) {
			ambience.fadeOutTopmost();
		} else {
			var scene = self.adventure.namedScene(self.sceneName);
			if ( scene ) {
				self.playScene(scene);
			}
			self.sceneName = '';
		}
	};
	
	self.commands = {
		'Enter': self.playNamedScene,
		'Backspace': self.backspaceSceneName
	};
	
	self.help = {
		mixin: "When you play this scene, you retain the media of the previous scene that is not redefined in this scene.",
		overlap: "The next track will start this many seconds before the current track ends."
	};
};

var viewModel;
window.addEventListener('load', function() {
	var dbRequest = indexedDB.open('media');
	
	dbRequest.onupgradeneeded = function(event) {
		createDatabase(event.target.result);
	};
	
	dbRequest.onsuccess = function(successEvent) {
		var db = successEvent.target.result;
		if ( db.setVersion ) {
			db.setVersion('1').onsuccess = function(versionEvent) {
				createDatabase(db)
				versionEvent.target.result.oncomplete = function() {
					onDatabaseLoaded(db);
				};
			}
		} else {
			onDatabaseLoaded(db);
		}
	};
	
	var createDatabase = function(db) {
		if ( !db.objectStoreNames.contains('media') ) {
			db.createObjectStore('media');
		}
	};
	
	var onDatabaseLoaded = function(db) {
		delete jQuery; // This is to prevent Knockout from using jQuery events, which hide some data inside originalEvent, such as dataTransfer.
		
		viewModel = new ViewModel(db, 0.6);
		knockwrap.wrap(viewModel);
		viewModel.start();
		viewModel.loadAdventure(); // Previously, this had to be done after applying the bindings. This does not seem to apply anymore.
		
		ko.applyBindings(viewModel);
		
		$(document.getElementById('view-list')).tabs();
	};
});