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
	}
	
	function loadAdventure(config) {
		scenes = config.scenes;
		effects = config.effects;
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
	
	function stage(node, speaker) {
		var isPlaying = false;
		return {
			isPlaying: function() {
				return isPlaying;
			},
			playAudiovisual: function(audiovisual) {
				if ( audiovisual.image ) {
					$(node).css('background-image', 'url(' + audiovisual.image + ')');
				}
				
				if ( audiovisual.sound ) {
					speaker.setAttribute('src', audiovisual.sound);
					//sceneSound.load(); // Doesn't seem to be necessary.
					speaker.play();
				}
				
				if ( audiovisual.background ) {
					$(node).css('background-color', audiovisual.background);
				}
				
				if ( audiovisual.image || audiovisual.background ) {
					$(node).css('visibility', 'visible');
				}
				
				isPlaying = true;
			},
			stopAudiovisual: function() {
				$(node).css('visibility', 'hidden');
				$(node).css('background-color', defaultBackground);
				$(node).css('background-image', '');
				
				speaker.pause();
				speaker.removeAttribute('src');
				
				isPlaying = false;
			}
		};
	};
	
	var sceneSpeaker = document.getElementById('scene-sound');
	if ( typeof sceneSpeaker.loop !== 'boolean' ) {
		sceneSpeaker.addEventListener('ended', function() { this.currentTime = 0; }, false);
	}
	var sceneStage = stage(document.getElementById('scene-stage'), sceneSpeaker);
	
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
	var effectStage = stage(document.getElementById('effect-stage'), effectSpeaker);
	
	var command = '';
	function executeCommand(command) {
		console.log('Executing command: ' + command);
		console.log('Command length: ' + command.length);
		if ( command.length === 0 ) {
			stopOne();
		} else {
			var audiovisualName = command;
			playNamedAudiovisual(audiovisualName);
		}
	}
	
	function resetCommand() {
		command = '';
		console.log('Command reset');
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
				return scene.name && scene.name.toUpperCase().startsWith(name);
			});
		} else {
			return null;
		}
	}
	
	function namedEffect(name) {
		if ( name.length > 0 ) {
			return effects.first(function(effect) {
				return effect.name && effect.name.toUpperCase().startsWith(name);
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
	
	function stopOne() {
		if ( effectStage.isPlaying() ) {
			stopEffect();
		} else if ( sceneStage.isPlaying() ) {
			stopScene();
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
			console.log('Command: ' + command);
		}
	});
});