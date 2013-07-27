// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

// This directive controls playback of the Ambience Stage as well as the "Open Player in New Window" button.
// The problem with extracting the detach functionality into a separate directive is that both windows (the editor and the stage) should respond to keyboard events, which means that event listeners have to be registered with both windows. I have not come up with a way of doing this cleanly with a separate "detach" directive.
Ambience.StageDirective = function(ambience) {
	return {
		restrict: 'E',
		templateUrl: 'source/stage-directive.html',
		replace: true,
		scope: {
			isDetached: '=',
			adventure: '='
		},
		link: function(scope, $element, attrs) {
			var element = $element[0];
			
			attach();
			document.addEventListener('keypress', onKeyPress);
			document.addEventListener('keydown', onKeyDown);
			
			scope.$watch('isDetached', function(shouldBeDetached) {
				if ( shouldBeDetached ) {
					detach();
				} else {
					attach();
				}
			});
			
			function attach() {
				if ( ambience.background && ambience.foreground ) {
					// Sounds continue even after closing the window, so make sure everything is stopped.
					ambience.stopAll();
				}
				
				// The "ambience" service is given two DOM nodes to play scenes on.
				// Is there a more decoupled way of doing this than having a service access the DOM?
				ambience.background = new AmbienceStage(element.querySelector('.background'));
				ambience.foreground = new AmbienceStage(element.querySelector('.foreground'));
			}
			
			function detach() {
				ambience.stopAll();
				
				var width = Math.round(window.outerWidth / 2);
				var height = Math.round(window.outerHeight / 2);
				var otherWindow = window.open('player.html', '_blank', 'width=' + width + ',height=' + height);
				
				otherWindow.addEventListener('load', function() {
					ambience.background = new AmbienceStage(otherWindow.document.querySelector('.background'));
					ambience.foreground = new AmbienceStage(otherWindow.document.querySelector('.foreground'));
					
					// Make sure that keyboard commands work in the new window (as well as the old one).
					otherWindow.document.addEventListener('keypress', onKeyPress);
					otherWindow.document.addEventListener('keydown', onKeyDown);
				});
				
				otherWindow.addEventListener('beforeunload', function() {
					attach();
					scope.$apply(function() {
						scope.isDetached = false;
					});
				});
			}
			
			function onKeyDown(event) {
				var key = Key.name(event.keyCode);
				if ( commands[key]  ) {
					event.preventDefault();
					commands[key]();
				} else if ( scope.adventure ) {
					var scenes = scope.adventure.keyedScenes(key);
					if ( scenes.length > 0 ) {
						event.preventDefault();
						scenes.forEach(ambience.play.bind(ambience));
					}
				}
			};
			
			var sceneName = '';
			function onKeyPress(event) {
				// Firefox handles charCode 0 as a string so we guard against it here.
				if ( event.charCode !== 0 && scope.adventure ) {
					var character = String.fromCharCode(event.charCode);
					var scenes = scope.adventure.keyedScenes(character.toUpperCase());
					if ( scenes.length > 0 ) {
						scenes.forEach(ambience.play.bind(ambience));
						sceneName = '';
					} else if ( character ) {
						sceneName = sceneName + character;
					}
				}
			};
			
			function backspaceSceneName() {
				if ( sceneName.length > 0 ) {
					sceneName = sceneName.substring(0, sceneName.length - 1);
				}
			};
			
			function playNamedScene() {
				if ( sceneName.length === 0 ) {
					ambience.fadeOutTopmost();
				} else if ( scope.adventure ) {
					var scene = scope.adventure.namedScene(sceneName);
					if ( scene ) {
						ambience.play(scene);
					}
					sceneName = '';
				}
			};
			
			var commands = {
				'Enter': playNamedScene,
				'Backspace': backspaceSceneName
			};
		}
	};
};