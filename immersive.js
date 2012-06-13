window.addEventListener('load', function() {
	var sceneNode = document.getElementById('scene-stage');
	var sceneSpeaker = document.getElementById('scene-sound');
	var sceneText = document.getElementById('scene-text')
	var sceneStage = new Ambience.Stage(sceneNode, sceneSpeaker, sceneText, false);
	
	var effectNode = document.getElementById('effect-stage');
	var effectSpeaker = document.getElementById('effect-sound');
	var effectText = document.getElementById('effect-text');
	var effectStage = Ambience.Stage(effectNode, effectSpeaker, effectText, true);
	
	var theater = new Ambience(sceneStage, effectStage);
	
	var menu = document.getElementById('menu');
	var fileChooser = document.getElementById('file-chooser');
	
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
	
	var command = '';
	
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
	
	var scenes;
	var effects;
	
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
	
	function fadeOutOne() {
		if ( effectStage.hasAudiovisual ) {
			theater.fadeOutEffect();
		} else if ( sceneStage.hasAudiovisual ) {
			theater.fadeOutScene();
		}
	}
	
	function playNamedAudiovisual(name) {
		var scene = namedScene(name);
		if ( scene === null ) {
			var effect = namedEffect(name);
			if ( effect !== null ) {
				theater.playEffect(effect);
			}
		} else {
			theater.playScene(scene);
		}
	}
	
	function enableStages() {
		sceneNode.style.display = 'table';
		effectNode.style.display = 'table';
		
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keypress', onKeyPress);
	}
	
	function onKeyDown(event) {
		var keyString = keyStringFromKeyCode(event.which);
		
		if ( keyString === 'Enter' ) {
			executeCommand(command);
			resetCommand();
		} else if ( keyString === 'Backspace' ) {
			event.preventDefault(); // Prevent Back button.
			backspaceCommand();
		} else if ( keyString === 'Space' ) {
			event.preventDefault();
			theater.togglePlayback();
		} else if ( keyString !== null ) {
			var scene = keyedScene(keyString);
			if ( scene === null ) {
				var effect = keyedEffect(keyString);
				if ( effect !== null ) {
					event.preventDefault();
					theater.playEffect(effect);
					resetCommand();
				}
			} else {
				event.preventDefault();
				theater.playScene(scene);
				resetCommand();
			}
		}
	}
	
	function onKeyPress(event) {
		var keyCode = event.which;
		if ( keyCode !== 0 && keyStringFromKeyCode(keyCode) !== 'Enter' ) {
			event.preventDefault();
			var character = String.fromCharCode(keyCode);
			command += character;
		}
	}
});