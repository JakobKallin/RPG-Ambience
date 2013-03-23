// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Adventure.Controller = function($scope) {
	$scope.addScene = function() {
		var scene = $scope.app.adventure.addScene();
		$scope.selectScene(scene);
		
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
		var previous = $scope.previousScene;
		var app = $scope.app.scene;
		var next = $scope.nextScene;
		
		if ( previous ) {
			$scope.selectScene(previous);
		} else if ( next ) {
			$scope.selectScene(next);
		} else {
			$scope.addScene();
		}
		
		// Note that `app` is now different from `$scope.app.scene`.
		var index = $scope.app.adventure.scenes.indexOf(app);
		$scope.app.adventure.scenes.splice(index, 1);
	};
	
	Object.defineProperty($scope, 'previousScene', {
		get: function() {
			var index = $scope.app.adventure.scenes.indexOf($scope.app.scene);
			if ( index > 0 ) {
				return $scope.app.adventure.scenes[index - 1];
			} else {
				return null;
			}
		}
	});
	
	Object.defineProperty($scope, 'nextScene', {
		get: function() {
			var index = $scope.app.adventure.scenes.indexOf($scope.app.scene);
			if ( index < $scope.app.adventure.scenes.length - 1 ) {
				return $scope.app.adventure.scenes[index + 1];
			} else {
				return null;
			}
		}
	});
	
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
		scene.image.url = null;
	};
	
	$scope.selectTrack = function(scene) {
		$scope.library.selectTrack(onLoad);
		
		function onLoad(track) {
			$scope.$apply(function() {
				scene.sound.tracks.add(track);
			});
		}
	};
	
	$scope.removeTrack = function(scene, track) {
		scene.sound.tracks.remove(track);
	};
};
