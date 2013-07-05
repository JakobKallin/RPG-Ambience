// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.NoPointer = function() {
	return {
		restrict: 'E',
		template: '<div data-ng-transclude data-ng-style="style"></div>',
		scope: {
			alwaysVisible: '=alwaysShowWhen'
		},
		replace: true,
		transclude: true,
		link: function(scope, $element, attrs) {
			var element = $element[0];
			var form = element.querySelector('form');
			
			var cursorTimer;
			var hideDelay = Number(attrs.hideDelay);
			var mouseHasRecentlyMoved = false;
			var previousX;
			var previousY;
			
			Object.defineProperty(scope, 'visible', {
				get: function() {
					return scope.alwaysVisible || mouseHasRecentlyMoved;
				}
			});
			
			Object.defineProperty(scope, 'style', {
				get: function() {
					return {
						opacity: (scope.visible) ? 1 : 0,
						cursor: (scope.visible) ? 'auto' : 'none'
					};
				}
			});
			
			element.addEventListener('mousemove', showElementTemporarily);
			element.addEventListener('mouseover', showElementTemporarily);
			element.addEventListener('mouseout', showElement);
			
			form.addEventListener('mousemove', showElement);
			form.addEventListener('mouseover', showElement);
			
			// Make sure that the element is not hidden when the cursor is over the form.
			// These separate listeners shouldn't be needed, but I could not get it working without them.
			form.addEventListener('mousemove', stopPropagation);
			form.addEventListener('mouseover', stopPropagation);
			
			function showElementTemporarily(event) {
				// Setting the cursor style seems to trigger a mousemove event, so we have to make sure that the mouse has really moved or we will be stuck in an infinite loop.
				var mouseHasMoved = event.screenX !== previousX || event.screenY !== previousY;
				if ( mouseHasMoved ) {
					showElement();
					cursorTimer = window.setTimeout(hideElement, hideDelay);
				}
				
				scope.$apply(function() {
					previousX = event.screenX;
					previousY = event.screenY;
				});
			}
			
			function showElement(event) {
				// In Firefox, the mouseout event is triggered when a scene with an image is started, because the mouse leaves the stage for the image.
				// This code only shows the interface when the mouse leaves for another part of the document.
				// There should be a better way to do this but it seems to fix the problem for now.
				if ( event && event.currentTarget.contains(event.target) ) {
					return;
				}

				window.clearTimeout(cursorTimer);
				
				scope.$apply(function() {
					mouseHasRecentlyMoved = true;
				});
			}
			
			function hideElement() {
				scope.$apply(function() {
					mouseHasRecentlyMoved = false;
				});
			}
			
			function stopPropagation(event) {
				event.stopPropagation();
				window.clearTimeout(cursorTimer);
			}
		}
	};
};