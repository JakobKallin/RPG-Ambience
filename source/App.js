// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App = function($scope) {
	function start() {
		startAmbience();
		startInterface();
		loadAdventures();
		// removeUnusedMedia();
	}
	
	var ambience;
	function startAmbience() {
		ambience = new Ambience.Controller(
			new Ambience.Stage(document.getElementById('background')),
			new Ambience.Stage(document.getElementById('foreground'))
		);
	}
	
	$scope.playScene = function(scene) {
		converted = $scope.adventure.convertScene(scene);
		if ( scene.layer === 'background' ) {
			ambience.playBackground(converted);
		} else {
			ambience.playForeground(converted);
		}
	};
	
	$scope.playSelected = function() {
		$scope.playScene($scope.adventure.current);
	};
	
	$scope.stopCurrent = function() {
		ambience.fadeOutTopmost();
	};
	
	$scope.adventure = undefined;
	$scope.adventures = [];
	$scope.createAdventure = function() {
		var adventure = new Ambience.Adventure($scope);
		adventure.title = 'Untitled adventure';
		adventure.add();
		$scope.addAdventure(adventure);
		
		$scope.startRename();
	};
	
	$scope.addAdventure = function(adventure) {
		$scope.adventures.push(adventure);
		$scope.adventure = adventure;
		$scope.adventure.select(adventure.scenes[0]);
	};
	
	$scope.toggleSelectedRemoval = function() {
		$scope.adventure.willBeRemoved = !$scope.adventure.willBeRemoved;
		if ( $scope.adventure.willBeRemoved ) {
			var index = $scope.adventures.indexOf($scope.adventure);
			if ( $scope.adventures.length === 1 ) {
				$scope.createAdventure();
			} else if ( index === 0 ) {
				$scope.adventure = $scope.adventures[1];
			} else {
				$scope.adventure = $scope.adventures[index - 1];
			}
		}
	};
	
	$scope.library = new Ambience.AdventureLibrary($scope);
	var loadAdventures = function() {
		var adventures = $scope.library.load();
		if ( adventures.length === 0 ) {
			adventures = [$scope.library.loadExample(), $scope.library.loadExample()];
			adventures[1].title = 'Another example';
		}
		
		adventures.forEach(function(adventure) {
			$scope.adventures.push(adventure);
		});
		$scope.adventure = $scope.adventures[$scope.adventures.length - 1];
		$scope.adventure.loadMedia(); // There is no change event for the first adventure selected, so load the media manually.
		
		// window.addEventListener('beforeunload', $scope.onExit);
	};
	
	$scope.renameInProgress = false;
	$scope.startRename = function() {
		$scope.renameInProgress = true;
		// The input is not visible yet, so we give focus to it when Angular is done.
		window.setTimeout(function() {
			document.getElementById('rename-input').focus();
			document.getElementById('rename-input').select();
		}, 0);
	};
	
	$scope.stopRename = function() {
		$scope.renameInProgress = false;
	};
	
	$scope.equalizeRenameFieldWidth = function() {
		var button = document.getElementById('rename-button');
		var input = document.getElementById('rename-input');
		input.style.width = button.offsetWidth + 'px';
	};
	
	$scope.media = new Ambience.MediaLibrary(Ambience.App.db);
	var removeUnusedMedia = function() {
		var items = $scope.adventures.map(get('media')).flatten();
		var usedIds = items.map(get('id'));
		$scope.media.removeUnusedMedia(usedIds);
	};
	
	var editorWidth = 0.75;
	function startInterface() {
		$scope.splitter = new Splitter(document.getElementById('interface'), editorWidth);
		
		document.addEventListener('keypress', $scope.onKeyPress);
		document.addEventListener('keydown', $scope.onKeyDown);
		
		$scope.equalizeRenameFieldWidth();
	}
	
	$scope.editorWidth = editorWidth;
	$scope.editorIsVisible = true;
	Object.defineProperty($scope, 'editorIsHidden', {
		get: function() {
			return !$scope.editorIsVisible;
		}
	});
	
	$scope.toggleEditor = function(viewModel, event) {
		if ( $scope.editorIsVisible ) {
			$scope.hideEditor();
		} else {
			$scope.showEditor();
		}
		
		event.stopPropagation();
	};
	
	$scope.hideEditor = function() {
		$scope.editorWidth = $scope.splitter.leftWidth;
		$scope.editorIsVisible = false;
		$scope.splitter.update(0);
	};
	
	$scope.showEditor = function() {
		$scope.splitter.update($scope.editorWidth);
		$scope.editorIsVisible = true;
	};
	
	Object.defineProperty($scope, 'toggleButtonText', {
		get: function() {
			if ( $scope.editorIsVisible ) {
				return 'Hide Editor';
			} else {
				return 'Show Editor';
			}
		}
	});
	
	$scope.mouseHasRecentlyMoved = true;
	var theater = document.getElementById('theater');
	var cursorTimer;
	var cursorHideDelay = 1000;
	var previousX;
	var previousY;
	
	$scope.hideInterface = function() {
		theater.style.cursor = 'none';
		$scope.mouseHasRecentlyMoved = false;
	};

	$scope.showInterface = function(viewModel, event) {
		// In Firefox, the mouseout event is triggered when a scene with an image is started, because the mouse leaves the theater for the image.
		// This code only shows the interface when the mouse leaves for another part of the document.
		// There should be a better way to do this but it seems to fix the problem for now.
		if ( event && event.currentTarget.contains(event.target) ) {
			return;
		}
		
		clearTimeout(cursorTimer);
		theater.style.cursor = 'auto';
		$scope.mouseHasRecentlyMoved = true;
	};
	
	$scope.showInterfaceIndef = function(viewModel, event) {
		event.stopPropagation();
		$scope.showInterface();
	};
	
	Object.defineProperty($scope, 'guiEditorIsVisible', {
		get: function() {
			return $scope.editorIsVisible || $scope.mouseHasRecentlyMoved;
		}
	});
	
	$scope.scheduleHiddenInterface = function(viewModel, event) {
		// Setting the cursor style seems to trigger a mousemove event, so we have to make sure that the mouse has really moved or we will be stuck in an infinite loop.
		var mouseHasMoved = event.screenX !== previousX || event.screenY !== previousY;
		if ( mouseHasMoved ) {
			$scope.showInterface();
			cursorTimer = window.setTimeout($scope.hideInterface, cursorHideDelay);
		}

		previousX = event.screenX;
		previousY = event.screenY;
	};
	
	$scope.onKeyDown = function(event) {
		var key = Key.name(event.keyCode);
		if ( $scope.commands[key]  ) {
			event.preventDefault();
			$scope.commands[key]();
		} else {
			var scenes = $scope.adventure.keyedScenes(key);
			if ( scenes.length > 0 ) {
				event.preventDefault();
				scenes.forEach($scope.playScene);
			}
		}
	};
	
	$scope.sceneName = '';
	$scope.onKeyPress = function(event) {
		// Firefox handles charCode 0 as a string so we guard against it here.
		if ( event.charCode !== 0 ) {
			var character = String.fromCharCode(event.charCode);
			var scenes = $scope.adventure.keyedScenes(character.toUpperCase());
			if ( scenes.length > 0 ) {
				scenes.forEach($scope.playScene);
				$scope.sceneName = '';
			} else if ( character ) {
				$scope.sceneName = $scope.sceneName + character;
			}
		}
	};
	
	$scope.backspaceSceneName = function() {
		if ( $scope.sceneName.length > 0 ) {
			$scope.sceneName = $scope.sceneName.substring(0, $scope.sceneName.length - 1);
		}
	};
	
	$scope.playNamedScene = function() {
		if ( $scope.sceneName.length === 0 ) {
			ambience.fadeOutTopmost();
		} else {
			var scene = $scope.adventure.namedScene($scope.sceneName);
			if ( scene ) {
				$scope.playScene(scene);
			}
			$scope.sceneName = '';
		}
	};
	
	$scope.commands = {
		'Enter': $scope.playNamedScene,
		'Backspace': $scope.backspaceSceneName
	};
	
	$scope.help = {
		mixin: "When you play this scene, you retain the elements of the previous scene that are not redefined in this scene.",
		overlap: "The next track will start this many seconds before the current track ends."
	};
	
	Object.defineProperty($scope, 'exitMessage', {
		get: function() {
			if ( $scope.media.transactionCount > 0 ) {
				return 'There are currently media files being saved. If you exit now, you risk losing data.';
			} else {
				return undefined;
			}
		}
	});
	
	$scope.onExit = function(event) {
		$scope.permanentlyRemoveAdventures();
		$scope.library.save($scope.adventures);
		
		if ( $scope.exitMessage ) {
			return event.returnValue = $scope.exitMessage;
		}
	};
	
	$scope.permanentlyRemoveAdventures = function() {
		var removed = $scope.adventures.filter(get('willBeRemoved'));
		removed.forEach(function(adventure) {
			$scope.adventures.remove(adventure);
		});
	};
	
	$scope.onFilesDropped = function(viewModel, dropEvent) {
		dropEvent.preventDefault();
		Array.prototype.forEach.call(dropEvent.dataTransfer.files, function(file) {
			if ( file.name.match(/\.(json)$/i) ) {
				$scope.library.loadFile(file);
			}
		});
	};
	
	$scope.onDrag = function(viewModel, dragEvent) {
		dragEvent.preventDefault();
		dragEvent.dataTransfer.dropEffect = 'copy';
	};
	
	start();
};

window.addEventListener('load', function() {
	var stopPropagation = function(event) {
		var interactiveTagNames = ['input', 'select', 'option', 'optgroup', 'button', 'a', 'textarea'];
		var targetTagName = event.target.tagName.toLowerCase();
		if ( interactiveTagNames.contains(targetTagName) ) {
			event.stopPropagation();
		}
	}
	
	document.body.addEventListener('keydown', stopPropagation);
	document.body.addEventListener('keypress', stopPropagation);
	
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
		Ambience.App.db = db;
		angular.module('ambience', ['ui']);
		angular.bootstrap(document, ['ambience']);
		removeSplashScreen();
	};
});