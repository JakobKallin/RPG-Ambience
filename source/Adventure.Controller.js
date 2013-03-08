// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Adventure.Controller = function($scope) {
	$scope.selected.scene = $scope.selected.adventure.scenes[0];
	
	$scope.addScene = function() {
		var scene = Ambience.App.Scene();
		$scope.selected.adventure.scenes.push(scene);
		$scope.selectScene(scene);
		
		return scene;
	};
	
	$scope.selectScene = function(scene) {
		$scope.selected.scene = scene;
	};

	$scope.copyScene = function(scene) {
		var newScene = angular.copy(scene);
		
		var index = $scope.selected.adventure.scenes.indexOf($scope.selected.scene) + 1
		$scope.selected.adventure.scenes.splice(index, 0, newScene);
		$scope.selectScene(newScene);
	};

	$scope.removeScene = function(scene) {
		var previous = $scope.previousScene;
		var selected = $scope.selected.scene;
		var next = $scope.nextScene;
		
		if ( previous ) {
			$scope.selectScene(previous);
		} else if ( next ) {
			$scope.selectScene(next);
		} else {
			$scope.addScene();
		}
		
		// Note that `selected` is now different from `$scope.selected.scene`.
		var index = $scope.selected.adventure.scenes.indexOf(selected);
		$scope.selected.adventure.scenes.splice(index, 1);
	};
	
	Object.defineProperty($scope, 'previousScene', {
		get: function() {
			var index = $scope.selected.adventure.scenes.indexOf($scope.selected.scene);
			if ( index > 0 ) {
				return $scope.selected.adventure.scenes[index - 1];
			} else {
				return null;
			}
		}
	});
	
	Object.defineProperty($scope, 'nextScene', {
		get: function() {
			var index = $scope.selected.adventure.scenes.indexOf($scope.selected.scene);
			if ( index < $scope.selected.adventure.scenes.length - 1 ) {
				return $scope.selected.adventure.scenes[index + 1];
			} else {
				return null;
			}
		}
	});
};
