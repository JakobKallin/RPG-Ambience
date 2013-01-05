// This file is part of Ambience Stage
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

describe('Ambience audio', function() {
	var stage;
	var stageNode;
	
	beforeEach(function() {
		stageNode = document.createElement('div');
		document.body.appendChild(stageNode);
		stage = new Ambience.Stage(stageNode);
	});
	
	afterEach(function() {
		document.body.removeChild(stageNode);
	});
	
	it('fades audio volume', function() {
		runs(function() {
			var scene = new Ambience.Scene(['Sound']);
			scene.fade.in = 1000;
			scene.sound.tracks = ['test-audio.ogg'];
			stage.play(scene);
		});
		
		waits(500);
		
		runs(function() {
			// If CSS transitions are used, this has to be changed to getComputedStyle.
			// We're using a fairly generous range for the opacity.
			expect(stage.soundNode.volume).toBeGreaterThan(0.25);
			expect(stage.soundNode.volume).toBeLessThan(0.75);
		});
		
		waits(1000);
		
		runs(function() {
			expect(stage.soundNode.volume).toBe(1);
		});
	});
	
	it('stops one-shot audio scenes when audio ends', function() {
		runs(function() {
			var scene = new Ambience.Scene(['Sound']);
			scene.sound.tracks = ['test-audio-2s.ogg'];
			scene.sound.loop = false;
			
			stage.play(scene);
		});
		
		waits(500);
		
		runs(function() {
			expect(stage.sceneIsPlaying).toBe(true);
		});
		
		waits(3000);
		
		runs(function() {
			expect(stage.sceneIsPlaying).toBe(false);
		});
	});
	
	it('removes audio element when audio ends', function() {
		runs(function() {
			var scene = new Ambience.Scene(['Image', 'Sound']);
			scene.image.url = 'test-image.jpg';
			scene.sound.tracks = ['test-audio-2s.ogg'];
			scene.sound.loop = false;
			
			stage.play(scene);
		});
		
		waits(3000);
		
		runs(function() {
			expect(stage.soundCount).toBe(0);
		});
	});
	
	it('overlaps', function() {
		runs(function() {
			var scene = new Ambience.Scene(['Sound']);
			scene.sound.overlap = 2;
			scene.sound.tracks = ['test-audio-5s.ogg', 'test-audio-5s.ogg'];
			scene.sound.loop = false;
			stage.play(scene);
		});
		
		waits(4000);
		
		runs(function() {
			expect(stage.soundCount).toBe(2);
		});
		
		waits(2000);
		
		runs(function() {
			expect(stage.soundCount).toBe(1);
		});
	});
	
	it('respects fade level when a new track is started during fade', function() {
		runs(function() {
			var scene = new Ambience.Scene(['Sound']);
			scene.sound.tracks = ['test-audio-5s.ogg', 'test-audio-5s.ogg'];
			scene.fade.out = 10000;
			stage.play(scene);
			stage.fadeOut();
		});
		
		waits(6000);
		
		runs(function() {
			expect(stage.soundNode.volume).toBeLessThan(0.5);
		});
	});
});