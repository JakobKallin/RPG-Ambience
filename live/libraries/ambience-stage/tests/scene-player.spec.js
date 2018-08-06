// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

describe('Ambience scene player', function() {
	var player;
	var stageNode;
	
	beforeEach(function() {
		stageNode = document.createElement('div');
		document.body.appendChild(stageNode);
		player = new AmbienceStage.DebugScenePlayer(stageNode);
	});
	
	afterEach(function() {
		player.stop();
		document.body.removeChild(stageNode);
	});
	
	function TextScene(string) {
		var scene = new AmbienceStage.Scene(['Text']);
		scene.text.string = string;
		return scene;
	}
	
	function KitchenSinkScene() {
		var scene = new AmbienceStage.Scene(['Background', 'Image', 'Sound', 'Text']);
		scene.background.color = 'red';
		scene.image.url = 'test-image.jpg';
		scene.sound.tracks = ['test-audio-2s.ogg'];
		scene.text.string = 'Text';
		return scene;
	}
	
	it('starts all media', function() {
		player.play(new KitchenSinkScene());
		
		expect(player.background).toBe('red');
		expect(player.imageNode).not.toBeNull();
		expect(player.soundNode).not.toBeNull();
		expect(player.textNode).not.toBeNull();
	});
	
	it('stops all media', function() {
		player.play(new KitchenSinkScene());
		player.stop();
		
		expect(player.background).toBeNull();
		expect(player.imageNode).toBeNull();
		expect(player.soundNode).toBeNull();
		expect(player.textNode).toBeNull();
	});
	
	it('stops all media after fading out', function() {
		runs(function() {
			var scene = new KitchenSinkScene();
			scene.fade.in = scene.fade.out = 250;
			player.play(scene);
		});
		
		waits(500);
		
		runs(function() {
			player.fadeOut();
		});
		
		waits(500);
		
		runs(function() {
			expect(player.background).toBeNull();
			expect(player.imageNode).toBeNull();
			expect(player.soundNode).toBeNull();
			expect(player.textNode).toBeNull();
		});
	});
	
	it('does nothing if started twice', function() {
		player.play(new TextScene('Text 1'));
		player.play(new TextScene('Text 2'));
		
		expect(player.textNode).not.toBeNull();
		expect(player.textNode.textContent).toBe('Text 1');
	});
	
	it('does nothing if stopped twice', function() {
		player.play(new TextScene('Text'));
		player.stop();
	});
	
	it("fades the entire player's opacity", function() {
		runs(function() {
			var scene = new AmbienceStage.Scene();
			scene.fade.in = 500;
			player.play(scene);
		});
		
		waits(250);
		
		runs(function() {
			// If CSS transitions are used, this has to be changed to getComputedStyle.
			// We're using a fairly generous interval for the opacity.
			expect(player.opacity).toBeBetween(0.25, 0.75);
		});
		
		waits(250);
		
		runs(function() {
			expect(player.opacity).toBeGreaterThan(0.9);
		});
	});
	

	it('stops scene that is fading out', function() {
		runs(function() {
			var scene = new TextScene('Text');
			scene.fade.out = 500;
			player.play(scene);
			player.fadeOut();
		});

		waits(250);

		runs(function() {
			player.stop();
			
			expect(player.background).toBeNull();
			expect(player.imageNode).toBeNull();
			expect(player.soundNode).toBeNull();
			expect(player.textNode).toBeNull();
		});
	});
});