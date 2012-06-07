window.addEventListener('load', function() {
	var scenes;
	var effects;
	
	var menu = document.getElementById('menu');
	var fileChooser = document.getElementById('file-chooser');
	var defaultBackground = $(document.body).css('background-color');
	
	var sceneSpeaker = document.getElementById('scene-sound');
	var sceneStage = createStage(document.getElementById('scene-stage'), sceneSpeaker, document.getElementById('scene-text'));
	
	var effectSpeaker = document.getElementById('effect-sound');
	var onAudioEffectEnded = null;
	var effectStage = createStage(document.getElementById('effect-stage'), effectSpeaker, document.getElementById('effect-text'));
	
	var command = '';
	
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
	
	fileChooser.addEventListener('change', function() {
		loadAdventureFile(this.files[0]);
	});
	
	menu.addEventListener('drop', function(event) {
		event.stopPropagation();
		event.preventDefault();
		loadAdventureFile(event.dataTransfer.files[0]);
	});
	
	menu.addEventListener('dragover', function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	});
	
	function loadAdventureFile(file) {
		try {
			var reader = new FileReader();
			reader.onload = function() {
				try {
					var json = JSON.parse(this.result);
					loadAdventure(json);
				} catch (error) {
					alert('There was an error loading the adventure file:\n' + error.message);
				}
			};
			reader.readAsText(file);
		} catch (error) {
			alert(error.message);
		}
	}
	
	function loadAdventure(config) {
		parseConfig(config);
		hideMenu();
		enableStages();
	}
	
	function parseConfig(config) {
		if ( config.scenes === undefined ) {
			scenes = [];
		} else {
			scenes = config.scenes.map(createAudiovisual);
		}
		
		if ( config.effects === undefined ) {
			effects = [];
		} else {
			effects = config.effects.map(createAudiovisual);
		}
	}
	
	function createAudiovisual(config) {
		return {
			get key() {
				return config.key || null;
			},
			get name() {
				return config.name || null;
			},
			get hasName() {
				return this.name !== null;
			},
			get imagePath() {
				if ( config.image ) {
					return encodeURI(config.image);
				} else {
					return null;
				}
			},
			get soundPaths() {
				if ( config.sound instanceof Array ) {
					return config.sound.map(function(soundPath) { return encodeURI(soundPath); });
				} else if ( config.sound ) {
					return [encodeURI(config.sound)];
				} else {
					return null;
				}
			},
			get backgroundColor() {
				return config.background || null;
			},
			get text() {
				return config.text || null;
			},
			get isVisual() {
				return this.imagePath !== null || this.backgroundColor !== null || this.text !== null;
			},
			get isAudial() {
				return this.soundPaths !== null;
			},
			get fadeDuration() {
				if ( config.fade ) {
					return config.fade * 1000;
				} else {
					return 0;
				}
			}
		};
	}
	
	function hideMenu() {
		$(menu).hide();
	}
	
	function createStage(node, speaker, sign) {
		var currentAudiovisual = null;
		var currentSoundIndex = 0;
		var isFadingOut = false;
		
		function stopAudiovisual() {
			$(node).stop(true, true); // Complete all animations, then stop them.
			$(node).css('display', 'none');
			$(node).css('background-color', defaultBackground);
			$(node).css('background-image', '');
			$(node).css('opacity', 0);
			
			if ( currentAudiovisual && currentAudiovisual.text ) {
				resetText();
			}
			
			stopSpeaker();
			
			currentAudiovisual = null;
			currentSoundIndex = 0;
			isFadingOut = false;
		}
		
		function resetText() {
			$(sign).text('');
			for ( var cssProperty in currentAudiovisual.text ) {
				if ( cssProperty !== 'text' ) {
					$(sign).css(cssProperty, '');
				}
			}
		}
		
		function stopSpeaker() {
			if ( !speaker.ended ) {
				try {
					speaker.currentTime = 0;
				} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
				speaker.pause();
			}
			speaker.removeAttribute('src');
		}
		
		function fadeOutAudiovisual() {
			if ( isFadingOut ) {
				stopAudiovisual();
			} else {
				$(node).stop(true); // Stop all animations, because it might be fading in.
				$(node).animate({opacity: 0}, currentAudiovisual.fadeDuration, stopAudiovisual);
				isFadingOut = true;
			}
		}
		
		return {
			isPlaying: function() {
				return currentAudiovisual !== null;
			},
			playAudiovisual: function(audiovisual) {
				if ( audiovisual.imagePath ) {
					$(node).css('background-image', 'url(' + audiovisual.imagePath + ')');
				}
				
				// Locks up scene audio when effect both fades in and has audio for some reason.
				if ( audiovisual.soundPaths ) {
					speaker.src = audiovisual.soundPaths[0];
					speaker.play();
				}
				
				if ( audiovisual.backgroundColor ) {
					$(node).css('background-color', audiovisual.backgroundColor);
				}
				
				if ( audiovisual.isVisual ) {
					$(node).css('display', 'table');
					$(node).animate({opacity: 1}, audiovisual.fadeDuration);
				}
				
				if ( audiovisual.text ) {
					$(sign).html(audiovisual.text.string || '');
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
				currentSoundIndex = (currentSoundIndex + 1) % currentAudiovisual.soundPaths.length
				speaker.src = currentAudiovisual.soundPaths[currentSoundIndex];
				speaker.play();
			}
		};
	};
	
	sceneSpeaker.addEventListener('ended', sceneStage.playNextSound, false);
	effectSpeaker.addEventListener(
		'ended',
		function() {
			if ( onAudioEffectEnded !== null) {
				onAudioEffectEnded();
			}
		},
		false
	);
	
	function executeCommand(command) {
		if ( command.length === 0 ) {
			fadeOutOne();
		} else {
			playNamedAudiovisual(command);
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
		return namedAudiovisual(name, scenes);
	}
	
	function namedEffect(name) {
		return namedAudiovisual(name, effects);
	}
	
	function namedAudiovisual(name, list) {
		if ( name.length > 0 ) {
			return list.first(function(audiovisual) {
				return (
					audiovisual.hasName &&
					audiovisual.name.toUpperCase().startsWith(name.toUpperCase())
				);
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
		stopScene(scene);
		sceneStage.playAudiovisual(scene);
	}
	
	function stopScene() {
		sceneStage.stopAudiovisual();
		stopEffect();
	}
	
	function playEffect(effect) {
		stopEffect();
		effectStage.playAudiovisual(effect);
		
		if ( !effect.isVisual ) {
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
		
		document.addEventListener('keydown', function(event) {
			var keyString = keyStringFromKeyCode(event.which);
			
			if ( keyString === 'Enter' ) {
				executeCommand(command);
				resetCommand();
			} else if ( keyString === 'Backspace' ) {
				event.preventDefault(); // Prevent Back button.
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
		
		document.addEventListener('keypress', function(event) {
			var keyCode = event.which;
			if ( keyCode !== 0 && keyStringFromKeyCode(keyCode) !== 'Enter' ) {
				event.preventDefault();
				var character = String.fromCharCode(keyCode);
				command += character;
			}
		});
	}
});