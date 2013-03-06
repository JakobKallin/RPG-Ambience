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
	
	var browserIsSupported = function() {
		return Boolean(window.indexedDB && window.URL);
	};
	
	var removeSplashScreen = function() {
		var splash = document.getElementById('splash');
		splash.parentNode.removeChild(splash);
	};
	
	var showSupportInfo = function() {
		var loadingMessage = document.getElementById('splash-loading');
		var unsupportedMessage = document.getElementById('splash-unsupported');
		loadingMessage.style.display = 'none';
		unsupportedMessage.style.display = '';
	};
	
	if ( !browserIsSupported() ) {
		showSupportInfo();
		return;
	}

	var dbRequest = indexedDB.open('media');
	
	dbRequest.onupgradeneeded = function(event) {
		createDatabase(event.target.result);
	};
	
	dbRequest.onsuccess = function(successEvent) {
		var db = successEvent.target.result;
		if ( db.setVersion ) {
			db.setVersion('1').onsuccess = function(versionEvent) {
				createDatabase(db)
				versionEvent.target.result.oncomplete = function() {
					onDatabaseLoaded(db);
				};
			}
		} else {
			onDatabaseLoaded(db);
		}
	};
	
	var createDatabase = function(db) {
		if ( !db.objectStoreNames.contains('media') ) {
			db.createObjectStore('media');
		}
	};
	
	var onDatabaseLoaded = function(db) {
		Ambience.App.db = db;
		var module = angular.module('ambience', ['ui']);
		module.directive('textButton', Ambience.TextButton);
		module.directive('scenePreview', Ambience.ScenePreview);
		module.directive('toggleButton', Ambience.ToggleButton);
		module.directive('split', Ambience.Split);
		module.directive('noPointer', Ambience.NoPointer);
		module.directive('keyInput', Ambience.KeyInput);
		angular.bootstrap(document, ['ambience']);
		removeSplashScreen();
	};
});