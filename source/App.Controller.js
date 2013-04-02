// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App = {};

Ambience.App.Controller = function($scope, ambience, localLibrary, googleDriveLibrary) {
	$scope.playScene = function(scene) {
		ambience.play(scene);
	};
	
	$scope.playSelected = function() {
		$scope.playScene($scope.app.scene);
	};
	
	$scope.stopCurrent = function() {
		ambience.fadeOutTopmost();
	};
	
	var adventure = null;
	var scene = null;
	// Just make sure that the media URL change is registered.
	var onMediaLoad = function onMediaLoad(media) {
		$scope.$apply(function() {});
	};
	$scope.app = {
		get adventure() {
			return adventure;
		},
		set adventure(newAdventure) {
			adventure = newAdventure;
			if ( newAdventure ) {
				$scope.app.scene = newAdventure.scenes[0];
				$scope.app.library.media.loadAdventure(newAdventure, onMediaLoad);
			} else {
				$scope.app.scene = null;
			}
		},
		get scene() {
			return scene;
		},
		set scene(newScene) {
			scene = newScene;
		},
		library: localLibrary,
		libraryIsSelected: false,
		libraries: {
			local: localLibrary,
			googleDrive: googleDriveLibrary
		}
	};
	
	$scope.createAdventure = function() {
		var adventure = new Ambience.App.Adventure($scope);
		adventure.title = 'Untitled adventure';
		adventure.scenes.push(new Ambience.App.Scene());
		$scope.addAdventure(adventure);
		$scope.app.renameInProgress = true;
	};
	
	$scope.addAdventure = function(adventure) {
		$scope.app.library.adventures.unshift(adventure);
		$scope.app.adventure = adventure;
	};
	
	$scope.removeAdventure = function(adventure) {
		$scope.app.adventure = $scope.app.library.adventures.closest(adventure);
		$scope.app.library.adventures.remove(adventure);
	};
	
	$scope.selectLibrary = function(newLibrary) {
		$scope.app.library = newLibrary;
		$scope.libraryIsSelected = true;
		
		if ( !newLibrary.adventures.haveLoaded ) {
			newLibrary.adventures.load(onAllAdventuresLoaded, onMediaLoad);
			newLibrary.adventures.haveLoaded = true;
		}
		
		function onAllAdventuresLoaded(adventures) {
			var callback = function() {
				adventures.sort(function(a, b) {
					return a.creationDate - b.creationDate;
				});
				$scope.app.adventure = adventures[0];
			};

			if ( $scope.$$phase ) {
				callback();
			} else {
				$scope.$apply(callback);
			}
		}
		
		// Just make sure that the media URL change is registered.
		function onMediaLoad(media) {
			$scope.$apply(function() {});
		}
	};
	
	$scope.editorWidth = 0.75;
	
	$scope.onKeyDown = function(event) {
		var key = Key.name(event.keyCode);
		if ( $scope.commands[key]  ) {
			event.preventDefault();
			$scope.commands[key]();
		} else if ( $scope.app.adventure ) {
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
		if ( event.charCode !== 0 && $scope.app.adventure ) {
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
		} else if ( $scope.app.adventure ) {
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
				$scope.app.library.loadFile(file);
			}
		});
	};
	
	$scope.onDrag = function(viewModel, dragEvent) {
		dragEvent.preventDefault();
		dragEvent.dataTransfer.dropEffect = 'copy';
	};
	
	$scope.trackIsPlayable = function(track) {
		return window.audioCanPlayType(track.mimeType);
	};
	
	$scope.editorIsVisible = true;
	
	document.addEventListener('keypress', $scope.onKeyPress);
	document.addEventListener('keydown', $scope.onKeyDown);
	window.addEventListener('beforeunload', function(event) {
		// TODO: We should check every activated library for exit messages.
		var returnValue = $scope.app.library.onExit();
		if ( returnValue !== undefined ) {
			return event.returnValue = returnValue;
		}
	});
	
	// Save adventures once every two minutes.
	// var saveInterval = 120 * 1000;
	// window.setInterval(function() {
	// 	$scope.app.library.adventures.save();
	// }, saveInterval);
	
	$scope.saveAllAdventures = function() {
		$scope.app.library.adventures.save();
	};
};

Ambience.App.Controller.$inject = ['$scope', 'ambience', 'localLibrary', 'googleDriveLibrary'];