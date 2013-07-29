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
	
	function waitsForPromise() {
		waitsFor(function() {
			return promise.inspect().state !== 'pending';
		}, 'Promise was not resolved in time', 2000);
	}
	
	it('loads adventures', function() {
		runs(function() {
			promise = library.loadAdventures().otherwise(function(e) {
				console.log(e.message);
			});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(library.adventures.length).toBeGreaterThan(0);
		});
	});
	
	it('syncs new adventure', function() {
		var adventureHasBeenSynced = false;
		library.adventures = [ new Ambience.Adventure() ];
		
		runs(function() {
			promise = library.syncAdventures().then(function() {
				adventureHasBeenSynced = true;
			});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(adventureHasBeenSynced).toBe(true);
		})
	});
	
	it('syncs modified adventure', function() {
		var modifiedAdventureHasBeenSynced = false;
		var adventure = new Ambience.Adventure();
		library.adventures = [adventure];
		
		// Sync the first time.
		runs(function() {
			promise = library.syncAdventures();
		});
		
		waitsForPromise();
		
		// Sync the second time, with modifications to the adventure.
		runs(function() {
			adventure.title = 'Modified adventure';
			promise = library.syncAdventures().then(function() {
				modifiedAdventureHasBeenSynced = true;
			});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(modifiedAdventureHasBeenSynced).toBe(true);
		});
	});
	
	// This test checks the internals of the backend. How can this be improved?
	it('does not sync unmodified adventure', function() {
		var adventureWasUploaded;
		var adventure = new Ambience.Adventure();
		adventure.id = adventure.title = 'Adventure to sync twice';
		library.adventures = [adventure];
		
		runs(function() {
			promise =
				// Sync the first time.
				library.syncAdventures()
				// Sync the second time, with no modifications to the adventure.
				.then(function() {
					spyOn(library.backend, 'uploadFile');
					return library.syncAdventures();
				});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(library.backend.uploadFile).not.toHaveBeenCalled();
		});
	});
	
	it('selects an image', function() {
		var imageHasLoaded = false;
		
		runs(function() {
			promise = library.selectImageFile().then(function(image) {
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
			promise = library.selectImageFile().then(undefined, undefined, function() {
				progressHasBeenNotified = true;
			});
		});
		
		waitsForPromise();
		
		runs(function() {
			expect(progressHasBeenNotified).toBe(true);
		});
	});
	
	// This test seems to fail sometimes because of unreliable delays.
	// Note that media added later is downloaded first, because they are prepended to the queue.
	it('loads media sequentially', function() {
		var loaded = [false, false];
		
		runs(function() {
			library.loadMediaFile({ id: 'one', mimeType: 'image/jpeg' }).then(function() {
				loaded[0] = true;
			});
			library.loadMediaFile({ id: 'two', mimeType: 'image/jpeg' }).then(function() {
				loaded[1] = true;
			});
		});
		
		waits(150);
		
		runs(function() {
			expect(loaded[0]).toBe(false);
			expect(loaded[1]).toBe(true);
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
			library.loadMediaFile({ id: 'one', mimeType: 'image/jpeg' });
		});
		
		waits(150);
		
		runs(function() {
			library.loadMediaFile({ id: 'two', mimeType: 'image/jpeg' }).then(function() {
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
			library.loadMediaFile({ id: 'image', mimeType: 'image/jpeg' }).then(function() {
				loaded.image = true;
			});
			library.loadMediaFile({ id: 'sound', mimeType: 'audio/ogg' }).then(function() {
				loaded.sound = true;
			});
		});
		
		waits(150);
		
		runs(function() {
			expect(loaded.image).toBe(true);
			expect(loaded.sound).toBe(true);
		});
	});
	
	it('logs in again before session expires', function() {
		backend.sessionDuration = 300;
		backend.loginAgainAdvance = 150;
		
		runs(function() {
			promise = library.login();
		});
		
		waitsForPromise();
		waits(400);
		
		runs(function() {
			expect(library.isLoggedIn).toBe(true);
			// Stop the callbacks.
			library.logout();
		});
	});
});