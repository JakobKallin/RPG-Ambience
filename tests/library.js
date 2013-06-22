// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

describe('library', function() {
	var library;
	
	beforeEach(function() {
		library = new Ambience.Library(new Ambience.TestBackend());
	});
	
	it('loads adventures', function() {
		runs(function() {
			library.loadAdventures();
		});
		
		waits(1000);
		
		runs(function() {
			expect(library.adventures.length).toBeGreaterThan(0);
		})
	});
	
	it('loads a single image', function() {
		var imageHasLoaded = false;
		
		runs(function() {
			library.selectImage().then(function(image) {
				imageHasLoaded = true;
			});
		});
		
		waits(1000);
		
		runs(function() {
			expect(imageHasLoaded).toBe(true);
		});
	});
	
	it('notifies image load progress', function() {
		var progressHasBeenNotified = false;
		
		runs(function() {
			library.selectImage().then(undefined, undefined, function() {
				progressHasBeenNotified = true;
			});
		});
		
		waits(1000);
		
		runs(function() {
			expect(progressHasBeenNotified).toBe(true);
		});
	})
});