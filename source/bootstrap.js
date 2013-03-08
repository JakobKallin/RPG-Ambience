// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

window.addEventListener('load', function() {
	var stopPropagation = function(event) {
		var interactiveTagNames = ['input', 'select', 'option', 'optgroup', 'button', 'a', 'textarea'];
		var targetTagName = event.target.tagName.toLowerCase();
		if ( interactiveTagNames.contains(targetTagName) ) {
			event.stopPropagation();
		}
	}
	
	document.body.addEventListener('keydown', stopPropagation);
	document.body.addEventListener('keypress', stopPropagation);
	
	var module = angular.module('ambience', ['ui', 'ui.bootstrap']);
	module.directive('textButton', Ambience.TextButton);
	module.directive('scenePreview', Ambience.ScenePreview);
	module.directive('toggleButton', Ambience.ToggleButton);
	module.directive('split', Ambience.Split);
	module.directive('noPointer', Ambience.NoPointer);
	module.directive('keyInput', Ambience.KeyInput);
	module.directive('spectrum', Ambience.Spectrum);
	angular.bootstrap(document, ['ambience']);
	
	var splashScreen = document.getElementById('splash');
	splashScreen.parentNode.removeChild(splashScreen);
});