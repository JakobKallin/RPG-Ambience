Ambience = {};

Ambience.start = function() {
	var scenes;
	var effects;
	
	var menu = document.getElementById('menu');
	var fileChooser = document.getElementById('file-chooser');
	
	var sceneSpeaker = document.getElementById('scene-sound');
	var sceneStage = new Ambience.Stage(document.getElementById('scene-stage'), sceneSpeaker, document.getElementById('scene-text'));
	
	var effectSpeaker = document.getElementById('effect-sound');
	var onAudioEffectEnded = null;
	var effectStage = Ambience.Stage(document.getElementById('effect-stage'), effectSpeaker, document.getElementById('effect-text'));
	
	var command = '';
	var paused = false;
	
	var keyStrings = {
		8: 'Backspace',
		13: 'Enter',
		32: 'Space',
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
					var config = jsyaml.load(this.result);
					loadAdventure(config);
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
			templates[templateName] = Ambience.audiovisual.fromConfig(templateConfig, templates);
		}
		
		if ( config.scenes === undefined ) {
			scenes = [];
		} else {
			scenes = config.scenes.map(function(sceneConfig) {
				return Ambience.audiovisual.fromConfig(sceneConfig, templates);
			});
		}
		
		if ( config.effects === undefined ) {
			effects = [];
		} else {
			effects = config.effects.map(function(effectConfig) {
				return Ambience.audiovisual.fromConfig(effectConfig, templates);
			});
		}
	}
	
	function hideMenu() {
		// Menu is removed entirely so that keyboard focus cannot remain on invisible submit button.
		$(menu).remove();
	}
	
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
			return (
				audiovisual.hasKey &&
				audiovisual.key.toUpperCase() === keyString.toUpperCase()
			);
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
		paused = false;
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
		paused = false;
	}
	
	function pause() {
		if ( sceneStage.isPlaying() ) {
			sceneStage.pause()
		}
		
		if ( effectStage.isPlaying() ) {
			effectStage.pause();
		}
	}
	
	function resume() {
		if ( sceneStage.isPlaying() ) {
			sceneStage.resume();
		}
		
		if ( effectStage.isPlaying() ) {
			effectStage.resume();
		}
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
			} else if ( keyString === 'Space' ) {
				event.preventDefault();
				if ( paused ) {
					resume();
					paused = false;
				} else {
					pause();
					paused = true;
				}
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
};