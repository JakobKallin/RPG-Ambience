// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

// This directive controls playback of the Ambience Stage as well as the "Detach Stage" button.
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
			
			// The "ambience" service is given two DOM nodes to play scenes on.
			// Is there a more decoupled way of doing this than having a service access the DOM?
			ambience.background = new AmbienceStage(element.querySelector('.background'), false);
			ambience.foreground = new AmbienceStage(element.querySelector('.foreground'), false);
			
			document.addEventListener('keypress', onKeyPress);
			document.addEventListener('keydown', onKeyDown);
			
			var nextSibling = element.nextSibling;
			var otherWindow = null;
			
			scope.$watch('isDetached', function(shouldBeDetached) {
				if ( shouldBeDetached ) {
					var width = Math.round(window.outerWidth / 2);
					var height = Math.round(window.outerHeight / 2);
					otherWindow = window.open('stage.html', '_blank', 'width=' + width + ',height=' + height);
					
					otherWindow.addEventListener('load', function() {
						console.log('Detaching element');
						
						var detachedElement = otherWindow.document.adoptNode(element);
						otherWindow.document.body.appendChild(detachedElement);
						
						// Make sure that keyboard commands work in the new window (as well as the old one).
						otherWindow.document.addEventListener('keypress', onKeyPress);
						otherWindow.document.addEventListener('keydown', onKeyDown);
					});
					
					otherWindow.addEventListener('beforeunload', function() {
						console.log('Reattaching element');
						
						var reattachedElement = document.adoptNode(element);
						nextSibling.parentNode.insertBefore(reattachedElement, nextSibling);
						
						// Pressing the toggle button already sets "isDetached" inside a scope, so only set it manually when the window is closed without pressing the button (such as when closing the window manually).
						if ( scope.isDetached ) {
							scope.$apply(function() {
								scope.isDetached = false;
							});
						}
					});
				} else {
					if ( otherWindow ) {
						console.log('Closing detached window');
						otherWindow.close();
					}
				}
			});
			
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