// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Detached = function($parse) {
	return {
		restrict: 'A',
		link: function(scope, $element, attrs) {
			var element = $element[0];
			var nextSibling = element.nextSibling;
			var otherWindow = null;
			
			scope.$watch(attrs.detached, function(shouldBeDetached) {
				if ( shouldBeDetached ) {
					otherWindow = window.open('stage.html', '_blank');
					
					otherWindow.addEventListener('load', function() {
						console.log('Detaching element');
						
						var detachedElement = otherWindow.document.adoptNode(element);
						otherWindow.document.body.appendChild(detachedElement);
					});
					
					otherWindow.addEventListener('beforeunload', function() {
						console.log('Reattaching element');
						
						var reattachedElement = document.adoptNode(element);
						nextSibling.parentNode.insertBefore(reattachedElement, nextSibling);
						
						if ( scope.$$phase ) {
							$parse(attrs.detached).assign(scope, false);
						} else {
							scope.$apply(function() {
								$parse(attrs.detached).assign(scope, false);
							});
						}
					});
				} else {
					if ( otherWindow ) {
						console.log('Closing detached window');
						otherWindow.close();
					}
				}
			});
		}
	};
};