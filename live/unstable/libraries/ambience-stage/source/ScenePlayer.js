// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

AmbienceStage.ScenePlayer = function(node) {
	var fade = null;
	var isFadingOut = false;
	var scene = null
	
	var includeInFade = function(object, property, startValue, endValue) {
		if ( isFadingOut ) {
			fade.track(object, property, endValue, startValue);			
		} else {
			fade.track(object, property, startValue, endValue);			
		}
	};
	
	var removeFromFade = function(object) {
		var matchingTarget = fade.targets.first(function(target) {
			return target.object === object;
		});
		fade.targets.remove(matchingTarget);
	};
	
	var mediaPlayers = {
		'background': new AmbienceStage.Background(node),
		'image': new AmbienceStage.Image(node),
		'sound': new AmbienceStage.Sound(node, stopSceneIfSoundOnly, includeInFade, removeFromFade),
		'text': new AmbienceStage.Text(node)
	};

	stop();
	
	function stop() {
		if ( scene === null ) {
			return;
		}

		for ( var mediaType in mediaPlayers ) {
			if ( mediaType in scene ) {
				mediaPlayers[mediaType].stop();
			}
		}
		
		if ( fade ) {
			fade.cancel();
			fade = null;
		}
		isFadingOut = false;
		
		node.style.visibility = 'hidden';
		node.style.opacity = 0;
		scene = null;
	}
	
	function stopSceneIfSoundOnly() {
		if ( scene.hasOnlySound ) {
			stop();
		}
	}
	
	function play(newScene) {
		stop();

		scene = newScene;
		playFadeIn(scene);
		
		for ( var mediaType in mediaPlayers ) {
			if ( mediaType in scene ) {
				mediaPlayers[mediaType].play(scene);
			}
		}
	}

	function mixin(mixin) {
		var alreadyPlaying = scene !== null;
		if ( !alreadyPlaying ) {
			play(mixin);
			return;
		}
		
		var newScene = Object.create(scene);
		for ( var property in mixin ) {
			newScene[property] = mixin[property];
		}

		for ( var mediaType in mediaPlayers ) {
			if ( mediaType in scene && mediaType in mixin ) {
				mediaPlayers[mediaType].stop();
			}
		}

		for ( var mediaType in mediaPlayers ) {
			if ( mediaType in mixin ) {
				mediaPlayers[mediaType].play(newScene);
			}
		}

		if ( mixin.isVisual ) {
			node.style.visibility = 'visible';
		}

		scene = newScene;
	}

	function playFadeIn(scene) {
		if ( scene.isVisual ) {
			node.style.visibility = 'visible';
		}
		var targets = (fade) ? fade.targets : undefined;
		fade = new Manymation.Animation(scene.fade.in, undefined, targets);
		includeInFade(node.style, 'opacity', 0, 0.999)
		fade.start();
	}
	
	// If a duration is passed in, ignore duration specified in scene object.
	// This was added because crossfading between scenes in the Stage class uses the duration of the new scene, not the old one.
	function fadeOut(duration) {
		if ( scene === null ) {
			return;
		}
		
		duration = typeof duration === 'number' ? duration : scene.fade.out;
		
		if ( isFadingOut ) {
			stop();
		} else {
			fade.cancel();
			reverseTargets(fade.targets);
			fade = new Manymation.Animation(duration, stop, fade.targets);
			
			// This needs to be set before starting the fade, because it might be instantaneous.
			// If it is, isFadingOut will be true even though the stage is not fading out.
			isFadingOut = true;
			fade.start();
		}
	}
	
	function reverseTargets(targets) {
		targets.forEach(function(target) {
			var start = target.startValue;
			var end = target.endValue;
			target.startValue = end;
			target.endValue = start;
		});
	}
	
	return {
		play: play,
		mixin: mixin,
		stop: stop,
		fadeOut: fadeOut,
		get sceneIsPlaying() {
			return scene !== null;
		}
	};
};