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
			
			// Make the button and the input have equal widths.
			scope.$watch('label', function() {
				input.style.width = button.offsetWidth + 'px';
			});
			
			scope.$watch('active', function(active) {
				if ( active ) {
					activate();
				} else {
					deactivate();
				}
			});
			
			button.addEventListener('click', function(event) {
				scope.$apply(activate);
			});
			input.addEventListener('blur', function(event) {
				scope.$apply(deactivate);
			});
			form.addEventListener('submit', function(event) {
				scope.$apply(deactivate);
			});
			
			function activate() {
				scope.active = true;
				// We must do this after Angular applies its own DOM transformations.
				setTimeout(function() {
					input.focus();
					input.select();
				}, 0);
			}
			
			function deactivate() {
				scope.active = false;
			}
		}
	};
};