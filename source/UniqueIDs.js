// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.UniqueIDs = function() {
	return {
		restrict: 'A',
		link: function(scope, $element, attrs) {
			var element = $element[0];

			var id = Ambience.UniqueIDs.nextID;
			Ambience.UniqueIDs.nextID += 1;

			var idElements = element.querySelectorAll('[id]');
			Array.prototype.forEach.call(idElements, function(element) {
				makeUnique(element, 'id');
			});

			var labels = element.querySelectorAll('label[for]');
			Array.prototype.forEach.call(labels, function(label) {
				makeUnique(label, 'for')
			});

			function makeUnique(element, attribute) {
				var oldValue = element.getAttribute(attribute);
				var newValue = oldValue + '-' + id;
				element.setAttribute(attribute, newValue);
			}
		}
	};
};

Ambience.UniqueIDs.nextID = 1;