// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Scene.Controller = function($scope) {
	Object.defineProperty($scope, 'isSelected', {
		get: function() {
			return $scope.scene === $scope.app.scene;
		}
	})
};