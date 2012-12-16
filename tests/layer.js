// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

describe('Ambience layer', function() {
	var ambience;
	
	var layer;
	var layerNode;
	
	beforeEach(function() {
		layerNode = document.createElement('div');
		document.body.appendChild(layerNode);
		layer = new Ambience.Layer(layerNode);
		ambience = new Ambience(layer, new Ambience.Layer(document.createElement('div')));
	});
	
	afterEach(function() {
		document.body.removeChild(layerNode);
	});
	
	it('stops any old scene when playing a new scene', function() {
		var scene = new Ambience.Scene();
		scene.image = 'test-image.jpg';
		ambience.play(scene);
		
		var newScene = new Ambience.Scene();
		scene.image = 'test-image.jpg';
		ambience.play(scene);
		
		expect(layer.imageCount).toBe(1);
	});
	
	it("fades an entire layer's opacity", function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.fadeDuration = 1000;
			ambience.play(scene);
		});
		
		waits(500);
		
		runs(function() {
			// If CSS transitions are used, this has to be changed to getComputedStyle.
			// We're using a fairly generous interval for the opacity.
			expect(layer.opacity).toBeGreaterThan(0.25);
			expect(layer.opacity).toBeLessThan(0.75);
		});
		
		waits(1000);
		
		runs(function() {
			expect(layer.opacity).toBeGreaterThan(0.9);
		});
	});
	
	it('stops all layers after fading out', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.fadeDuration = 1000;
			scene.backgroundColor = 'red';
			scene.image = 'test-image.jpg';
			scene.sounds = ['test-audio.ogg'];
			scene.text = 'Test';
			
			ambience.play(scene);
			
			expect(layer.backgroundColor).toBe('red');
			expect(layer.imageCount).toBe(1);
			expect(layer.soundCount).toBe(1);
			expect(layer.textCount).toBe(1);
		});
		
		waits(1500);
		
		runs(function() {
			ambience.fadeOutBackground();
		});
		
		waits(1500);
		
		runs(function() {
			expect(layer.backgroundColor).toBe(Ambience.Scene.base.backgroundColor);
			expect(layer.imageCount).toBe(0);
			expect(layer.soundCount).toBe(0);
			expect(layer.textCount).toBe(0);
		});
	});
});