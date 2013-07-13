// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App = {};

Ambience.Controller = function($scope, ambience, localLibrary, googleDriveLibrary) {
	$scope.playScene = function(scene) {
		ambience.play(scene);
	};
	
	$scope.stopScene = function() {
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
		var adventure = new Ambience.Adventure($scope);
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
		$scope.app.library.adventuresToRemove.push(adventure);
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
			if ( scene.image.file ) {
				$scope.loadMediaFile(scene.image.file);
			}
			scene.sound.tracks.forEach($scope.loadMediaFile);
		});
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
			.then(onAllAdventuresLoaded)
			.otherwise(function(e) {
				console.log('Logging in to library failed.');
			});
		}
		
		function onAllAdventuresLoaded(adventures) {
			var callback = function() {
				$scope.app.library = newLibrary;
				newLibrary.adventuresHaveBeenLoaded = true;
				newLibrary.adventuresAreBeingLoaded = false;
				
				// Only save library setting if adventures have successfully loaded, as they have here.
				window.localStorage.library = newLibrary.name;
			};

			$scope.$apply(callback);
		}
	};
	
	$scope.loadExampleAdventure = function() {
		var adventure = new Ambience.ExampleAdventure();
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
		// Return immediately if we're using the local library, which cannot save anything to begin with.
		// If we don't do this, the library will believe that the backend is saving if an adventure is changed, because the state change signaling that saving is done happens asynchronously.
		if ( $scope.app.library === localLibrary ) {
			return;
		}
		
		// Trigger a save right before the page closes. If no adventures have changed, this will set adventures.isSaving to false.
		if ( $scope.app.library.adventuresHaveBeenLoaded ) {
			console.log('Syncing adventures');
			$scope.app.library.syncAdventures().otherwise(function(error) {
				console.log('There was an error syncing adventures');
			});
		}
		
		if ( $scope.app.library.adventuresAreBeingSynced ) {
			var exitMessage = 'Your adventures are currently being saved. If you exit now, you risk losing data.';
			if ( exitMessage !== undefined ) {
				// We both return the message and set it to "event.returnValue" due to browser differences.
				return event.returnValue = exitMessage;
			}
		}
	});
	
	var saveInterval = 60 * 1 * 1000;
	function syncAdventures() {
		// Only save if the adventures have been loaded. Otherwise they might be overwritten with an empty list.
		if ( $scope.app.library.adventuresHaveBeenLoaded ) {
			$scope.app.library.syncAdventures();
		} else {
			console.log('Delaying adventure syncing until adventures for this library have loaded');
		}
		window.setTimeout(syncAdventures, saveInterval);
	}
	window.setTimeout(syncAdventures, saveInterval);
	
	if ( window.localStorage.library === googleDriveLibrary.name ) {
		console.log('Setting library to saved setting: ' + googleDriveLibrary.name)
		$scope.selectLibrary(googleDriveLibrary);
	}
	
	$scope.addSceneAfter = function(sceneBefore, adventure) {
		var scene = new Ambience.App.Scene()
		adventure.scenes.insertAfter(scene, sceneBefore);
		$scope.app.scene = scene;
		
		return scene;
	};
	
	$scope.selectScene = function(scene) {
		$scope.app.scene = scene;
	};
	
	$scope.isSelected = function(scene) {
		return scene === $scope.app.scene;
	};

	$scope.copyScene = function(scene, adventure) {
		// We don't create an actual copy because getters and setters are not copied (only their values).
		// TODO: Nested objects (like tracks) should be deeply copied.
		var newScene = new Ambience.App.Scene();
		Object.overlay(newScene, scene);
		
		var index = adventure.scenes.indexOf($scope.app.scene) + 1
		adventure.scenes.splice(index, 0, newScene);
		$scope.selectScene(newScene);
	};

	$scope.removeScene = function(scene, adventure) {
		nextScene = adventure.scenes.closest(scene);
		adventure.scenes.remove(scene);
		
		if ( nextScene ) {
			$scope.selectScene(nextScene);
		} else {
			$scope.addSceneAfter(adventure);
		}
	};
	
	$scope.loadMedia = function(scene) {
		scenes.forEach(function(scene) {
			if ( scene.image.file ) {
				$scope.loadMediaFile(scene.image.file);
			}
			scene.sound.tracks.forEach($scope.loadMediaFile);
		});
	};
	
	$scope.loadMediaFile = function(file) {
		console.log('Loading media file "' + file.name + '"');
		
		$scope.app.library.loadMediaFile(file)
		.then(onFileLoaded, undefined, onLoadProgress);
		
		function onFileLoaded(loadedFile) {
			// This callback used to copy the "loadedFile" properties to "file", but now they are the same; "file" is actually mutated inside the library.
			$scope.$apply(function() {});
		}
		
		function onLoadProgress(percentageOrPreviewUrl) {
			$scope.$apply(function() {
				if ( typeof percentageOrPreviewUrl === 'string' ) {
					file.previewUrl = percentageOrPreviewUrl;
				} else {
					file.progress = percentageOrPreviewUrl;
				}
			});
		}
	};
	
	$scope.selectImage = function(scene) {
		$scope.app.library.selectImageFile()
		.then(function(file) {
			$scope.$apply(function() {
				scene.image.file = file;
				// The local library receives a URL immediately, so do not attempt to load it.
				if ( file.url ) {
					file.progress = 1.0;
				} else {
					$scope.loadMediaFile(file);
				}
			});
		});
	};
	
	$scope.removeImage = function(scene) {
		scene.image.file = null;
	};
	
	$scope.selectTracks = function(scene) {
		$scope.app.library.selectSoundFiles()
		.then(function(files) {
			files.forEach(function(file) {
				$scope.$apply(function() {
					scene.sound.tracks.push(file);
					// The local library receives a URL immediately, so do not attempt to load it.
					if ( file.url ) {
						file.progress = 1.0;
					} else {
						$scope.loadMediaFile(file);
					}
				});
			});
		});
	};
	
	$scope.removeTrack = function(track, scene) {
		scene.sound.tracks.remove(track);
	};
};

Ambience.Controller.$inject = ['$scope', 'ambience', 'localLibrary', 'googleDriveLibrary'];