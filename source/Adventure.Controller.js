// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Adventure.Controller = function($scope) {
	$scope.addScene = function() {
		var scene = new Ambience.App.Scene()
		$scope.app.adventure.scenes.push(scene);
		$scope.app.library.media.loadScene(scene);
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
		$scope.app.library.selectImage(onLoad);
		
		function onLoad(image) {
			var callback = function() {
				scene.image.url = image.url;
				scene.image.name = image.name;
				scene.image.id = image.id;
			};
			
			if ( $scope.$$phase ) {
				callback();
			} else {
				$scope.$apply(callback);
			}
		}
	};
	
	$scope.removeImage = function(scene) {
		scene.image.id = null;
		scene.image.url = null;
		scene.image.name = null;
	};
	
	$scope.selectTracks = function(scene) {
		$scope.app.library.selectTracks(onLoad);
		
		function onLoad(track) {
			var callback = function() {
				scene.sound.tracks.push(track);
			};
			
			if ( $scope.$$phase ) {
				callback();
			} else {
				$scope.$apply(callback);
			}
		}
	};
	
	$scope.removeTrack = function(scene, track) {
		scene.sound.tracks.remove(track);
	};
};
