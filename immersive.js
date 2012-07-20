Ambience.immersive = {};

window.addEventListener('load', function() {
	var sceneNode = document.getElementById('scene-stage');
	var sceneText = document.getElementById('scene-text');
	var sceneStage = new Ambience.Stage(sceneNode, sceneText);
	
	var effectNode = document.getElementById('effect-stage');
	var effectText = document.getElementById('effect-text');
	var effectStage = new Ambience.Stage(effectNode, effectText);
	
	var ambience = new Ambience(sceneStage, effectStage);
	
	var editor = document.getElementById('editor');
	var editorInput = document.getElementById('editor-input');
	var theater = document.getElementById('theater');
	
	var fileChooser = document.getElementById('file-chooser');
	var menu = document.getElementById('menu');
	
	var preloader = new Ambience.Preloader();
	
	var adventure;
	var adventureCallbacks = {
		onFileRead: function(contents) {
			editorInput.value = contents;
		},
		onAdventureLoaded: function(newAdventure) {
			adventure = newAdventure;
			hideMenu();
			enableStages();
			preloader.preloadMedia(adventure);
		},
		onError: function(error) {
			alert('There was an error loading the adventure file:\n' + error.message);
		}
	};
	
	menu.addEventListener('drop', function(event) {
		event.stopPropagation();
		event.preventDefault();
		Ambience.Adventure.loadFromFile(event.dataTransfer.files[0], adventureCallbacks);
	});
	
	menu.addEventListener('dragover', function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	});
	
	fileChooser.addEventListener('change', function() {
		Ambience.Adventure.loadFromFile(this.files[0], adventureCallbacks);
	});
	
	function hideMenu() {
		// Menu is removed entirely so that keyboard focus cannot remain on invisible submit button.
		menu.parentNode.removeChild(menu);
	}
	
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
	
	function executeCommand(command) {
		if ( command.length === 0 ) {
			fadeOutOne();
		} else {
			playNamedScene(command);
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
			return adventure.scenes.first(function(scene) {
				return (
					scene.hasName &&
					scene.name.toUpperCase().startsWith(name.toUpperCase())
				);
			});
		} else {
			return null;
		}
	}
	
	function keyedScene(keyString) {
		return adventure.scenes.first(function(scene) {
			return (
				scene.hasKey &&
				scene.key.toUpperCase() === keyString.toUpperCase()
			);
		});
	}
	
	function fadeOutOne() {
		if ( effectStage.scene ) {
			ambience.fadeOutEffect();
		} else if ( sceneStage.scene ) {
			ambience.fadeOutScene();
		}
	}
	
	function playNamedScene(name) {
		var scene = namedScene(name);
		ambience.play(scene);
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
	
	function onKeyDown(event) {
		var keyString = keyStringFromKeyCode(event.which);
		
		if ( keyString === 'Enter' ) {
			executeCommand(command);
			resetCommand();
		} else if ( keyString === 'Backspace' ) {
			event.preventDefault(); // Prevent Back button.
			backspaceCommand();
		} else if ( keyString === 'F12' && event.shiftKey && event.ctrlKey ) {
			event.preventDefault();
			toggleEditor();
		} else if ( keyString !== null ) {
			var scene = keyedScene(keyString);
			if ( scene !== null ) {
				event.preventDefault();
				ambience.play(scene);
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
			var newAdventure = Ambience.Adventure.fromString(editorInput.value);
			adventure = newAdventure;
			preloader.preloadMedia(adventure);
		} catch (error) {
			alert('There was an error loading the adventure file:\n' + error.message);
		}
	}
});