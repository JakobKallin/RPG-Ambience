// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

describe('Ambience audio', function() {
	var player;
	var playerNode;
	
	beforeEach(function() {
		playerNode = document.createElement('div');
		document.body.appendChild(playerNode);
		player = new AmbienceStage.DebugScenePlayer(playerNode);
	});
	
	afterEach(function() {
		player.stop();
		document.body.removeChild(playerNode);
	});
	
	it('fades audio volume', function() {
		runs(function() {
			var scene = new AmbienceStage.Scene(['Sound']);
			scene.fade.in = 500;
			scene.sound.tracks = ['test-audio.ogg'];
			player.play(scene);
		});
		
		waits(250);
		
		runs(function() {
			// If CSS transitions are used, this has to be changed to getComputedStyle.
			// We're using a fairly generous range for the opacity.
			expect(player.soundNode.volume).toBeGreaterThan(0.25);
			expect(player.soundNode.volume).toBeLessThan(0.75);
		});
		
		waits(500);
		
		runs(function() {
			expect(player.soundNode.volume).toBe(1);
		});
	});
	
	it('stops one-shot audio scenes when audio ends', function() {
		runs(function() {
			var scene = new AmbienceStage.Scene(['Sound']);
			scene.sound.tracks = ['test-audio-2s.ogg'];
			scene.sound.loop = false;
			
			player.play(scene);
		});
		
		waits(500);
		
		runs(function() {
			expect(player.sceneIsPlaying).toBe(true);
		});
		
		waits(2000);
		
		runs(function() {
			expect(player.sceneIsPlaying).toBe(false);
		});
	});
	
	it('removes audio element when audio ends', function() {
		runs(function() {
			var scene = new AmbienceStage.Scene(['Image', 'Sound']);
			scene.image.url = 'test-image.jpg';
			scene.sound.tracks = ['test-audio-2s.ogg'];
			scene.sound.loop = false;
			
			player.play(scene);
		});
		
		waits(2500);
		
		runs(function() {
			expect(player.soundCount).toBe(0);
		});
	});
	
	it('overlaps', function() {
		runs(function() {
			var scene = new AmbienceStage.Scene(['Sound']);
			scene.sound.overlap = 2;
			scene.sound.tracks = ['test-audio-5s.ogg', 'test-audio-5s.ogg'];
			scene.sound.loop = false;
			player.play(scene);
		});
		
		waits(4000);
		
		runs(function() {
			expect(player.soundCount).toBe(2);
		});
		
		waits(2000);
		
		runs(function() {
			expect(player.soundCount).toBe(1);
		});
	});
	
	it('respects fade level when a new track is started during fade', function() {
		runs(function() {
			var scene = new AmbienceStage.Scene(['Sound']);
			scene.sound.tracks = ['test-audio-5s.ogg', 'test-audio-5s.ogg'];
			scene.fade.out = 10000;
			player.play(scene);
			player.fadeOut();
		});
		
		waits(6000);
		
		runs(function() {
			expect(player.soundNode.volume).toBeLessThan(0.5);
		});
	});
});