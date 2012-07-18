Ambience.immersive = {};

window.addEventListener('load', function() {
	var sceneNode = document.getElementById('scene-stage');
	var sceneImage = document.getElementById('scene-image');
	var sceneSpeaker = document.getElementById('scene-sound');
	var sceneText = document.getElementById('scene-text');
	var sceneVideo = document.getElementById('scene-video');
	var sceneStage = new Ambience.Stage(sceneNode, sceneImage, sceneSpeaker, sceneText, sceneVideo);
	
	var effectNode = document.getElementById('effect-stage');
	var effectImage = document.getElementById('effect-image');
	var effectSpeaker = document.getElementById('effect-sound');
	var effectText = document.getElementById('effect-text');
	var effectVideo = document.getElementById('effect-video');
	var effectStage = new Ambience.Stage(effectNode, effectImage, effectSpeaker, effectText, effectVideo);
	
	var ambience = new Ambience(sceneStage, effectStage);
	
	var menu = document.getElementById('menu');
	var fileChooser = document.getElementById('file-chooser');
	var editor = document.getElementById('editor');
	var editorInput = document.getElementById('editor-input');
	var theater = document.getElementById('theater');
	
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
	
	var cursorTimer;
	var cursorHideDelay = 1000;
	var previousX;
	var previousY;
	
	var hideCursor = function() {
		document.body.style.cursor = 'none';
	};
	
	var showCursor = function() {
		document.body.style.cursor = 'auto';
	};
	
	document.body.addEventListener('mousemove', function(event) {
		// Setting the cursor style seems to trigger a mousemove event, so we have to make sure that the mouse has really moved or we will be stuck in an infinite loop.
		var mouseHasMoved = event.screenX !== previousX || event.screenY !== previousY;
		if ( mouseHasMoved ) {
			window.clearTimeout(cursorTimer);
			showCursor();
			cursorTimer = window.setTimeout(hideCursor, cursorHideDelay);
		}
		
		previousX = event.screenX;
		previousY = event.screenY;
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
	
	var audiovisuals;
	
	function loadAdventureFile(file) {
		try {
			var reader = new FileReader();
			reader.onload = function() {
				try {
					readAdventureFile(this.result);
					editorInput.value = this.result;
					hideMenu();
					enableStages();
				} catch (error) {
					alert('There was an error loading the adventure file:\n' + error.message);
				}
			};
			reader.readAsText(file);
		} catch (error) {
			alert(error.message);
		}
	}
	
	function readAdventureFile(contents) {
		var config = jsyaml.load(contents);
		loadAdventure(config);
	}
	
	function loadAdventure(config) {
		parseConfig(config);
	}
	
	function parseConfig(config) {
		var basePath = config['base-path'];
		
		templates = [];
		for ( var templateName in config.templates ) {
			var templateConfig = config.templates[templateName];
			templates[templateName] = Ambience.audiovisual.fromConfig(templateConfig, templates, basePath);
		}
		
		if ( config.scenes === undefined ) {
			audiovisuals = [];
		} else {
			audiovisuals = config.scenes.map(function(sceneConfig) {
				return Ambience.audiovisual.fromConfig(sceneConfig, templates, basePath);
			});
		}
		
		preloadMedia(audiovisuals);
	}
	
	function hideMenu() {
		// Menu is removed entirely so that keyboard focus cannot remain on invisible submit button.
		menu.parentNode.removeChild(menu);
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
	
	function namedAudiovisual(name) {
		if ( name.length > 0 ) {
			return audiovisuals.first(function(audiovisual) {
				return (
					audiovisual.hasName &&
					audiovisual.name.toUpperCase().startsWith(name.toUpperCase())
				);
			});
		} else {
			return null;
		}
	}
	
	function keyedAudiovisual(keyString) {
		return audiovisuals.first(function(audiovisual) {
			return (
				audiovisual.hasKey &&
				audiovisual.key.toUpperCase() === keyString.toUpperCase()
			);
		});
	}
	
	function fadeOutOne() {
		if ( effectStage.audiovisual ) {
			ambience.fadeOutEffect();
		} else if ( sceneStage.audiovisual ) {
			ambience.fadeOutScene();
		}
	}
	
	function playNamedAudiovisual(name) {
		var audiovisual = namedAudiovisual(name);
		ambience.play(audiovisual);
	}
	
	function enableStages() {
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keypress', onKeyPress);
		
		var stopPropagation = function(event) { event.stopPropagation(); };
		editorInput.addEventListener('keydown', stopPropagation);
		editorInput.addEventListener('keypress', stopPropagation);
		editorInput.addEventListener('change', loadEditorAdventure);
		hideEditor();
	}
	
	var editorIsVisible = false;
	
	function showEditor() {
		editor.style.visibility = 'visible';
		theater.className = 'compressed';
		editorIsVisible = true;
	}
	
	function hideEditor() {
		editor.style.visibility = 'hidden';
		theater.className = '';
		editorIsVisible = false;
	}
	
	function toggleEditor() {
		if ( editorIsVisible ) {
			hideEditor();
		} else {
			showEditor();
		}
	}
	
	function loadEditorAdventure() {
		try {
			readAdventureFile(editorInput.value);
		} catch (error) {
			alert('There was an error loading the adventure file:\n' + error.message);
		}
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
			ambience.togglePlayback();
		} else if ( keyString === 'F12' && event.shiftKey && event.ctrlKey ) {
			event.preventDefault();
			toggleEditor();
		} else if ( keyString !== null ) {
			var audiovisual = keyedAudiovisual(keyString);
			if ( audiovisual !== null ) {
				event.preventDefault();
				ambience.play(audiovisual);
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
	
	function preloadMedia(audiovisuals) {
		var node = document.createElement('div');
		node.style.display = 'none';
		document.body.appendChild(node);
		
		audiovisuals.map(function(audiovisual) { preloadImage(audiovisual, node); });
		audiovisuals.map(function(audiovisual) { preloadSound(audiovisual, node); });
	}
	
	function preloadImage(audiovisual, node) {
		if ( audiovisual.hasImage ) {
			var img = document.createElement('img');
			img.src = audiovisual.imagePath;
			node.appendChild(img);
		}
	}
	
	function preloadSound(audiovisual, node) {
		if ( audiovisual.hasSound ) {
			audiovisual.soundPaths.map(function(path) {
				var audio = document.createElement('audio');
				audio.src = path;
				audio.volume = 0;
				node.appendChild(audio);
				audio.play();
				audio.pause();
			});
		}
	}
});