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
	var library = localLibrary;
	$scope.app = {
		get adventure() {
			return adventure;
		},
		set adventure(newAdventure) {
			adventure = newAdventure;
			if ( newAdventure ) {
				$scope.app.scene = newAdventure.scenes[0];
				$scope.loadAdventureMedia(newAdventure);
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
		get library() {
			return library;
		},
		set library(newLibrary) {
			library = newLibrary;
			if ( library.adventures ) {
				this.adventure = library.adventures[0];
			}
		},
		libraryIsSelected: false,
		libraries: {
			local: localLibrary,
			googleDrive: googleDriveLibrary
		},
		orderedLibraries: [localLibrary, googleDriveLibrary]
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
	
	var mediaLoadedAdventures = [];
	$scope.loadAdventureMedia = function(adventure) {
		if ( mediaLoadedAdventures.contains(adventure) ) {
			console.log(
				'Not requesting media for adventure "' + adventure.title +
				'" because it has already been requested'
			);
			return;
		}
		
		console.log('Loading media for adventure "' + adventure.title + '"');
		mediaLoadedAdventures.push(adventure);
		adventure.scenes.forEach(function(scene) {
			scene.media.forEach($scope.loadMedia);
		});
	};
	
	var exampleMedia = {
		'example:city': { name: 'ishtar_rooftop', type: 'image' },
		'example:dragon-image': { name: 'sintel-wallpaper-dragon', type: 'image' },
		'example:dragon-sound': { name: 'dragon', type: 'audio' },
		'example:music': { name: '9-Trailer_Music', type: 'audio' }
	};
	$scope.loadMedia = function(media) {
		if ( exampleMedia[media.id] ) {
			var name = exampleMedia[media.id].name;
			var type = exampleMedia[media.id].type;
			if ( type === 'audio' && window.audioCanPlayType('audio/ogg') ) {
				var mimeType = 'audio/ogg';
				var extension = 'ogg';
			} else if ( type === 'audio' ) {
				var mimeType = 'audio/mpeg';
				var extension = 'mp3';
			} else {
				var mimeType = 'image/jpeg';
				var extension = 'jpg';
			}
			var url = 'example/' + name + '.' + extension;
			
			window.setTimeout(function() {
				onMediaLoaded({
					id: media.id,
					url: url,
					name: name + '.' + extension,
					mimeType: mimeType
				});
			}, 0);
			
			return;
		}
		
		console.log('Loading media "' + media.id + '"');
		$scope.app.library.media.load(media.id, onMediaLoaded);
		
		function onMediaLoaded(loadedMedia) {
			$scope.$apply(function() {
				media.url = loadedMedia.url;
				media.name = loadedMedia.name;
				media.mimeType = loadedMedia.mimeType;
				media.thumbnail = loadedMedia.thumbnail;
			});
		}
	};
	
	// Note that this code assumes that a library will only be selected once.
	$scope.selectLibrary = function(newLibrary) {
		console.log('Selecting library: ' + newLibrary.name);
		
		$scope.app.library = newLibrary;
		$scope.libraryIsSelected = true;
		
		if ( !newLibrary.adventuresAreBeingLoaded && !newLibrary.adventuresHaveBeenLoaded ) {
			// Set this state variable before the call to "loadAdventures()", in case it is synchronous and sets it to false immediately.
			// (Is this a concern with when.js?)
			newLibrary.adventuresAreBeingLoaded = true;
			newLibrary.login()
			.then(newLibrary.loadAdventures.bind(newLibrary))
			.then(onAllAdventuresLoaded);
		}
		
		function onAllAdventuresLoaded(adventures) {
			var callback = function() {
				adventures.sort(function(a, b) {
					return b.creationDate - a.creationDate;
				});
				
				$scope.app.library = newLibrary;
				newLibrary.adventuresHaveBeenLoaded = true;
				newLibrary.adventuresAreBeingLoaded = false;
			};

			if ( $scope.$$phase ) {
				callback();
			} else {
				$scope.$apply(callback);
			}
		}
	};
	
	$scope.loadExampleAdventure = function() {
		var adventure = new Ambience.App.Adventure.Example();
		$scope.app.library.adventures.push(adventure);
		$scope.app.adventure = adventure;
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
	
	$scope.trackIsPlayable = function(track) {
		return window.audioCanPlayType(track.mimeType);
	};
	
	$scope.editorIsVisible = true;
	
	document.addEventListener('keypress', $scope.onKeyPress);
	document.addEventListener('keydown', $scope.onKeyDown);
	window.addEventListener('beforeunload', function(event) {
		// Trigger a save right before the page closes. If no adventures have changed, this will set adventures.isSaving to false.
		if ( $scope.app.library.adventuresHaveBeenLoaded ) {
			try {
				$scope.app.library.adventures.save();
			} catch(error) {
				return 'There was an error saving your adventure:\n\n' + error.message;
			}
		}
		
		// TODO: We should check every activated library for exit messages.
		
		if ( $scope.app.library.onExit ) {
			var returnValue = $scope.app.library.onExit();
			if ( returnValue !== undefined ) {
				return event.returnValue = returnValue;
			}
		}
	});
	
	var saveInterval = 60 * 1 * 1000;
	function saveAdventures() {
		// Only save if the adventures have been loaded. Otherwise they might be overwritten with an empty list.
		if ( $scope.app.library.adventuresHaveBeenLoaded ) {
			$scope.app.library.adventures.save();
		} else {
			console.log('Delaying adventure saving until adventures for this library have loaded');
		}
		window.setTimeout(saveAdventures, saveInterval);
	}
	window.setTimeout(saveAdventures, saveInterval);
	
	if ( window.localStorage.library === googleDriveLibrary.name ) {
		console.log('Setting library to saved setting: ' + googleDriveLibrary.name)
		$scope.selectLibrary(googleDriveLibrary);
	}
};

Ambience.App.Controller.$inject = ['$scope', 'ambience', 'localLibrary', 'googleDriveLibrary'];