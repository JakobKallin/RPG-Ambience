// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

var AmbienceStage = function(stageNode) {
	var scenePlayers = [];
	
	function stopAll() {
		playersToStop.forEach(function(player) {
			player.stop();
			scenePlayers.remove(player);
		});
	}
	
	function stopAllButNewest() {
		// Note that the removal operation below is valid, since we're not removing from the sliced list.
		var playersToStop = scenePlayers.slice(0, scenePlayers.length - 1);
		playersToStop.forEach(function(player) {
			player.stop();
			scenePlayers.remove(player);
		});
	}
	
	function addPlayer() {
		var playerNode = document.createElement('div');
		playerNode.className = 'scene';
		stageNode.appendChild(playerNode);
		
		var player = new AmbienceStage.ScenePlayer(playerNode);
		scenePlayers.push(player);
		
		return player;
	}
	
	this.play = function(scene) {
		stopAllButNewest();
		
		var playerToFadeOut = scenePlayers[scenePlayers.length - 1];
		if ( playerToFadeOut ) {
			playerToFadeOut.fadeOut(scene.fade.in);
		}
		
		addPlayer().play(scene);
	};
	
	this.mixin = function(scene) {
		stopAllButNewest();
		
		if ( scenePlayers[0] ) {
			scenePlayers[0].mixin(scene);
		} else {
			addPlayer().play(scene);
		}
	};
	
	this.stop = function() {
		stopAll();
	};
	
	this.fadeOut = function() {
		stopAllButNewest();
		
		if ( scenePlayers[0] ) {
			scenePlayers[0].fadeOut();
		}
	};
	
	Object.defineProperty(this, 'sceneIsPlaying', {
		get: function() {
			// This is not valid, since players are not immediately removed after fading out.
			return scenePlayers.length > 0;
		}
	});
};