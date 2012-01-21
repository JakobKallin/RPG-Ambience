$(window).load(function() {
	var scenes;
	var effects;
	
	var menu = document.getElementById('menu');
	var fileChooser = document.getElementById('file-chooser');
	$(fileChooser).change(function() {
		hideMenu();
		loadAdventureFile(this.files[0]);
	});
	
	menu.addEventListener('drop', function(event) {
		event.stopPropagation();
		event.preventDefault();
		hideMenu();
		loadAdventureFile(event.dataTransfer.files[0]);
	});
	menu.addEventListener('dragover', function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	});
	
	function loadAdventureFile(file) {
		var reader = new FileReader();
		reader.onload = function() {
			var json = JSON.parse(this.result);
			loadAdventure(json);
		};
		reader.readAsText(file);
		enableStages();
	}
	
	function loadAdventure(config) {
		scenes = config.scenes || [];
		effects = config.effects || [];
	}
	
	function hideMenu() {
		$(menu).hide();
	}
	
	var keyStrings = {
		8: 'Backspace',
		13: 'Enter',
		112: 'F1',
		113: 'F2',
		114: 'F3',
		115: 'F4',
		116: 'F5',
		117: 'F6',
		118: 'F7',
		119: 'F8',
		120: 'F9',
		121: 'F10',
		122: 'F11',
		123: 'F12'
	};
	
	var defaultBackground = 'black';
	$(document.body).css('background-color', defaultBackground);
	
	function stage(node, speaker, sign) {
		var currentAudiovisual = null;
		var isFadingOut = false;
		var currentSoundIndex = 0; // Only used for scenes with multiple sounds.
		
		function stopAudiovisual() {
			$(node).stop(true, true); // Complete all animations, then stop them.
			$(node).css('display', 'none');
			$(node).css('background-color', defaultBackground);
			$(node).css('background-image', '');
			$(node).css('opacity', 0);
			
			if ( currentAudiovisual && currentAudiovisual.text ) {
				$(sign).text('');
				for ( var cssProperty in currentAudiovisual.text ) {
					if ( cssProperty !== 'text' ) {
						$(sign).css(cssProperty, '');
					}
				}
			}
			
			speaker.pause();
			speaker.removeAttribute('src');
			
			currentAudiovisual = null;
			isFadingOut = false;
		}
		
		function fadeOutAudiovisual() {
			if ( isFadingOut ) {
				stopAudiovisual();
			} else {
				$(node).stop(true); // Stop all animations, because it might be fading in.
				
				if ( currentAudiovisual.fade ) {
					var fadeDuration = currentAudiovisual.fade * 1000;
				} else {
					var fadeDuration = 0;
				}
				
				$(node).animate({opacity: 0}, fadeDuration, stopAudiovisual);
				isFadingOut = true;
			}
		}
		
		return {
			isPlaying: function() {
				return currentAudiovisual !== null;
			},
			playAudiovisual: function(audiovisual) {
				if ( audiovisual.image ) {
					$(node).css('background-image', 'url(' + audiovisual.image + ')');
				}
				
				// Locks up scene audio when effect both fades in and has audio for some reason.
				if ( audiovisual.sound ) {
					if ( jQuery.isArray(audiovisual.sound) ) {
						speaker.src = audiovisual.sound[0];
					} else {
						speaker.src = audiovisual.sound;
					}
					//speaker.load(); // Doesn't seem to be necessary.
					speaker.play();
				}
				
				if ( audiovisual.background ) {
					$(node).css('background-color', audiovisual.background);
				}
				
				if ( audiovisual.image || audiovisual.background || audiovisual.text ) {
					$(node).css('display', 'table');
					
					if ( audiovisual.fade ) {
						var fadeDuration = audiovisual.fade * 1000;
					} else {
						var fadeDuration = 0;
					}
					
					$(node).animate({opacity: 1}, fadeDuration);
				}
				
				if ( audiovisual.text ) {
					$(sign).text(audiovisual.text.string || '');
					for ( var cssProperty in audiovisual.text ) {
						if ( cssProperty !== 'text' ) {
							var cssValue = audiovisual.text[cssProperty];
							$(sign).css(cssProperty, cssValue);
						}
					}
				}
				
				currentAudiovisual = audiovisual;
			},
			stopAudiovisual: stopAudiovisual,
			fadeOutAudiovisual: fadeOutAudiovisual,
			playNextSound: function() {
				if ( jQuery.isArray(currentAudiovisual.sound) ) {
					currentSoundIndex = (currentSoundIndex + 1) % currentAudiovisual.sound.length
					speaker.src = currentAudiovisual.sound[currentSoundIndex];
					speaker.play();
				} else {
					speaker.currentTime = 0;
				}
			}
		};
	};
	
	var sceneSpeaker = document.getElementById('scene-sound');
	var sceneStage = stage(document.getElementById('scene-stage'), sceneSpeaker, document.getElementById('scene-text'));
	sceneSpeaker.addEventListener('ended', sceneStage.playNextSound, false);
	
	var effectSpeaker = document.getElementById('effect-sound');
	var onAudioEffectEnded = null;
	effectSpeaker.addEventListener(
		'ended',
		function() {
			if ( onAudioEffectEnded !== null) {
				onAudioEffectEnded();
			}
		},
		false
	);
	var effectStage = stage(document.getElementById('effect-stage'), effectSpeaker, document.getElementById('effect-text'));
	
	var command = '';
	function executeCommand(command) {
		if ( command.length === 0 ) {
			fadeOutOne();
		} else {
			var audiovisualName = command;
			playNamedAudiovisual(audiovisualName);
		}
	}
	
	function resetCommand() {
		command = '';
	}
	
	function backspaceCommand() {
		if ( command.length > 0 ) {
			command = command.substring(0, command.length - 1);
		}
	}
	
	function keyStringFromKeyCode(keyCode) {
		if ( keyCode in keyStrings ) {
			return keyStrings[keyCode];
		} else if ( String.fromCharCode(keyCode) !== '' ) {
			return String.fromCharCode(keyCode);
		} else {
			return null;
		}
	}
	
	function namedScene(name) {
		if ( name.length > 0 ) {
			return scenes.first(function(scene) {
				return scene.name && scene.name.toUpperCase().startsWith(name.toUpperCase());
			});
		} else {
			return null;
		}
	}
	
	function namedEffect(name) {
		if ( name.length > 0 ) {
			return effects.first(function(effect) {
				return effect.name && effect.name.toUpperCase().startsWith(name.toUpperCase());
			});
		} else {
			return null;
		}
	}
	
	function keyedScene(keyString) {
		for ( var i = 0; i < scenes.length; i++ ) {
			var scene = scenes[i];
			if ( scene.key.toUpperCase() === keyString.toUpperCase() ) {
				return scene;
			}
		}
		return null;
	}
	
	function keyedEffect(keyString) {
		for ( var i = 0; i < effects.length; i++ ) {
			var effect = effects[i];
			if ( effect.key.toUpperCase() === keyString.toUpperCase() ) {
				return effect;
			}
		}
		return null;
	}
	
	function playScene(scene) {
		stopScene();
		stopEffect();
		sceneStage.playAudiovisual(scene);
	}
	
	function stopScene() {
		sceneStage.stopAudiovisual();
		stopEffect();
	}
	
	function playEffect(effect) {
		stopEffect();
		effectStage.playAudiovisual(effect);
		
		if ( !effect.image && !effect.background ) {
			onAudioEffectEnded = stopEffect;
		}
	}
	
	function stopEffect() {
		effectStage.stopAudiovisual();
		onAudioEffectEnded = null;
	}
	
	function fadeOutEffect() {
		effectStage.fadeOutAudiovisual();
	}
	
	function fadeOutScene() {
		sceneStage.fadeOutAudiovisual();
	}
	
	function fadeOutOne() {
		if ( effectStage.isPlaying() ) {
			fadeOutEffect();
		} else if ( sceneStage.isPlaying() ) {
			fadeOutScene();
		}
	}
	
	function playNamedAudiovisual(name) {
		var scene = namedScene(name);
		if ( scene === null ) {
			var effect = namedEffect(name);
			if ( effect !== null ) {
				playEffect(effect);
			}
		} else {
			playScene(scene);
		}
	}
	
	function enableStages() {
		$(sceneStage).css('display', 'table');
		$(effectStage).css('display', 'table');
		
		$(document).keydown(function(event) {
			var keyString = keyStringFromKeyCode(event.which);
			
			if ( keyString === 'Enter' ) {
				executeCommand(command);
				resetCommand();
			} else if ( keyString === 'Backspace' ) {
				event.preventDefault();
				backspaceCommand();
			} else if ( keyString !== null ) {
				var scene = keyedScene(keyString);
				if ( scene === null ) {
					var effect = keyedEffect(keyString);
					if ( effect !== null ) {
						event.preventDefault();
						playEffect(effect);
						resetCommand();
					}
				} else {
					event.preventDefault();
					playScene(scene);
					resetCommand();
				}
			}
		});
		
		$(document).keypress(function(event) {
			var keyCode = event.which;
			if ( keyCode !== 0 && keyStringFromKeyCode(keyCode) !== 'Enter' ) {
				event.preventDefault();
				var character = String.fromCharCode(keyCode);
				command += character;
			}
		});
	}
});