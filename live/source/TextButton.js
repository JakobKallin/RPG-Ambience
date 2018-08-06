// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.TextButton = function() {
	return {
		restrict: 'E',
		template:
			'<form>' +
				'<button type="button">{{label}}</button>' +
				'<input type="text" ng-model="value">' +
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
			
			// We set visibility inside a watch instead of "show" and "hide" directives because the directives take effect before the watch, so we are not able to observe the width of the button before it's hidden. Adding a click listener only works when a click activates the input, but it can also be activated by a change to the "active-when" attribute.
			scope.$watch('active', function(active) {
				if ( active ) {
					input.style.width = button.offsetWidth + 'px';
					button.style.display = 'none';
					input.style.display = '';
					
					// We must do this after Angular applies its own DOM transformations.
					setTimeout(function() {
						input.focus();
						input.select();
					}, 0);
				} else {
					button.style.display = '';
					input.style.display = 'none';
				}
			});
			
			button.addEventListener('click', function(event) {
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