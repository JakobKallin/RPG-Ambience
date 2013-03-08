// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
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
		ambience = new Ambience.App.Controller(
			new Ambience.Stage(document.getElementById('background')),
			new Ambience.Stage(document.getElementById('foreground'))
		);
	}
	
	$scope.playScene = function(scene) {
		converted = $scope.selected.adventure.convertScene(scene);
		if ( scene.layer === 'background' ) {
			ambience.playBackground(converted);
		} else {
			ambience.playForeground(converted);
		}
	};
	
	$scope.playSelected = function() {
		$scope.playScene($scope.selected.adventure.current);
	};
	
	$scope.stopCurrent = function() {
		ambience.fadeOutTopmost();
	};
	
	$scope.selected = {
		adventure: null,
		scene: null
	};
	$scope.adventures = [];
	$scope.createAdventure = function() {
		var adventure = new Ambience.App.Adventure($scope);
		adventure.title = 'Untitled adventure';
		adventure.addScene();
		$scope.addAdventure(adventure);
		
		$scope.startRename();
	};
	
	$scope.addAdventure = function(adventure) {
		$scope.adventures.push(adventure);
		$scope.selected.adventure = adventure;
		$scope.selected.scene = adventure.scenes[0];
	};
	
	$scope.toggleSelectedRemoval = function() {
		$scope.selected.adventure.willBeRemoved = !$scope.selected.adventure.willBeRemoved;
		if ( $scope.selected.adventure.willBeRemoved ) {
			var index = $scope.adventures.indexOf($scope.selected.adventure);
			if ( $scope.adventures.length === 1 ) {
				$scope.createAdventure();
			} else if ( index === 0 ) {
				$scope.selected.adventure = $scope.adventures[1];
			} else {
				$scope.selected.adventure = $scope.adventures[index - 1];
			}
		}
	};
	
	$scope.library = new Ambience.AdventureLibrary($scope);
	var loadAdventures = function() {
		var adventures = $scope.library.load();
		if ( adventures.length === 0 ) {
			adventures = [$scope.library.loadExample(), $scope.library.loadExample()];
			adventures[1].title = 'Another example';
			adventures[1].scenes[0].name = 'Other adventure scene';
		}
		
		adventures.forEach(function(adventure) {
			$scope.adventures.push(adventure);
		});
		$scope.selected.adventure = $scope.adventures[$scope.adventures.length - 1];
		// $scope.selected.adventure.loadMedia(); // There is no change event for the first adventure selected, so load the media manually.
		
		// window.addEventListener('beforeunload', $scope.onExit);
	};
	
	$scope.media = new Ambience.MediaLibrary(Ambience.App.db);
	var removeUnusedMedia = function() {
		var items = $scope.adventures.map(get('media')).flatten();
		var usedIds = items.map(get('id'));
		$scope.media.removeUnusedMedia(usedIds);
	};
	
	var editorWidth = 0.75;
	function startInterface() {
		document.addEventListener('keypress', $scope.onKeyPress);
		document.addEventListener('keydown', $scope.onKeyDown);
	}
	
	$scope.editorWidth = editorWidth;
	
	$scope.onKeyDown = function(event) {
		var key = Key.name(event.keyCode);
		if ( $scope.commands[key]  ) {
			event.preventDefault();
			$scope.commands[key]();
		} else {
			var scenes = $scope.selected.adventure.keyedScenes(key);
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
			var scenes = $scope.selected.adventure.keyedScenes(character.toUpperCase());
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
			var scene = $scope.selected.adventure.namedScene($scope.sceneName);
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
	
	$scope.editorIsVisible = true;
	
	start();
};