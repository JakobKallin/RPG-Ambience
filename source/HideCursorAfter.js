// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.HideCursorAfter = function() {
	return {
		restrict: 'A',
		link: function(scope, $element, attrs) {
			var element = $element[0];
			
			var cursorTimer;
			var hideDelay = Number(attrs.hideCursorAfter) * 1000;
			var previousX;
			var previousY;
			
			element.addEventListener('mousemove', showCursorTemporarily);
			element.addEventListener('mouseover', showCursorTemporarily);
			element.addEventListener('mouseout', showCursor);
			
			function showCursorTemporarily(event) {
				// Setting the cursor style seems to trigger a mousemove event, so we have to make sure that the mouse has really moved or we will be stuck in an infinite loop.
				var mouseHasMoved = event.screenX !== previousX || event.screenY !== previousY;
				if ( mouseHasMoved ) {
					showCursor();
					cursorTimer = window.setTimeout(hideCursor, hideDelay);
				}
				
				previousX = event.screenX;
				previousY = event.screenY;
			}
			
			function showCursor() {
				// Prevent any old timeouts from coming into effect.
				window.clearTimeout(cursorTimer);
				element.style.cursor = 'auto';
			}
			
			function hideCursor() {
				if ( !scope.$eval(attrs.alwaysShowCursorWhen) ) {
					element.style.cursor = 'none';
				}
			}
		}
	};
};