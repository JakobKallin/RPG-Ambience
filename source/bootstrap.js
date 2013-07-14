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
	
	var module = angular.module('ambience', ['ui', 'ui.bootstrap', 'ui.sortable']);
	module.directive('textButton', Ambience.TextButton);
	module.directive('scenePreview', Ambience.ScenePreview);
	module.directive('toggleButton', Ambience.ToggleButton);
	module.directive('resize', Ambience.Resize);
	module.directive('hideCursorAfter', Ambience.HideCursorAfter);
	module.directive('showOnMovement', Ambience.ShowOnMovement);
	module.directive('keyInput', Ambience.KeyInput);
	module.directive('spectrum', Ambience.Spectrum);
	module.directive('ambienceStage', Ambience.StageDirective);
	module.service('ambience', function() {
		return new Ambience.Stage();
	});
	module.service('localLibrary', function() {
		return new Ambience.Library(new Ambience.LocalBackend());
	});
	module.service('googleDriveLibrary', function() {
		return new Ambience.Library(new Ambience.GoogleDriveBackend());
	});
	
	var browserIsSupported = Boolean(window.URL);
	if ( browserIsSupported ) {
		angular.bootstrap(document, ['ambience']);
	} else {
		var unsupportedScreen = document.getElementById('splash-unsupported');
		unsupportedScreen.style.display = '';
	}
	
	var splashScreen = document.getElementById('splash');
	splashScreen.parentNode.removeChild(splashScreen);
});