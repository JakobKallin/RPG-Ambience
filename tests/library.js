// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

describe('Library', function() {
	var library;
	var backend;
	var promise;
	
	beforeEach(function() {
		backend = new Ambience.TestBackend();
		library = new Ambience.Library(backend);
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
					adventureWasUploaded = results[0];
				});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(adventureWasUploaded).toBe(false);
		});
	});
	
	it('selects an image', function() {
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
	
	it('notifies image selection download progress', function() {
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
	
	it('loads media sequentially', function() {
		var loaded = [false, false];
		
		runs(function() {
			library.loadMedia({ id: 'one', mimeType: 'image/jpeg' }).then(function() {
				loaded[0] = true;
			});
			library.loadMedia({ id: 'two', mimeType: 'image/jpeg' }).then(function() {
				loaded[1] = true;
			});
		});
		
		waits(150);
		
		runs(function() {
			expect(loaded[0]).toBe(true);
			expect(loaded[1]).toBe(false);
		});
		
		waits(100);
		
		runs(function() {
			expect(loaded[0]).toBe(true);
			expect(loaded[1]).toBe(true);
		});
	});
	
	it('loads media after pause', function() {
		var loaded = false;
		
		runs(function() {
			library.loadMedia({ id: 'one', mimeType: 'image/jpeg' });
		});
		
		waits(150);
		
		runs(function() {
			library.loadMedia({ id: 'two', mimeType: 'image/jpeg' }).then(function() {
				loaded = true;
			});
		});
		
		waits(150);
		
		runs(function() {
			expect(loaded).toBe(true);
		});
	});
	
	it('loads image and sound simultaneously', function() {
		var loaded = { image: false, sound: false };
		
		runs(function() {
			library.loadMedia({ id: 'image', mimeType: 'image/jpeg' }).then(function() {
				loaded.image = true;
			});
			library.loadMedia({ id: 'sound', mimeType: 'audio/ogg' }).then(function() {
				loaded.sound = true;
			});
		});
		
		waits(150);
		
		runs(function() {
			expect(loaded.image).toBe(true);
			expect(loaded.sound).toBe(true);
		});
	});
	
	it('loads next media even if previous download failed', function() {
		var firstMediaFailed = false;
		var secondMediaLoaded = false;
		
		runs(function() {
			var image = { id: 'image', mimeType: 'image/jpeg' };
			
			backend.isOnline = false;
			library.loadMedia(image).otherwise(function() {
				firstMediaFailed = true;
			})
			// After the first download has failed, make sure the next one will succeed.
			.ensure(function() {
				backend.isOnline = true;
			});
			
			library.loadMedia(image).then(function() {
				secondMediaLoaded = true;
			});
		});
		
		waits(250);
		
		runs(function() {
			expect(firstMediaFailed).toBe(true);
			expect(secondMediaLoaded).toBe(true);
		});
	});
	
	it('logs in again before session expires', function() {
		backend.sessionDuration = 300;
		backend.loginAgainAdvance = 200;
		
		runs(function() {
			promise = library.login();
		});
		
		waitsForPromise();
		waits(400);
		
		runs(function() {
			expect(library.isLoggedIn).toBe(true);
		});
	});
	
	function waitsForPromise() {
		waitsFor(function() {
			return promise.inspect().state !== 'pending';
		}, 'Promise was not resolved in time', 2000);
	}
});