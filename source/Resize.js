// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Resize = function() {
	return {
		restrict: 'A',
		link: function(scope, $element, attrs) {
			var element = $element[0];
			var splitter = new Splitter();
			
			splitter.addEventListener('mousedown', onMouseDown);
			document.addEventListener('mouseup', onMouseUp);
			document.addEventListener('mousemove', onMouseMove);
			
			var isPressed = false;
			var latestWidth;
			
			var initialWidth = Number(attrs.resize);
			update(initialWidth);
			
			// Set width to zero when "resize-empty" is true.
			scope.$watch(attrs.resizeEmpty, function(shouldBeEmpty) {
				if ( shouldBeEmpty ) {
					// Allow the previous width to be recovered later by not setting zero as the latest width.
					updateSilently(0);
					splitter.style.display = 'none';
				} else {
					update(latestWidth);
					splitter.style.display = '';
				}
			});
			
			// Set width to hundred when "resize full" is true.
			scope.$watch(attrs.resizeFull, function(shouldBeFull) {
				if ( shouldBeFull ) {
					// Allow the previous width to be recovered later by not setting zero as the latest width.
					updateSilently(1);
					splitter.style.display = 'none';
				} else {
					update(latestWidth);
					splitter.style.display = '';
				}
			});
			
			function Splitter() {
				var splitter = document.createElement('div');
				splitter.className = 'splitter';
				element.appendChild(splitter);
				
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
			
			function updateSilently(newWidth) {
				if ( newWidth === undefined ) {
					newWidth = latestWidth;
				}
				
				element.style.width = (newWidth * 100) + '%';
			}
			
			function update(newWidth) {
				updateSilently(newWidth);
				latestWidth = newWidth;
			}
		}
	};
};