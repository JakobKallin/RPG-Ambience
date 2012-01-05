$(window).load(function() {
	var scenes = [
		{ key: 'F1', name: 'fates', image: 'fates.jpg', sound: 'fates.mp3' },
		{ key: 'F2', name: 'clones', image: 'clones.jpg' },
		{ key: 'F3', name: 'alliance', image: 'alliance.svg', background: 'white' }
	];
	
	var effects = [
		{ key: 'F4', name: 'saber', image: 'saber.png', sound: 'saber.mp3', background: 'transparent' },
		{ key: 'F5', name: 'sabersound', sound: 'saber.mp3' }
	];
	
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
	
	var sceneStage = document.getElementById('scene-stage');
	var effectStage = document.getElementById('effect-stage');
	
	var sceneSpeaker = document.getElementById('scene-sound');
	if ( typeof sceneSpeaker.loop !== 'boolean' ) {
		sceneSpeaker.addEventListener('ended', function() { this.currentTime = 0; }, false);
	}
	
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
	
	var sceneIsPlaying = false;
	var effectIsPlaying = false;
	
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
		} else {
			return null;
		}
	}
	
	function namedScene(name) {
		if ( name.length > 0 ) {
			return scenes.first(function(scene) {
				return scene.name && scene.name.startsWith(name);
			});
		} else {
			return null;
		}
	}
	
	function namedEffect(name) {
		if ( name.length > 0 ) {
			return effects.first(function(effect) {
				return effect.name && effect.name.startsWith(name);
			});
		} else {
			return null;
		}
	}
	
	function keyedScene(keyString) {
		for ( var i = 0; i < scenes.length; i++ ) {
			var scene = scenes[i];
			if ( scene.key === keyString ) {
				return scene;
			}
		}
		return null;
	}
	
	function keyedEffect(keyString) {
		for ( var i = 0; i < effects.length; i++ ) {
			var effect = effects[i];
			if ( effect.key === keyString ) {
				return effect;
			}
		}
		return null;
	}
	
	function playScene(scene) {
		stopScene();
		stopEffect();
		playAudiovisual(scene, sceneStage, sceneSpeaker);
		sceneIsPlaying = true;
	}
	
	function stopScene() {
		stopAudiovisual(sceneStage, sceneSpeaker);
		sceneIsPlaying = false;
		stopEffect();
	}
	
	function playEffect(effect) {
		stopEffect();
		playAudiovisual(effect, effectStage, effectSpeaker);
		effectIsPlaying = true;
		
		if ( !effect.image && !effect.background ) {
			onAudioEffectEnded = stopEffect;
		}
	}
	
	function stopEffect() {
		stopAudiovisual(effectStage, effectSpeaker);
		effectIsPlaying = false;
		onAudioEffectEnded = null;
	}
	
	function stopOne() {
		if ( effectIsPlaying ) {
			stopEffect();
		} else if ( sceneIsPlaying ) {
			stopScene();
		}
	}
	
	function playAudiovisual(scene, stage, speaker) {
		if ( scene.image ) {
			$(stage).css('background-image', 'url(' + scene.image + ')');
		}
		
		if ( scene.sound ) {
			speaker.setAttribute('src', scene.sound);
			//sceneSound.load(); // Doesn't seem to be necessary.
			speaker.play();
		}
		
		if ( scene.background ) {
			$(stage).css('background-color', scene.background);
		}
		
		if ( scene.image || scene.background ) {
			$(stage).css('visibility', 'visible');
		}
	}
	
	function stopAudiovisual(stage, speaker) {
		$(stage).css('visibility', 'hidden');
		$(stage).css('background-color', defaultBackground);
		$(stage).css('background-image', '');
		
		if ( speaker ) {
			speaker.pause();
			speaker.removeAttribute('src');
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