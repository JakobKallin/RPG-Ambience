// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

describe('Library', function() {
	var library;
	var promise;
	
	beforeEach(function() {
		library = new Ambience.Library(new Ambience.TestBackend());
		promise = null;
	});
	
	it('loads adventures', function() {
		runs(function() {
			promise = library.loadAdventures();
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(library.adventures.length).toBeGreaterThan(0);
		});
	});
	
	it('saves new adventure', function() {
		var adventureHasBeenSaved = false;
		library.adventures = [ { title: 'New adventure'} ];
		
		runs(function() {
			promise = library.saveAdventures().then(function() {
				adventureHasBeenSaved = true;
			});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(adventureHasBeenSaved).toBe(true);
		})
	});
	
	it('saves modified adventure', function() {
		var modifiedAdventureHasBeenSaved = false;
		var adventure = { title: 'New adventure'};
		library.adventures = [adventure];
		
		// Save the first time.
		runs(function() {
			promise = library.saveAdventures();
		});
		
		waitsForPromise();
		
		// Save the second time, with modifications to the adventure.
		runs(function() {
			adventure.title = 'Modified adventure';
			promise = library.saveAdventures().then(function() {
				modifiedAdventureHasBeenSaved = true;
			});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(modifiedAdventureHasBeenSaved).toBe(true);
		});
	});
	
	it('does not save unmodified adventure', function() {
		var adventureWasUploaded;
		var adventure = { title: 'Adventure'};
		library.adventures = [adventure];
		
		runs(function() {
			promise =
				// Save the first time.
				library.saveAdventures()
				// Save the second time, with no modifications to the adventure.
				.then(library.saveAdventures.bind(library))
				.then(function(results) {
					adventureWasUploaded = !(results.length === 1 && results[0] === false);
				});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(adventureWasUploaded).toBe(false);
		});
	});
	
	it('loads a single image', function() {
		var imageHasLoaded = false;
		
		runs(function() {
			promise = library.selectImage().then(function(image) {
				imageHasLoaded = true;
			});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(imageHasLoaded).toBe(true);
		});
	});
	
	it('notifies image load progress', function() {
		var progressHasBeenNotified = false;
		
		runs(function() {
			promise = library.selectImage().then(undefined, undefined, function() {
				progressHasBeenNotified = true;
			});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(progressHasBeenNotified).toBe(true);
		});
	});
	
	function waitsForPromise() {
		waitsFor(function() {
			return promise.inspect().state !== 'pending';
		});
	}		
});