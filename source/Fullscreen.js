// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

// This directive puts its grandparent into fullscreen mode and hides its parent when that happens.
// The elements affected are hardcoded specifically for the visual playback interface. This solution is brittle but works for now.
Ambience.Fullscreen = function() {
	return {
		restrict: 'A',
		link: function(scope, $element, attrs) {
			var element = $element[0];
			
			var prefix = 'mozFullScreenElement' in document ? 'moz' : 'webkit';
			
			element.addEventListener('click', function() {
				element.parentNode.parentNode[prefix + 'RequestFullScreen']();
			});
			
			document.addEventListener(prefix + 'fullscreenchange', function() {
				if ( prefix === 'webkit' ) {
					var fullscreenElement = document['webkitFullscreenElement'];
				} else {
					var fullscreenElement = document['mozFullScreenElement'];
				}
				
				if ( fullscreenElement === element.parentNode.parentNode ) {
					element.parentNode.style.display = 'none';
				} else {
					element.parentNode.style.display = '';
				}
			});
		}
	};
};