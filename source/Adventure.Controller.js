// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Adventure.Controller = function($scope) {
	$scope.selectedScene = $scope.adventure.scenes[0];
	
	$scope.addScene = function() {
		var scene = Ambience.App.Scene();
		$scope.adventure.scenes.push(scene);
		$scope.selectScene(scene);
		
		return scene;
	};
	
	$scope.selectScene = function(scene) {
		$scope.selectedScene = scene;
	};

	$scope.copyScene = function(scene) {
		var newScene = angular.copy(scene);
		
		var index = $scope.adventure.scenes.indexOf($scope.selectedScene) + 1
		$scope.adventure.scenes.splice(index, 0, newScene);
		$scope.selectScene(newScene);
	};

	$scope.removeScene = function(scene) {
		var previous = $scope.previousScene;
		var selected = $scope.selectedScene;
		var next = $scope.nextScene;
		
		if ( previous ) {
			$scope.selectScene(previous);
		} else if ( next ) {
			$scope.selectScene(next);
		} else {
			$scope.addScene();
		}
		
		// Note that `selected` is now different from `$scope.selectedScene`.
		var index = $scope.adventure.scenes.indexOf(selected);
		$scope.adventure.scenes.splice(index, 1);
	};
	
	Object.defineProperty($scope, 'previousScene', {
		get: function() {
			var index = $scope.adventure.scenes.indexOf($scope.selectedScene);
			if ( index > 0 ) {
				return $scope.adventure.scenes[index - 1];
			} else {
				return null;
			}
		}
	});
	
	Object.defineProperty($scope, 'nextScene', {
		get: function() {
			var index = $scope.adventure.scenes.indexOf($scope.selectedScene);
			if ( index < $scope.adventure.scenes.length - 1 ) {
				return $scope.adventure.scenes[index + 1];
			} else {
				return null;
			}
		}
	});
};
