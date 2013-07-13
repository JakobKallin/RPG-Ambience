// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Split = function() {
	return {
		restrict: 'A',
		link: function(scope, $element, attrs) {
			var element = $element[0];
			var left = element.firstElementChild;
			var right = left.nextElementSibling;
			var splitter = createSplitter();
			
			splitter.addEventListener('mousedown', onMouseDown);
			document.addEventListener('mouseup', onMouseUp);
			document.addEventListener('mousemove', onMouseMove);
			
			var isPressed = false;
			var latestLeftWidth;
			
			// Set left width to zero when split-collapse-left is true.
			scope.$watch(attrs.splitCollapseLeft, function(value) {
				if ( value ) {
					// Allow the previous width to be recovered later by not setting zero as the latest width.
					updateSilently(0);
				} else {
					update(latestLeftWidth);
				}
			});
			
			// Set left width to zero when split-collapse-left is true.
			scope.$watch(attrs.splitCollapseRight, function(value) {
				if ( value ) {
					// Allow the previous width to be recovered later by not setting zero as the latest width.
					updateSilently(1);
				} else {
					update(latestLeftWidth);
				}
			});
			
			var initialLeftWidth = Number(attrs.split);
			update(initialLeftWidth);
			
			function createSplitter() {
				var splitter = document.createElement('div');
				splitter.className = 'splitter';
				left.appendChild(splitter);
				
				return splitter;
			}
			
			function onMouseDown(event) {
				event.preventDefault();
				isPressed = true;
				document.body.style.cursor = 'w-resize';
			}
			
			function onMouseUp(event) {
				isPressed = false;
				document.body.style.cursor = 'auto';
			}
			
			function onMouseMove(event) {
				if ( isPressed ) {
					var mouseX = event.clientX;
					var percentX = mouseX / document.body.offsetWidth;
					// Make sure the user cannot drag the splitter outside the window.
					percentX = Math.max(0.10, Math.min(percentX, 0.90));
					update(percentX);
				}
			}
			
			function updateSilently(newLeftWidth) {
				if ( newLeftWidth === undefined ) {
					newLeftWidth = latestLeftWidth;
				}
				
				var newRightWidth = 1 - newLeftWidth;
				left.style.width = (newLeftWidth * 100) + '%';
				right.style.width = (newRightWidth * 100) + '%';
			}
			
			function update(newLeftWidth) {
				updateSilently(newLeftWidth);
				latestLeftWidth = newLeftWidth;
			}
		}
	};
};