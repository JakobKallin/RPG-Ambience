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
		templates = [];
		for ( var templateName in config.templates ) {
			var templateConfig = config.templates[templateName];
			templates[templateName] = audiovisualFromConfig(templateConfig, templates);
		}
		
		if ( config.scenes === undefined ) {
			scenes = [];
		} else {
			scenes = config.scenes.map(function(sceneConfig) {
				return audiovisualFromConfig(sceneConfig, templates);
			});
		}
		
		if ( config.effects === undefined ) {
			effects = [];
		} else {
			effects = config.effects.map(function(effectConfig) {
				return audiovisualFromConfig(effectConfig, templates);
			});
		}
	}
	
	var baseAudiovisual = {
		fadeDuration: 0,
		soundOrder: 'linear',
		get hasName() {
			return this.name !== undefined;
		},
		get isVisual() {
			return (
				this.imagePath !== undefined ||
				this.backgroundColor !== undefined ||
				this.text !== undefined
			);
		},
		get isAudial() {
			return this.soundPaths !== undefined;
		},
		get hasImage() {
			return this.imagePath !== undefined;
		},
		get hasBackgroundColor() {
			return this.backgroundColor !== undefined;
		},
		get hasText() {
			return this.text !== undefined;
		}
	};
	
	function audiovisualFromConfig(config, templateList) {
		var audiovisual;
		var template;
		var templateName = config.template;
		
		if ( templateName === undefined ) {
			template = baseAudiovisual;
		} else if ( templateName in templateList ) {
			template = templateList[templateName];
		} else {
			throw new Error('There is no template named ' + templateName + '.');
		}
		
		audiovisual = Object.create(template);
		var read = {
			'key': function(value) {
				audiovisual.key = value;
			},
			'name': function(value) {
				audiovisual.name = value;
			},
			'image': function(value) {
				audiovisual.imagePath = encodeURI(value);
			},
			'sound': function(value) {
				if ( !(value instanceof Array) ) {
					value = [value];
				}
				audiovisual.soundPaths = value.map(encodeURI);
			},
			'soundOrder': function(value) {
				audiovisual.soundOrder = value;
			},
			'background': function(value) {
				audiovisual.backgroundColor = value;
			},
			'text': function(textConfig) {
				if ( template.hasText ) {
					audiovisual.text = Object.create(template.text);
				} else {
					audiovisual.text = {};
				}
				
				for ( var property in textConfig ) {
					audiovisual.text[property] = textConfig[property];
				}
			},
			'fade': function(value) {
				audiovisual.fadeDuration = value * 1000;
			}
		};
		
		// Because names and keys are used to select audiovisuals, we don't want to inherit them from templates. They are simply set to undefined, and might be redefined in the loop below.
		audiovisual.name = undefined;
		audiovisual.key = undefined;
		
		for ( var property in read ) {
			var value = config[property];
			
			if ( value !== undefined ) {
				var callback = read[property];
				callback(value);
			}
		}
		
		return audiovisual;
	}
	
	function hideMenu() {
		$(menu).hide();
	}
	
	function createStage(node, speaker, sign) {
		var currentAudiovisual = null;
		var currentSoundIndex = null;
		var isFadingOut = false;
		
		function stopAudiovisual() {
			$(node).stop(true, true); // Complete all animations, then stop them.
			$(node).css('display', 'none');
			$(node).css('background-color', defaultBackground);
			$(node).css('background-image', '');
			$(node).css('opacity', 0);
			
			if ( currentAudiovisual && currentAudiovisual.hasText ) {
				resetText();
			}
			
			stopSpeaker();
			
			currentAudiovisual = null;
			currentSoundIndex = null;
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
		
		function playNextSound() {
			if ( currentAudiovisual.soundOrder === 'random' ) {
				currentSoundIndex = currentAudiovisual.soundPaths.randomIndex();
			} else {
				currentSoundIndex = (currentSoundIndex + 1) % currentAudiovisual.soundPaths.length;
			}
			speaker.src = currentAudiovisual.soundPaths[currentSoundIndex];
			speaker.play();
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
				currentAudiovisual = audiovisual;
				
				if ( audiovisual.hasImage ) {
					$(node).css('background-image', 'url(' + audiovisual.imagePath + ')');
				}
				
				// Locks up scene audio when effect both fades in and has audio for some reason.
				if ( audiovisual.isAudial ) {
					// -1 because the index is either incremented or randomized in the playNextSound method.
					currentSoundIndex = -1;
					playNextSound();
				}
				
				if ( audiovisual.hasBackgroundColor ) {
					$(node).css('background-color', audiovisual.backgroundColor);
				}
				
				if ( audiovisual.isVisual ) {
					$(node).css('display', 'table');
					$(node).animate({opacity: 1}, audiovisual.fadeDuration);
				}
				
				if ( audiovisual.hasText ) {
					$(sign).html(audiovisual.text.string || '');
					for ( var cssProperty in audiovisual.text ) {
						if ( cssProperty !== 'text' ) {
							var cssValue = audiovisual.text[cssProperty];
							$(sign).css(cssProperty, cssValue);
						}
					}
				}
			},
			stopAudiovisual: stopAudiovisual,
			fadeOutAudiovisual: fadeOutAudiovisual,
			playNextSound: playNextSound
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
	
	function keyedAudiovisual(keyString, list) {
		return list.first(function(audiovisual) {
			return audiovisual.key.toUpperCase() === keyString.toUpperCase();
		});
	}
	
	function keyedScene(keyString) {
		return keyedAudiovisual(keyString, scenes);
	}
	
	function keyedEffect(keyString) {
		return keyedAudiovisual(keyString, effects);
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