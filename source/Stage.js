// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Stage = function() {
	this.background = null;
	this.foreground = null;
};

Ambience.Stage.prototype = {
	play: function(appScene) {
		if ( !appScene ) {
			return;
		}
		
		if ( appScene.layer === 'foreground' ) {
			var layer = this.foreground;
		} else {
			var layer = this.background;
		}
		
		if ( appScene.mixin ) {
			var method = layer.mixin;
		} else {
			var method = layer.play;
		}
		
		var theaterScene = this.convertScene(appScene);
		method(theaterScene);
	},
	
	fadeOutForeground: function() {
		this.foreground.fadeOut();
	},
	
	fadeOutBackground: function() {
		this.background.fadeOut();
	},
	
	fadeOutTopmost: function() {
		if ( this.foreground.sceneIsPlaying ) {
			this.fadeOutForeground();
		} else if ( this.background.sceneIsPlaying ) {
			this.fadeOutBackground();
		}
	},
	
	convertScene: function(appScene) {
		var actualTracks = appScene.sound.tracks.filter(function(track) {
			return Boolean(
				track.url &&
				window.audioCanPlayType(track.mimeType)
			);
		});
		
		var mediaTypeTable = {
			Background: true, // Scenes always have a background color.
			Image: Boolean(appScene.image.file),
			Sound: actualTracks.length > 0,
			Text: Boolean(appScene.text.string)
		};
		var mediaTypesPresent = [];
		for ( var mediaType in mediaTypeTable ) {
			if ( mediaTypeTable[mediaType] ) {
				mediaTypesPresent.push(mediaType);
			}
		}
		
		var theaterScene = new AmbienceStage.Scene(mediaTypesPresent);

		var fadeDuration = appScene.fade.duration * 1000;
		theaterScene.fade.in = appScene.fade.direction.contains('in') ? fadeDuration : 0;
		theaterScene.fade.out = appScene.fade.direction.contains('out') ? fadeDuration : 0;

		theaterScene.background.color = appScene.background.color;
		
		if ( theaterScene.image ) {
			theaterScene.image.url = appScene.image.file.url;
			theaterScene.image.style = { backgroundSize: appScene.image.size };
		}
		
		if ( theaterScene.sound ) {
			theaterScene.sound.tracks = actualTracks.map(get('url'));
			theaterScene.sound.overlap = appScene.sound.overlap;
			theaterScene.sound.shuffle = appScene.sound.shuffle;
			theaterScene.sound.loop = appScene.sound.loop;
			theaterScene.sound.volume = appScene.sound.volume / 100;
		}
		
		if ( theaterScene.text ) {
			// The scene can be played either in a separate window or in a preview element, so find the width of the element in order to get the correct text size.
			var layer = appScene.layer === 'foreground' ? this.foreground : this.background;
			theaterScene.text.string = appScene.text.string;
			theaterScene.text.style = {
				fontSize: (layer.node.clientWidth * appScene.text.size / 100) + 'px',
				fontFamily: appScene.text.font,
				fontStyle: appScene.text.style,
				fontWeight: appScene.text.weight,
				color: appScene.text.color,
				textAlign: appScene.text.alignment,
				padding: '0 ' + (layer.node.clientWidth * appScene.text.padding / 100) + 'px'
			};
		}
		
		return theaterScene;
	},
	get sceneIsPlaying() {
		return Boolean(
			this.background.sceneIsPlaying ||
			this.foreground.sceneIsPlaying
		);
	}
};