// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.KeyInput = function() {
	return {
		restrict: 'E',
		template: '<input type="text"></input>',
		scope: {
			key: '=ngModel'
		},
		replace: true,
		link: function(scope, $element, attrs, ctrl) {
			var element = $element[0];
			
			// This should not be necessary, but adding an ng-model directive to the template conflicts with the one added to the custom element.
			// The custom element itself is replaced by the template, but its attributes are carried over.
			scope.$watch('key', function(value) {
				element.value = value;
			});
			
			var specialKeyFound = false;
			var bindableKeys = Ambience.KeyInput.bindableKeys;
			
			element.addEventListener('keydown', bindSpecialKey);
			element.addEventListener('keypress', bindTextKey);
			element.addEventListener('keyup', stopKeyBinding);
			
			function bindSpecialKey(event) {
				var keyName = Key.name(event.keyCode);
				if ( keyName === 'Tab' ) {
					specialKeyFound = true; // Prevent bindTextKey from triggering.
				} else if ( ['Backspace', 'Delete', 'Escape'].contains(keyName) ) {
					specialKeyFound = true;
					scope.$apply(function() {
						scope.key = '';
					});
				} else if ( bindableKeys.contains(keyName) ) {
					specialKeyFound = true;
					scope.$apply(function() {
						scope.key = keyName;
					});
					event.preventDefault();
				}
			}

			function bindTextKey(event) {
				if ( !specialKeyFound ) {
					var keyText = String.fromCharCode(event.which);
					if ( keyText.isCharacter ) {
						scope.$apply(function() {
							scope.key = keyText.toUpperCase();
						});
					}
					event.preventDefault();
				}
			}

			function stopKeyBinding(event) {
				specialKeyFound = false;
			}
		}
	};
};

Ambience.KeyInput.bindableKeys = [
	'F1',
	'F2',
	'F3',
	'F4',
	'F5',
	'F6',
	'F7',
	'F8',
	'F9',
	'F10',
	'F11',
	'F12',
	'Space'
];