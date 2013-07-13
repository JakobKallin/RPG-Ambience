// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

// This directive hides the children of the element when the cursor is not over it and has not moved for a given period of time.
// It doesn't hide the element itself, because a hidden element does not receive mouse events.
// We could use "opacity: 0" to hide it, but then it would still be keyboard-focusable.
Ambience.ShowOnMovement = function() {
	return {
		restrict: 'A',
		link: function(scope, $element, attrs) {
			var element = $element[0];
			
			var hideTimer;
			var hideDelay = Number(attrs.showUnderCursor) * 1000;
			var previousX;
			var previousY;
			var mouseIsOverElement = false;
			
			document.body.addEventListener('mousemove', function() {
				// Setting the cursor style seems to trigger a mousemove event, so we have to make sure that the mouse has really moved.
				var mouseHasMoved = event.screenX !== previousX || event.screenY !== previousY;
				previousX = event.screenX;
				previousY = event.screenY;
				
				if ( mouseHasMoved ) {
					showTemporarily();
				}
			});
			element.addEventListener('mouseover', function() {
				mouseIsOverElement = true;
				show();
			});
			element.addEventListener('mouseout', function() {
				mouseIsOverElement = false;
				hideAfterDelay();
			});
			
			scope.$watch(attrs.alwaysShowWhen, function(shouldBeShown) {
				if ( shouldBeShown ) {
					show();
				}
			})
			
			// It should start hidden, because it will become visible as soon as the cursor hovers over it.
			hide();
			
			function showTemporarily() {
				show();
				hideAfterDelay();
			}
			
			function show() {
				// Prevent any old timeouts from coming into effect.
				window.clearTimeout(hideTimer);
				
				Array.prototype.forEach.call(element.children, function(element) {
					element.style.visibility = 'visible';
				});
			}
			
			function hide() {
				if ( !mouseIsOverElement && !scope.$eval(attrs.alwaysShowWhen) ) {
					Array.prototype.forEach.call(element.children, function(element) {
						element.style.visibility = 'hidden';
					});
				}
			}
			
			function hideAfterDelay() {
				hideTimer = window.setTimeout(hide, hideDelay);
			}
		}
	};
};