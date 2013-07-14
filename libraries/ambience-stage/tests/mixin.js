// This file is part of Ambience Stage
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

describe('Ambience mixin', function() {
	var stage;
	var stageNode;
	
	beforeEach(function() {
		stageNode = document.createElement('div');
		document.body.appendChild(stageNode);
		stage = new AmbienceStage.DebugStage(stageNode);
	});
	
	beforeEach(function() {
		this.addMatchers({
			toBeBetween: function(first, second) {
				var lowest = Math.min(first, second);
				var highest = Math.max(first, second);
				
				return lowest <= this.actual && this.actual <= highest;
			}
		});
	});
	
	afterEach(function() {
		document.body.removeChild(stageNode);
	});
	
	it('replaces defined properties', function() {
		var scene = new AmbienceStage.Scene(['Text']);
		scene.text.string = 'Test';
		stage.play(scene);
		
		var mixin = new AmbienceStage.Scene(['Text']);
		mixin.text.string = 'Mixin';
		stage.mixin(mixin);
		
		expect(stage.textNode.textContent).toBe('Mixin');
	});
	
	it('retains undefined properties', function() {
		var scene = new AmbienceStage.Scene(['Text']);
		scene.text.string = 'Test';
		stage.play(scene);
		
		var mixin = new AmbienceStage.Scene(['Image']);
		mixin.image.url = 'test-image.jpg';
		stage.mixin(mixin);
		
		expect(stage.textNode.textContent).toBe('Test');
		expect(stage.imageNode.style.backgroundImage).toMatch(/test-image/);
	});
	
	it('ignores fading when a scene is already playing', function() {
		runs(function() {
			var scene = new AmbienceStage.Scene(['Text']);
			scene.text.string = 'Test';
			stage.play(scene);
			
			var mixin = new AmbienceStage.Scene(['Text']);
			mixin.text.string = 'Mixin';
			mixin.fade.in = 2000;
			stage.mixin(mixin);
		});
		
		waits(1000);
		
		runs(function() {
			expect(stage.opacity).toBeGreaterThan(0.9);
		});
	});
	
	it('respects fading when a scene is not already playing', function() {
		runs(function() {
			var mixin = new AmbienceStage.Scene(['Text']);
			mixin.text.string = 'Mixin';
			mixin.fade.in = 2000;
			stage.mixin(mixin);
		});
		
		waits(1000);
		
		runs(function() {
			expect(stage.opacity).toBeBetween(0.25, 0.75);
		});
	});
	
	it('respects opacity when mixed-in during fade', function() {
		runs(function() {
			var base = new AmbienceStage.Scene(['Image']);
			base.image.url = 'test-image.jpg';
			base.fade.in = 2000;
			stage.play(base);
		});
		
		waits(500);
		
		runs(function() {
			var mixin = new AmbienceStage.Scene(['Text']);
			mixin.text.string = 'Mixin';
			stage.mixin(mixin);
		});
		
		waits(500);
		
		runs(function() {
			expect(stage.opacity).toBeBetween(0.25, 0.75);
		});
	});
	
	it('respects volume when mixed-in during fade', function() {
		runs(function() {
			var base = new AmbienceStage.Scene(['Sound']);
			base.sound.tracks = ['test-audio.ogg'];
			base.fade.in = 2000;
			stage.play(base);
		});
		
		waits(500);
		
		runs(function() {
			var mixin = new AmbienceStage.Scene(['Sound']);
			mixin.sound.tracks = ['test-audio.ogg'];
			stage.mixin(mixin);
		});
		
		waits(500);
		
		runs(function() {
			expect(stage.soundNode.volume).toBeBetween(0.25, 0.75);
		});
	});
	
	it('keeps playing visual scene even after audio of mixed-in one-shot audio scene ends', function() {
		runs(function() {
			var scene = new AmbienceStage.Scene(['Image']);
			scene.image.url = 'test-image.jpg';
			stage.play(scene);
			
			var mixin = new AmbienceStage.Scene(['Sound']);
			mixin.sound.tracks = ['test-audio-2s.ogg'];
			mixin.sound.loop = false;
			stage.mixin(mixin);
		});
		
		waits(500);
		
		runs(function() {
			expect(stage.soundCount).toBe(1);
		});
		
		waits(3000);
		
		runs(function() {
			expect(stage.sceneIsPlaying).toBe(true);
		});
	});
	
	it('displays visual mixin even when previous scene was not visual', function() {
		var scene = new AmbienceStage.Scene(['Sound']);
		scene.sound.tracks = ['test-audio-2s.ogg'];
		scene.sound.loop = false;
		stage.play(scene);
		
		var mixin = new AmbienceStage.Scene(['Image']);
		mixin.image.url = 'test-image.jpg';
		stage.mixin(mixin);
		
		expect(stageNode.style.visibility).toBe('visible');
	});
	
	it('respects volume of mixed-in scene', function() {
		runs(function() {
			var scene = new AmbienceStage.Scene(['Sound']);
			scene.sound.tracks = ['test-audio-2s.ogg'];
			scene.sound.loop = false;
			stage.play(scene);
			
			var mixin = new AmbienceStage.Scene(['Sound']);
			mixin.sound.tracks = ['test-audio-2s.ogg'];
			mixin.sound.volume = 0.5;
			mixin.sound.loop = false;
			stage.mixin(mixin);
		});
		
		waits(500);
		
		runs(function() {
			expect(stage.soundNode.volume).toBeBetween(0.45, 0.55);
		});
	});
});