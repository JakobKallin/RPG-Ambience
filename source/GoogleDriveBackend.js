// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

Ambience.GoogleDriveBackend = function() {};
Ambience.GoogleDriveBackend.prototype = {
	appId: '907013371139',
	get clientId() {
		return this.appId + '.apps.googleusercontent.com';
	},
	name: 'Google Drive',
	imageLimit: 6,
	soundLimit: 3,
	loginAgainAdvance: 60 * 1000,
	login: function() {
		return this.loginImmediate(false);
	},
	loginAgain: function() {
		return this.loginImmediate(true);
	},
	loginImmediate: function(immediate) {
		var backend = this;
		var deferred = when.defer();
		
		this.loadGoogleApi().then(function() {
			gapi.auth.authorize(
				{
					client_id: backend.clientId,
					// This should be drive.file, as discussed in https://github.com/JakobKallin/RPG-Ambience/issues/47.
					scope: 'https://www.googleapis.com/auth/drive',
					immediate: immediate
				},
				onPossibleAuth
			);
		}).otherwise(deferred.reject);
		
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
	},
	loadScript: function(url) {
		var deferred = when.defer();
		
		var element = document.createElement('script');
		element.addEventListener('load', function() {
			deferred.resolve();
		});
		element.addEventListener('error', function(event) {
			deferred.reject(event);
		});
		element.async = true;
		element.src = url;
		document.head.appendChild(element);
		
		return deferred.promise;
	},
	loadGoogleDriveApi: function() {
		console.log('Loading Google Drive API');
		var deferred = when.defer();
		
		gapi.client.load('drive', 'v2', function() {
			deferred.resolve();
		});
			
		return deferred.promise;
	},
	loadGooglePickerApi: function() {
		console.log('Loading Google Picker API');
		var deferred = when.defer();
		
		google.load('picker', '1', { callback: function() {
			deferred.resolve();
		}});
		
		return deferred.promise;
	},
	loadGoogleApi: function() {
		var backend = this;
		
		return when.all([
			this.loadScript('http://www.google.com/jsapi?key=AIzaSyCTT934cGu2bDRbCUdx1bHS8PKT5tE34WM'),
			this.loadScript('https://apis.google.com/js/client.js').then(function() {
				var deferred = when.defer();
				gapi.load('client', { callback: function() {
					deferred.resolve();
				}});
				return deferred.promise;
			})
		])
		.then(function() {
			return when.parallel([
				backend.loadGoogleDriveApi,
				backend.loadGooglePickerApi
			]);
		});
	},
	makeRequest: function(request) {
		var deferred = when.defer();
		
		request.execute(function(response) {
			if ( response.error ) {
				deferred.reject(response.error);
			} else {
				deferred.resolve(response);
			}
		});
		
		return deferred.promise;
	},
	downloadItem: function(item) {
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
	},
	downloadAdventures: function() {
		console.log('Requesting adventures from Google Drive');
		var backend = this;
		
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
		this.makeRequest(request).then(onResponse).otherwise(deferred.reject);
		
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
			
			filePromises = filePromises.concat(matchingItems.map(backend.downloadItem));
			
			if ( response.items.length === filesPerRequest && response.nextPageToken ) {
				console.log('Requesting next page of files');
				
				var nextRequest = gapi.client.drive.files.list({
					q: query,
					maxResults: filesPerRequest,
					pageToken: response.nextPageToken
				});
				backend.makeRequest(nextRequest).then(onResponse).otherwise(deferred.reject);
			} else {
				console.log('Done requesting file pages');
				
				when.all(filePromises).then(function(files) {
					console.log('Done downloading adventure files');
					deferred.resolve(files);
				})
				.otherwise(deferred.reject);
			}
		}
	},
	// Media files, whose contents will not be used directly but rather through URLs.
	downloadMediaFile: function(file) {
		var request = gapi.client.drive.files.get({
			fileId: file.id
		});
		
		return this.makeRequest(request).then(function(item) {
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
				file.url = window.URL.createObjectURL(blob);
				file.name = item.title;
				file.mimeType = item.mimeType;
				
				if ( item.thumbnailLink ) {
					file.previewUrl = item.thumbnailLink;
				}
				
				// Make sure that progress can be assumed to be 1.0 on completion.
				deferred.notify(1.0);
				deferred.resolve(file);
			});
			request.addEventListener('progress', function(event) {
				if ( event.lengthComputable ) {
					var percentage = event.loaded / event.total;
					deferred.notify(percentage);
				}
			});
			
			request.send();
			
			return deferred.promise;
		});
	},
	uploadFile: function(file) {
		return when(null);
	},
	selectImageFile: function() {
		console.log('Selecting image file from Google Drive');
		var deferred = when.defer();
		
		var views = {
			docs: new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES),
			upload: new google.picker.DocsUploadView()
		};
		views.docs.setIncludeFolders(true);
		
		var picker = new google.picker.PickerBuilder()
			.setAppId(this.appId)
			.addView(views.docs)
			.addView(views.upload)
			.setCallback(onPickerAction)
			.build();
		picker.setVisible(true);
		
		return deferred.promise;
		
		function onPickerAction(data) {
			if ( data.action === google.picker.Action.PICKED ) {
				var metadata = data.docs[0];
				var file = new Ambience.MediaFile();
				file.id = metadata.id;
				file.name = metadata.name;
				file.mimeType = metadata.mimeType;
				
				deferred.resolve(file);
			}
			// TODO: Should reject if cancelled.
		}
	},
	selectImageFileLabel: 'Select Image From Google Drive',
	selectSoundFiles: function() {
		console.log('Selecting sound files from Google Drive');
		var deferred = when.defer();
		
		var views = {
			docs: new google.picker.DocsView(google.picker.ViewId.DOCS),
			upload: new google.picker.DocsUploadView()
		};
		
		var mimeTypes = [
			'audio/mpeg',
			'audio/ogg',
			'audio/webm',
			'audio/wave',
			'audio/wav',
			'audio/x-wav'
		];
		var picker = new google.picker.PickerBuilder()
			.setAppId(this.appId)
			.addView(views.docs)
			.addView(views.upload)
			.setSelectableMimeTypes(mimeTypes.join(','))
			.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
			.setCallback(onPickerAction)
			.build();
		picker.setVisible(true);
		
		return deferred.promise;
		
		function onPickerAction(data) {
			if ( data.action === google.picker.Action.PICKED ) {
				var files = data.docs.map(function(metadata) {
					var file = new Ambience.MediaFile();
					file.id = metadata.id;
					file.name = metadata.name;
					file.mimeType = metadata.mimeType;
					
					return file;
				});
				deferred.resolve(files);
			}
		}
	},
	selectSoundFilesLabel: 'Add Tracks From Google Drive'
};

Ambience.HttpRequest = function() {
	var request = Object.create(new XMLHttpRequest());
	var deferred = when.defer();
	
	request.addEventListener('load', deferred.resolve);
	request.addEventListener('error', deferred.reject);
	request.addEventListener('abort', deferred.reject);
	request.addEventListener('progress', deferred.notify);
	
	request.send = function() {
		return deferred.promise;
	};
	
	return request;
};