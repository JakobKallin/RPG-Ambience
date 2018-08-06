// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.ToggleButton = function() {
	return {
		restrict: 'E',
		template: '<button type="button" ng-click="toggle()">{{label}}</button>',
		scope: {
			state: '=ngModel'
		},
		replace: true,
		link: function(scope, $element, attrs) {
			Object.defineProperty(scope, 'label', {
				get: function() {
					return (scope.state === true) ? attrs.ngTrue : attrs.ngFalse;
				}
			});
			
			scope.toggle = function() {
				scope.state = !scope.state;
			};
		}
	};
};