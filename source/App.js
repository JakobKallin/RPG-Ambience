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
		converted = $scope.app.adventure.convertScene(scene);
		if ( scene.layer === 'background' ) {
			ambience.playBackground(converted);
		} else {
			ambience.playForeground(converted);
		}
	};
	
	$scope.playSelected = function() {
		$scope.playScene($scope.app.adventure.current);
	};
	
	$scope.stopCurrent = function() {
		ambience.fadeOutTopmost();
	};
	
	var adventure = null;
	var scene = null;
	$scope.app = {
		get adventure() {
			return adventure;
		},
		set adventure(newAdventure) {
			adventure = newAdventure;
			$scope.app.scene = newAdventure.scenes[0];
		},
		get scene() {
			return scene;
		},
		set scene(newScene) {
			scene = newScene;
		},
		adventures: []
	};
	
	$scope.createAdventure = function() {
		var adventure = new Ambience.App.Adventure($scope);
		adventure.title = 'Untitled adventure';
		adventure.addScene();
		$scope.addAdventure(adventure);
		$scope.app.renameInProgress = true;
	};
	
	$scope.addAdventure = function(adventure) {
		$scope.app.adventures.push(adventure);
		$scope.app.adventure = adventure;
	};
	
	$scope.removeSelected = function() {
		$scope.app.adventures.remove($scope.app.adventure);
		$scope.app.adventure = null;
		$scope.app.scene = null;
	};
	
	$scope.library = new Ambience.App.Library.Test();
	var loadAdventures = function() {
		$scope.library.loadAdventures(onLoad);
		
		function onLoad(adventure) {
			$scope.$apply(function() {
				$scope.app.adventures.push(adventure);
				if ( $scope.app.adventures.length === 1 ) {
					$scope.app.adventure = adventure;
				}
			});
		}
	};
	
	// $scope.media = new Ambience.MediaLibrary(Ambience.App.db);
	// var removeUnusedMedia = function() {
	// 	var items = $scope.app.adventures.map(get('media')).flatten();
	// 	var usedIds = items.map(get('id'));
	// 	$scope.media.removeUnusedMedia(usedIds);
	// };
	
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
			var scenes = $scope.app.adventure.keyedScenes(key);
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
			var scenes = $scope.app.adventure.keyedScenes(character.toUpperCase());
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
			var scene = $scope.app.adventure.namedScene($scope.sceneName);
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
	
	// Object.defineProperty($scope, 'exitMessage', {
	// 	get: function() {
	// 		if ( $scope.media.transactionCount > 0 ) {
	// 			return 'There are currently media files being saved. If you exit now, you risk losing data.';
	// 		} else {
	// 			return undefined;
	// 		}
	// 	}
	// });
	
	$scope.onExit = function(event) {
		$scope.permanentlyRemoveAdventures();
		$scope.library.save($scope.app.adventures);
		
		if ( $scope.exitMessage ) {
			return event.returnValue = $scope.exitMessage;
		}
	};
	
	$scope.permanentlyRemoveAdventures = function() {
		var removed = $scope.app.adventures.filter(get('willBeRemoved'));
		removed.forEach(function(adventure) {
			$scope.app.adventures.remove(adventure);
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

Ambience.App.Library = {};