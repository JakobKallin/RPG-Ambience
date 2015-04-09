// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

AmbienceStage.DebugScenePlayer = function(stageNode) {
	var player = new AmbienceStage.ScenePlayer(stageNode);
	
	// The code below assumes that there is at most one scene playing.
	Object.defineProperty(player, 'sceneNode', {
		get: function() {
			return stageNode.firstElementChild;
		}
	});
	
	Object.defineProperty(player, 'imageNode', {
		get: function() {
			return stageNode.querySelector('.image');
		}
	});
	
	Object.defineProperty(player, 'soundNode', {
		get: function() {
			return stageNode.querySelector('audio');
		}
	});
	
	Object.defineProperty(player, 'soundCount', {
		get: function() {
			return stageNode.querySelectorAll('audio').length;
		}
	});
	
	Object.defineProperty(player, 'textNode', {
		get: function() {
			return stageNode.querySelector('.text');
		}
	});
	
	Object.defineProperty(player, 'opacity', {
		get: function() {
			return player.sceneNode ? Number(player.sceneNode.style.opacity) : null;
		}
	});
	
	Object.defineProperty(player, 'visibility', {
		get: function() {
			return player.sceneNode ? player.sceneNode.style.visibility : null;
		}
	});
	
	Object.defineProperty(player, 'background', {
		get: function() {
			return player.sceneNode ? player.sceneNode.style.background : null;
		}
	});
	
	return player;
};