// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

var ViewModel = function(db, editorWidth) {
	var self = this;
	
	self.start = function() {
		startAmbience();
		startInterface();
		loadAdventures();
		removeUnusedMedia();
	}
	
	var ambience;
	function startAmbience() {
		ambience = new AmbienceController(
			new Ambience.Stage(document.getElementById('background')),
			new Ambience.Stage(document.getElementById('foreground'))
		);
	}
	
	self.playScene = function(scene) {
		converted = self.adventure.convertScene(scene);
		if ( scene.layer === 'background' ) {
			ambience.playBackground(converted);
		} else {
			ambience.playForeground(converted);
		}
	};
	
	self.playSelected = function() {
		self.playScene(self.adventure.current);
	};
	
	self.stopCurrent = function() {
		ambience.fadeOutTopmost();
	};
	
	self.adventure = undefined;
	self.adventures = [];
	self.createAdventure = function() {
		var adventure = new AdventureViewModel(self);
		adventure.title = 'Untitled adventure';
		adventure.add();
		
		self.addAdventure(adventure);
		
		self.startRename();
	};
	
	self.addAdventure = function(adventure) {
		self.adventures.push(adventure);
		self.adventure = adventure;
		self.adventure.select(adventure.scenes[0]);
	};
	
	self.toggleSelectedRemoval = function() {
		self.adventure.willBeRemoved = !self.adventure.willBeRemoved;
		if ( self.adventure.willBeRemoved ) {
			var index = self.adventures.indexOf(self.adventure);
			if ( self.adventures.length === 1 ) {
				self.createAdventure();
			} else if ( index === 0 ) {
				self.adventure = self.adventures[1];
			} else {
				self.adventure = self.adventures[index - 1];
			}
		}
	};
	
	self.library = new AdventureLibrary(self);
	var loadAdventures = function() {
		var adventures = self.library.load();
		if ( adventures.length === 0 ) {
			adventures = [self.library.loadExample()];
		}
		
		adventures.forEach(function(adventure) {
			self.adventures.push(adventure);
		});
		self.adventure = self.adventures[self.adventures.length - 1];
		self.adventure.loadMedia(); // There is no change event for the first adventure seleted, so load the media manually.
		
		window.addEventListener('beforeunload', self.onExit);
	};
	
	self.renameInProgress = false;
	self.startRename = function() {
		self.renameInProgress = true;
		document.getElementById('rename-input').focus();
		document.getElementById('rename-input').select();
	};
	self.stopRename = function() {
		self.renameInProgress = false;
	};
	self.equalizeRenameFieldWidth = function() {
		var button = document.getElementById('rename-button');
		var input = document.getElementById('rename-input');
		input.style.width = button.offsetWidth + 'px';
	};
	
	self.media = new MediaLibrary(db);
	var removeUnusedMedia = function() {
		var items = self.adventures.map(get('media')).flatten();
		var usedIds = items.map(get('id'));
		self.media.removeUnusedMedia(usedIds);
	};
	
	function startInterface() {
		self.splitter = new Splitter(document.getElementById('interface'), editorWidth);
		
		document.addEventListener('keypress', self.onKeyPress);
		document.addEventListener('keydown', self.onKeyDown);
		
		self.equalizeRenameFieldWidth();
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

	self.showInterface = function(viewModel, event) {
		// In Firefox, the mouseout event is triggered when a scene with an image is started, because the mouse leaves the theater for the image.
		// This code only shows the interface when the mouse leaves for another part of the document.
		// There should be a better way to do this but it seems to fix the problem for now.
		if ( event && event.currentTarget.contains(event.target) ) {
			return;
		}
		
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
		var interactiveTagNames = ['input', 'select', 'option', 'optgroup', 'button', 'a', 'textarea'];
		var targetTagName = event.target.tagName.toLowerCase();
		if ( interactiveTagNames.contains(targetTagName) ) {
			event.stopPropagation();
		}
		
		return true;
	}
	
	self.onKeyDown = function(event) {
		var key = Key.name(event.keyCode);
		if ( self.commands[key]  ) {
			event.preventDefault();
			self.commands[key]();
		} else {
			var scenes = self.adventure.keyedScenes(key);
			if ( scenes.length > 0 ) {
				event.preventDefault();
				scenes.forEach(self.playScene);
			}
		}
	};
	
	self.sceneName = '';
	self.onKeyPress = function(event) {
		// Firefox handles charCode 0 as a string so we guard against it here.
		if ( event.charCode !== 0 ) {
			var character = String.fromCharCode(event.charCode);
			var scenes = self.adventure.keyedScenes(character.toUpperCase());
			if ( scenes.length > 0 ) {
				scenes.forEach(self.playScene);
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
		mixin: "When you play this scene, you retain the elements of the previous scene that are not redefined in this scene.",
		overlap: "The next track will start this many seconds before the current track ends."
	};
	
	Object.defineProperty(self, 'exitMessage', {
		get: function() {
			if ( self.media.transactionCount > 0 ) {
				return 'There are currently media files being saved. If you exit now, you risk losing data.';
			} else {
				return undefined;
			}
		}
	});
	
	self.onExit = function(event) {
		self.permanentlyRemoveAdventures();
		self.library.save(self.adventures);
		
		if ( self.exitMessage ) {
			return event.returnValue = self.exitMessage;
		}
	};
	
	self.permanentlyRemoveAdventures = function() {
		var removed = self.adventures.filter(get('willBeRemoved'));
		removed.forEach(function(adventure) {
			self.adventures.remove(adventure);
		});
	};
	
	self.onFilesDropped = function(viewModel, dropEvent) {
		dropEvent.preventDefault();
		Array.prototype.forEach.call(dropEvent.dataTransfer.files, function(file) {
			if ( file.name.match(/\.(json)$/i) ) {
				self.library.loadFile(file);
			}
		});
	};
	
	self.onDrag = function(viewModel, dragEvent) {
		dragEvent.preventDefault();
		dragEvent.dataTransfer.dropEffect = 'copy';
	};
	
	var selectedTab = 0;
	self.startPolyfills = function(container) {
		if ( container.getAttribute('data-is-polyfilled') ) {
			return;
		}
		
		// Make sure that attribute bindings are converted to Knockout bindings for the new node.
		attributeBindings.processNode(container);
		
		var colorInputs = container.querySelectorAll('input[type=color]');
		Array.prototype.forEach.call(colorInputs, function(input) {
			var onChange = function(color) {
				input.value = color.toHexString();
				var changeEvent = document.createEvent('CustomEvent');
				changeEvent.initCustomEvent('change', true, true, null);
				input.dispatchEvent(changeEvent);
			};
			$(input).spectrum({
				change: onChange,
				move: onChange,
				clickoutFiresChange: true,
				showAlpha: true,
				showButtons: false
			});
		});
		
		var buttons = container.querySelectorAll('button.file');
		Array.prototype.forEach.call(buttons, function(button) {
			new FileButton(button);
			button.classList.remove('file'); // Make sure the same button is not affected twice.
		});
		
		// This needs to be before the call to tabs(), because the button heights are calculated from the input elements, which may become hidden under a tab.
		$('input[type="number"]', container).inputNumber();
		
		var options = container.querySelector('.options.specific');
		var tabs = new Tabs(options);
		tabs.select(selectedTab);
		tabs.onSelected = function(index) {
			selectedTab = index;
		};
		
		container.setAttribute('data-is-polyfilled', true);
	};
	
	self.stopPolyfills = function(container) {
		var inputs = container.querySelectorAll('input[type=color]');
		Array.prototype.forEach.call(inputs, function(input) {
			$(input).spectrum('destroy');
		});
	};
	
	document.body.addEventListener('added', function(e) { self.startPolyfills(e.target); });
	document.body.addEventListener('removed', function(e) { self.stopPolyfills(e.target); });
	
	self.processSceneNodes = function(nodes) {
		self.insertIDs(nodes);
		Array.prototype.forEach.call(nodes, function(node) {
			if ( node.nodeType === 1 ) {
				self.startPolyfills(node);
			}
		});
	};
	
	self.removeSceneNode = function(node) {
		if ( node.nodeType === 1 ) {
			self.stopPolyfills(node);
		}
		node.parentNode.removeChild(node);
	};
	
	self.insertIDs = function(nodes) {
		Array.prototype.forEach.call(nodes, function(node) {
			if ( node.nodeType === 1 ) {
				self.insertElementIDs(node);
			}
		});
	};
	
	var nextID = 1;
	self.insertElementIDs = function(element) {
		
		Array.prototype.forEach.call(element.querySelectorAll('label[for]'), function(label) {
			var id = label.htmlFor;
			var target = element.querySelector('[id=' + id + ']');
			
			var newID = id + '-' + nextID;
			label.htmlFor = newID;
			target.id = newID;
		});
		
		Array.prototype.forEach.call(element.querySelectorAll('[name]'), function(namedElement) {
			var name = namedElement.name;
			var newName = name + '-' + nextID;
			namedElement.name = newName;
		});
		
		nextID += 1;
	};
};

var viewModel;
window.addEventListener('load', function() {
	var browserIsSupported = function() {
		return Boolean(window.indexedDB && window.URL);
	};
	
	var removeSplashScreen = function() {
		var splash = document.getElementById('splash');
		splash.parentNode.removeChild(splash);
	};
	
	var showSupportInfo = function() {
		var loadingMessage = document.getElementById('splash-loading');
		var unsupportedMessage = document.getElementById('splash-unsupported');
		loadingMessage.style.display = 'none';
		unsupportedMessage.style.display = '';
	};
	
	if ( !browserIsSupported() ) {
		showSupportInfo();
		return;
	}

	attributeBindings.processDocument();
	
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
		
		viewModel = new ViewModel(db, 0.75);
		knockwrap.wrap(viewModel);
		viewModel.start();		
		ko.applyBindings(viewModel);
		
		new Tabs(document.getElementById('view-list'));
		
		removeSplashScreen();
	};
});