// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Adventure.Controller = function($scope) {
	$scope.selectedScene = $scope.adventure.scenes[0];

	$scope.selectScene = function(scene) {
		$scope.selectedScene = scene;
	};

	$scope.copyScene = function(scene) {
		var copy = angular.copy(scene);
		$scope.adventure.scenes.push(copy);
		$scope.selectedScene = copy;
	};

	$scope.removeScene = function(scene) {
		$scope.adventure.scenes.remove(scene);
		$scope.selectedScene = $scope.adventure.scenes[0];
	};
};
