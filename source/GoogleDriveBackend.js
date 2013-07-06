// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

(function() {
	var appId = '907013371139.apps.googleusercontent.com';
	
	function loadScript(url) {
		var deferred = when.defer();
		
		var element = document.createElement('script');
		element.addEventListener('load', function() {
			deferred.resolve();
		});
		element.addEventListener('error', function(event) {
			deferred.reject(event);
		});
		element.src = url;
		document.head.appendChild(element);
		
		return deferred.promise;
	}
	
	function loadGoogleDriveApi() {
		console.log('Loading Google Drive API');
		var deferred = when.defer();
		gapi.client.load('drive', 'v2', function() {
			deferred.resolve();
		});
			
		return deferred.promise;
	}
	
	function loadGoogleApi() {
		return when(function() {
			return loadScript('http://www.google.com/jsapi?key=AIzaSyCTT934cGu2bDRbCUdx1bHS8PKT5tE34WM')
		})
		.then(function() {
			return loadScript('https://apis.google.com/js/client.js')
		})
		.then(loadGoogleDriveApi);
	}
	
	function login(immediate) {
		var deferred = when.defer();
		
		loadGoogleApi().then(function() {
			gapi.auth.authorize(
				{
					client_id: appId,
					scope: 'https://www.googleapis.com/auth/drive.file',
					immediate: immediate
				},
				onPossibleAuth
			);
		});
		
		return deferred.promise;
		
		function onPossibleAuth(result) {
			console.log('Receiving Google Drive login result');
			
			if ( result && !result.error ) {
				console.log('Google Drive login succeeded');
				
				var duration = Number(result.expires_in) * 1000;
				var expiration = new Date();
				expiration.setMilliseconds(expiration.getMilliseconds() + duration);
				deferred.resolve(expiration);
			} else {
				deferred.reject();
			}
		}
	}
	
	function makeRequest(request) {
		var deferred = when.defer();
		
		request.execute(function(response) {
			if ( response.error ) {
				deferred.reject(response.error);
			} else {
				deferred.resolve(response);
			}
		});
		
		return deferred.promise;
	}
	
	function downloadItem(item) {
		var deferred = when.defer();
		
		var request = new XMLHttpRequest();
		var token = gapi.auth.getToken().access_token;
		request.open('GET', item.downloadUrl);
		request.setRequestHeader('Authorization', 'Bearer ' + token);
		
		request.addEventListener('load', function() {
			deferred.resolve(request.responseText);
		});
		request.addEventListener('error', function(error) {
			deferred.reject(error);
		});
		
		request.send();
		
		return deferred.promise;
	}
	
	Ambience.GoogleDriveBackend = function() {};
	Ambience.GoogleDriveBackend.prototype = {
		name: 'Google Drive',
		imageLimit: 5,
		soundLimit: 1,
		loginAgainAdvance: 60 * 1000,
		login: function() {
			return login(false);
		},
		loginAgain: function() {
			return login(true);
		},
		downloadAdventures: function() {
			console.log('Requesting adventures from Google Drive');
			
			// The Google Drive API does not support the "or" operator, so for now we only search for application/json. (https://developers.google.com/drive/search-parameters)
			// TODO: This should be fixed in the future so that manually created files (with the wrong mime type) can also be used.
			var query = "trashed = false and mimeType = 'application/json'";
			var filesPerRequest = 100;
			var request = gapi.client.drive.files.list({
				q: query,
				maxResults: filesPerRequest
			});
			
			var deferred = when.defer();
			var filePromises = [];
			makeRequest(request).then(onResponse);
			
			return deferred.promise;
			
			function onResponse(response) {
				// It appears that not even an empty array is returned when there are zero items, so create one here.
				if ( !response.items ) {
					response.items = [];
				}
				
				console.log('Receiving metadata for ' + response.items.length + ' files');
				
				// We apparently cannot query for file extensions in the Google Drive API so we filter here instead.
				var matchingItems = response.items.filter(function(item) {
					return item.fileExtension === 'ambience'
				});
				
				filePromises = filePromises.concat(matchingItems.map(downloadItem));
				
				if ( response.items.length === filesPerRequest && response.nextPageToken ) {
					console.log('Requesting next page of files');
					
					var nextRequest = gapi.client.drive.files.list({
						q: query,
						maxResults: filesPerRequest,
						pageToken: response.nextPageToken
					});
					makeRequest(nextRequest).then(onResponse);
				} else {
					console.log('Done requesting file pages');
					
					when.all(filePromises).then(function(files) {
						console.log('Done downloading adventure files');
						deferred.resolve(files);
					});
				}
			}
		},
		// Media files, whose contents will not be used directly but rather through URLs.
		downloadMediaFile: function(id) {
			var request = gapi.client.drive.files.get({
				fileId: id
			});
			
			return makeRequest(request).then(function(item) {
				var deferred = when.defer();
				
				var request = new XMLHttpRequest();
				var token = gapi.auth.getToken().access_token;
				request.open('GET', item.downloadUrl);
				request.responseType = 'blob';
				request.setRequestHeader('Authorization', 'Bearer ' + token);
				
				request.addEventListener('error', deferred.reject);
				request.addEventListener('abort', deferred.reject);
				request.addEventListener('load', function() {
					var blob = request.response;
					var media = {
						id: id,
						url: window.URL.createObjectURL(blob),
						name: item.title,
						mimeType: item.mimeType
					};
					
					if ( item.thumbnailLink ) {
						media.thumbnail = item.thumbnailLink;
					}
					
					deferred.resolve(media);
				});
				
				request.send();
				
				return deferred.promise;
			});
		},
		uploadFile: function(file) {
			return when(null);
		},
		selectImageFile: function() {
			return when(null);
		},
		selectImageFileLabel: 'Select Image From Google Drive',
		selectSoundFiles: function() {
			return when(null)
		},
		selectSoundFilesLabel: 'Add Tracks From Google Drive'
	};
})();