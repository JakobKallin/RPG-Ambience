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
	
	function playBackground(scene) {
		if ( scene ) {
			background.play(scene);
		}
	}

	function playForeground(scene) {
		if ( scene ) {
			foreground.play(scene);
		}
	}
	
	function stopBackground() {
		background.stop();
	}

	function stopForeground() {
		foreground.stop();
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
	
	function convertScene(scene) {
		var converted = new Ambience.Scene();

		var fadeDuration = scene.fade.duration * 1000;
		converted.fade = {
			in: scene.fade.direction.contains('in') ? fadeDuration : 0,
			out: scene.fade.direction.contains('out') ? fadeDuration : 0,
		};

		converted.background = { color: scene.background };
		
		if ( scene.image.url ) {
			converted.image = {
				url: scene.image.url,
				style: { backgroundSize: scene.image.size }
			};
		}
		
		var actualTracks = scene.sound.tracks.filter(function(track) {
			return track.url.length > 0 && track.isPlayable;
		});
		if ( actualTracks.length > 0 ) {
			converted.sound = {
				tracks: actualTracks.map(get('url')),
				overlap: scene.sound.crossover,
				shuffle: scene.sound.shuffle,
				loop: scene.sound.loop,
				volume: scene.sound.volume / 100
			}
		}
		
		if ( scene.text.string ) {
			converted.text = {
				string: scene.text.string,
				style: {
					fontSize: (window.innerWidth * scene.text.size / 100) + 'px',
					fontFamily: scene.text.font,
					fontStyle: scene.text.style,
					fontWeight: scene.text.weight,
					color: scene.text.color,
					textAlign: scene.text.alignment,
					padding: '0 ' + (window.innerWidth * scene.text.padding / 100) + 'px'
				}
			};
		}
		
		return converted;
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