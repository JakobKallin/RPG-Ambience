// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Theater = function(background, foreground) {
	function play(appScene) {
		if ( appScene.layer === 'foreground' ) {
			var layer = foreground;
		} else {
			var layer = background;
		}
		
		if ( appScene.mixin ) {
			var method = layer.mixin;
		} else {
			var method = layer.play;
		}
		
		var theaterScene = convertScene(appScene);
		method(theaterScene);
	}
	
	function fadeOutForeground() {
		foreground.fadeOut();
	}
	
	function fadeOutBackground() {
		background.fadeOut();
	}
	
	function fadeOutTopmost() {
		if ( foreground.sceneIsPlaying ) {
			fadeOutForeground();
		} else if ( background.sceneIsPlaying ) {
			fadeOutBackground();
		}
	}
	
	function convertScene(appScene) {
		var actualTracks = appScene.sound.tracks.filter(function(track) {
			return Boolean(
				track.url &&
				window.audioCanPlayType(track.mimeType)
			);
		});
		
		var mediaTypeTable = {
			Background: true, // Scenes always have a background color.
			Image: Boolean(appScene.image.url),
			Sound: actualTracks.length > 0,
			Text: Boolean(appScene.text.string)
		};
		var mediaTypesPresent = [];
		for ( var mediaType in mediaTypeTable ) {
			if ( mediaTypeTable[mediaType] ) {
				mediaTypesPresent.push(mediaType);
			}
		}
		
		var theaterScene = new Ambience.Scene(mediaTypesPresent);

		var fadeDuration = appScene.fade.duration * 1000;
		theaterScene.fade.in = appScene.fade.direction.contains('in') ? fadeDuration : 0;
		theaterScene.fade.out = appScene.fade.direction.contains('out') ? fadeDuration : 0;

		theaterScene.background.color = appScene.background;
		
		if ( theaterScene.image ) {
			theaterScene.image.url = appScene.image.url;
			theaterScene.image.style = { backgroundSize: appScene.image.size };
		}
		
		if ( theaterScene.sound ) {
			theaterScene.sound.tracks = actualTracks.map(get('url'));
			theaterScene.sound.overlap = appScene.sound.crossover;
			theaterScene.sound.shuffle = appScene.sound.shuffle;
			theaterScene.sound.loop = appScene.sound.loop;
			theaterScene.sound.volume = appScene.sound.volume / 100;
		}
		
		if ( theaterScene.text ) {
			theaterScene.text.string = appScene.text.string;
			theaterScene.text.style = {
				fontSize: (window.innerWidth * appScene.text.size / 100) + 'px',
				fontFamily: appScene.text.font,
				fontStyle: appScene.text.style,
				fontWeight: appScene.text.weight,
				color: appScene.text.color,
				textAlign: appScene.text.alignment,
				padding: '0 ' + (window.innerWidth * appScene.text.padding / 100) + 'px'
			};
		}
		
		return theaterScene;
	}
	
	return {
		play: play,
		fadeOutForeground: fadeOutForeground,
		fadeOutBackground: fadeOutBackground,
		fadeOutTopmost: fadeOutTopmost,
		get sceneIsPlaying() {
			return Boolean(
				background.sceneIsPlaying ||
				foreground.sceneIsPlaying
			);
		}
	};
};