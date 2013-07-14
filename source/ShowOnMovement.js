// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

// This directive hides the children of the element when the cursor is not over it and has not moved for a given period of time.
// It doesn't hide the element itself, because a hidden element does not receive mouse events.
// We could use "opacity: 0" to hide it, but then it would still be keyboard-focusable.

'use strict';

Ambience.ShowOnMovement = function() {
	return {
		restrict: 'A',
		link: function(scope, $element, attrs) {
			var element = $element[0];
			
			var hideTimer;
			var hideDelay = Number(attrs.showOnMovement) * 1000;
			var previousX;
			var previousY;
			var mouseIsOverElement = false;
			
			element.parentNode.addEventListener('mousemove', function(event) {
				// Setting the cursor style seems to trigger a mousemove event, so we have to make sure that the mouse has really moved.
				// This is needed even though this directive doesn't affect the cursor, because others might.
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
			element.addEventListener('mouseover', function() {
				mouseIsOverElement = true;
			});
			
			scope.$watch(attrs.alwaysShowWhen, function(shouldBeShown) {
				if ( shouldBeShown ) {
					show();
				} else {
					// Hide it after a delay if the attribute changes, because mouse movement will cancel the timer.
					hideAfterDelay();
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
				// This is somewhat of an edge case, but the scheduling of hiding should itself only be performed when the conditions below are true.
				// If not, the element can be hidden earlier than one second after they become false, which is incorrect.
				if ( !mouseIsOverElement && !scope.$eval(attrs.alwaysShowWhen) ) {
					hideTimer = window.setTimeout(hide, hideDelay);
				}
			}
		}
	};
};