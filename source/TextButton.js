// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.TextButton = function() {
	return {
		restrict: 'E',
		template:
			'<form>' +
				'<button type="button" ng-hide="active">{{label}}</button>' +
				'<input type="text" ng-model="value" ng-show="active">' +
			'</form>',
		scope: {
			value: '=ngModel',
			label: '@ngLabel',
			active: '=activeWhen'
		},
		replace: true,
		link: function(scope, $form, attrs) {
			var form = $form[0];
			var button = form.querySelector('button');
			var input = form.querySelector('input');
			
			scope.$watch('active', function(active) {
				if ( active ) {
					// We must do this after Angular applies its own DOM transformations.
					setTimeout(function() {
						input.focus();
						input.select();
					}, 0);
				}
			});
			
			button.addEventListener('click', function(event) {
				// Make the button and the input have equal widths.
				// Only do this once, but note that this will not be enough if the "Rename Adventure" label changes.
				// We need to do it in here because the button is not visible when the app first loads.
				if ( !input.style.width ) {
					input.style.width = button.offsetWidth + 'px';
				}
				scope.$apply(function() { scope.active = true; });
			});
			input.addEventListener('blur', function(event) {
				scope.$apply(function() { scope.active = false; });
			});
			form.addEventListener('submit', function(event) {
				scope.$apply(function() { scope.active = false; });
			});
		}
	};
};