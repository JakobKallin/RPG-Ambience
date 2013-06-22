// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.TestBackend = function() {
};

Ambience.TestBackend.prototype.selectImage = function() {
	var deferred = when.defer();
	
	setTimeout(function() {
		deferred.notify(1);
	}, 500);
	
	setTimeout(function() {
		var media = {
			id: 'image',
			url: 'image.svg',
			name: 'image',
			mimeType: 'image/svg+xml'
		};
		deferred.resolve(media);
	}, 1000);

	return deferred.promise;
};