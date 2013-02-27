Ambience.TextButton = function() {
	return {
		restrict: 'E',
		template:
			'<form>' +
				'<button type="button" ng-hide="isEditing">{{label}}</button>' +
				'<input type="text" ng-model="value" ng-show="isEditing">' +
			'</form>',
		scope: {
			value: '=ngModel',
			label: '@ngLabel'
		},
		replace: true,
		link: function(scope, $element, attrs) {
			var element = $element[0];
			var button = element.querySelector('button');
			var input = element.querySelector('input');
			
			scope.isEditing = false;
			
			// Make the button and the input have equal widths.
			scope.$watch('label', function() {
				input.style.width = button.offsetWidth + 'px';
			});
			
			button.addEventListener('click', function(event) {
				scope.$apply(function() {
					scope.isEditing = true;
				});
				input.focus();
				input.select();
			});
			
			input.addEventListener('blur', function(event) {
				scope.$apply(function() {
					scope.isEditing = false;
				});
			});
		}
	};
};