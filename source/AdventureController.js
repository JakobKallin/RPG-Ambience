// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.AdventureController = function($scope) {
	$scope.addScene = function() {
		var scene = new Ambience.App.Scene()
		$scope.app.adventure.scenes.insertAfter(scene, $scope.app.scene);
		$scope.app.scene = scene;
		
		return scene;
	};
	
	$scope.selectScene = function(scene) {
		$scope.app.scene = scene;
	};
	
	$scope.isSelected = function(scene) {
		return scene === $scope.app.scene;
	}

	$scope.copyScene = function(scene) {
		// We don't create an actual copy because getters and setters are not copied (only their values).
		// TODO: Nested objects (like tracks) should be deeply copied.
		var newScene = new Ambience.App.Scene();
		Object.overlay(newScene, scene);
		
		var index = $scope.app.adventure.scenes.indexOf($scope.app.scene) + 1
		$scope.app.adventure.scenes.splice(index, 0, newScene);
		$scope.selectScene(newScene);
	};

	$scope.removeScene = function(scene) {
		$scope.app.scene = $scope.app.adventure.scenes.closest(scene);
		$scope.app.adventure.scenes.remove(scene);
		
		if ( !$scope.app.scene ) {
			$scope.addScene();
		}
	};
	
	$scope.selectImage = function(scene) {
		$scope.app.library.selectImageFile()
		.then(function(file) {
			$scope.$apply(function() {
				scene.image.file = file;
			});
		});
	};
	
	$scope.removeImage = function(scene) {
		scene.image.file = null;
	};
	
	$scope.selectTracks = function(scene) {
		$scope.app.library.selectSoundFiles()
		.then(function(files) {
			$scope.$apply(function() {
				files.forEach(function(file) {
					scene.sound.tracks.push(file);
				});
			});
		});
	};
	
	$scope.removeTrack = function(scene, track) {
		scene.sound.tracks.remove(track);
	};
};
