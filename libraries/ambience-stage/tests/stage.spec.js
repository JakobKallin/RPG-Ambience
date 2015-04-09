// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

// When a scene is stopped, the scene's node and the stage's playback status are updated synchronously (using promises). For this reason, some tests use "waits" with a delay of zero.
describe('Ambience stage', function() {
	var stage;
	var stageNode;
	
	beforeEach(function() {
		stageNode = document.createElement('div');
		document.body.appendChild(stageNode);
		stage = new AmbienceStage(stageNode);
	});
	
	afterEach(function() {
		document.body.removeChild(stageNode);
	});
	
	function ImageScene() {
		var scene = new AmbienceStage.Scene(['Image']);
		scene.image.url = 'test-image.jpg';
		return scene;
	}
	
	it('starts scene', function() {
		stage.play(new ImageScene());
		
		expect(stageNode.children.length).toBe(1);
		expect(stage.sceneIsPlaying).toBe(true);
	});
	
	it('stops scene', function() {
		runs(function() {
			stage.play(new ImageScene());
			stage.stop();
		});
		
		waits(0);
		
		runs(function() {
			expect(stageNode.children.length).toBe(0);
			expect(stage.sceneIsPlaying).toBe(false);
		});
	});
	
	it('fades out scene', function() {
		runs(function() {
			var scene = new ImageScene();
			scene.fade.out = 500;
			stage.play(scene);
			stage.fadeOut();
		});
		
		waits(250);
		
		runs(function() {
			expect(stageNode.children.length).toBe(1);
			expect(stage.sceneIsPlaying).toBe(true);
		});
		
		waits(350);
		
		runs(function() {
			expect(stageNode.children.length).toBe(0);
			expect(stage.sceneIsPlaying).toBe(false);
		});
	});
	
	it('stops old scene when starting new scene', function() {
		runs(function() {
			stage.play(new ImageScene());
			stage.play(new ImageScene());
		});
		
		waits(0);
		
		runs(function() {
			expect(stageNode.children.length).toBe(1);
		});
	});
	
	it('crossfades two scenes', function() {
		runs(function() {
			stage.play(new ImageScene());
			
			var second = new ImageScene();
			second.fade.in = 500;
			stage.play(second);
		});
		
		waits(250);
		
		runs(function() {
			expect(stageNode.children.length).toBe(2);
		});
	});
	
	it('removes old scene after crossfading', function() {
		runs(function() {
			stage.play(new ImageScene());
			
			var second = new ImageScene();
			second.fade.in = 500;
			stage.play(second);
		});
		
		waits(600);
		
		runs(function() {
			expect(stageNode.children.length).toBe(1);
		});
	});
	
	it('completes crossfade before starting new crossfade', function() {
		runs(function() {
			stage.play(new ImageScene());
			
			var second = new ImageScene();
			second.fade.in = 500;
			stage.play(second);
		});
		
		waits(250);
		
		runs(function() {
			var third = new ImageScene();
			third.fade.in = 500;
			stage.play(third);
			
			expect(stageNode.children.length).toBe(2);
		});
	});
	
	it('crossfades using fade-in duration of new scene', function() {
		runs(function() {
			var first = new ImageScene();
			first.fade.out = 0;
			stage.play(first);
			
			var second = new ImageScene();
			second.fade.in = 500;
			stage.play(second);
		});
		
		waits(250);
		
		// We cannot check number of children here, because the stage does not immediately remove scene players when a scene stops.
		runs(function() {
			expect(Number(stageNode.firstChild.style.opacity)).toBeGreaterThan(0);
		});
	});
	
	it('stops both scenes during crossfade', function() {
		runs(function() {
			stage.play(new ImageScene());
			
			var nextScene = new ImageScene();
			nextScene.fade.in = 500;
			stage.play(nextScene);
		});
		
		waits(250);
		
		runs(function() {
			stage.stop();
		});
		
		waits(0);
		
		runs(function() {
			expect(stageNode.children.length).toBe(0);
			expect(stage.sceneIsPlaying).toBe(false);
		});
	});
});