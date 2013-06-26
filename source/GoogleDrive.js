// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

Ambience.App.GoogleDrive = function() {
};

(function() {
	var appID = '907013371139.apps.googleusercontent.com';
	
	var login = function(immediate) {
		var deferred = when.defer();
		
		gapi.auth.authorize(
			{
				client_id: appID,
				scope: 'https://www.googleapis.com/auth/drive',
				immediate: immediate
			},
			onPossibleAuth
		);
		
		return deferred.promise;
		
		function onPossibleAuth(result) {
			console.log('Receiving login result');
			
			if ( result && !result.error ) {
				console.log('Login succeeded');
				
				var duration = Number(result.expires_in) * 1000;
				var expiration = new Date();
				expiration.setMilliseconds(expiration.getMilliseconds() + duration);
				deferred.resolve(expiration);
			} else {
				deferred.reject();
			}
		}
	};
	
	var makeRequest = function(request, onLoad, onError) {
		onLoad = onLoad || function() {};
		onError = onError || function() {};
		
		var callback = function(response) {
			if ( response.error ) {
				onError();
			} else {
				onLoad(response);
			}
		};
		
		request.execute(callback);
	};
	
	var downloadItem = function(item, onLoad, onError) {
		onLoad = onLoad || function() {};
		onError = onError || function() {};
		
		var request = new XMLHttpRequest();
		var token = gapi.auth.getToken().access_token;
		request.open('GET', item.downloadUrl);
		request.setRequestHeader('Authorization', 'Bearer ' + token);
		request.send();
		
		request.addEventListener('load', function() {
			onLoad(request.responseText);
		});
		
		request.addEventListener('error', onError);
	};
	
	// Keeps track of downloads that will start.
	var queuedDownloads = [];
	// Keeps track of the download currently in progress, which is not in the queue.
	var downloadInProgress = false;
	var queueBlobDownload = function(item, onBlobLoaded, onError) {
		if ( downloadInProgress ) {
			console.log('Queuing download of file ' + item.id);
			queuedDownloads.push({
				item: item,
				onLoaded: onBlobLoaded,
				onError: onError
			});
		} else {
			console.log('Downloading file ' + item.id + ' immediately because there is no download in progress');
			self.downloadBlob(item, onBlobLoaded, onError)
		}
	};
	
	var downloadBlob = function(item, onBlobLoaded, onError) {
		downloadInProgress = true;
		
		onBlobLoaded = onBlobLoaded || function() {};
		onError = onError || function() {};
		
		var request = new XMLHttpRequest();
		var token = gapi.auth.getToken().access_token;
		request.open('GET', item.downloadUrl);
		request.responseType = 'blob';
		request.setRequestHeader('Authorization', 'Bearer ' + token);
		
		request.addEventListener('load', onRequestCompleted);
		request.addEventListener('error', onRequestNotCompleted);
		request.addEventListener('abort', onRequestNotCompleted);
		
		request.send();
		
		function onRequestCompleted() {
			onBlobLoaded(request.response);
			downloadInProgress = false;
			downloadNextBlob();
		}
		
		function onRequestNotCompleted() {
			console.log('Download of ' + item.id + ' was not completed');
			onError();
			downloadInProgress = false;
			downloadNextBlob();
		}
		
		function downloadNextBlob() {
			console.log('Download of file ' + item.id + ' has ended');
			
			// The most recently added item is downloaded.
			// This is intentional because it prioritizes downloading of media from the most recently selected adventure.
			var nextDownload = queuedDownloads.pop();
			if ( nextDownload ) {
				console.log('Downloading next file: ' + nextDownload.item.id);
				self.downloadBlob(nextDownload.item, nextDownload.onLoaded, nextDownload.onError);
			} else {
				console.log('No more files in download queue');
			}
		}
	}
	
	var filesPerRequest = 100;
	var downloadFiles = function(query, onAllFilesLoaded, itemFilter) {
		var request = gapi.client.drive.files.list({
			q: query,
			maxResults: filesPerRequest
		});
		
		var files = [];
		var filesToLoad = 0;
		var moreFilesMayExist = true;
		
		self.makeRequest(request, onItemsLoaded);
		
		function onItemsLoaded(response) {
			// It appears that not even an empty array is returned when there are zero items, so create one here.
			if ( !response.items ) {
				response.items = [];
			}
			
			console.log('Receiving metadata for ' + response.items.length + ' files');
			
			// We apparently cannot query for file extensions in the Google Drive API so we filter here instead.
			var matchingItems = response.items.filter(itemFilter);
			
			filesToLoad += matchingItems.length;
			matchingItems.forEach(function(item) {
				downloadSingleFile(item, onAllFilesLoaded);
			});
			
			if ( response.items.length === filesPerRequest && response.nextPageToken ) {
				console.log('Requesting next page of files');
				
				moreFilesMayExist = true;
				
				var nextRequest = gapi.client.drive.files.list({
					q: query,
					maxResults: filesPerRequest,
					pageToken: response.nextPageToken
				});
				self.makeRequest(nextRequest, onItemsLoaded);
			} else {
				console.log('Done requesting file pages');
				
				moreFilesMayExist = false;
				// If we reach this point after retrieving an empty list of items, we must call signalIfReady explicitly because there might not be any item download left to trigger it for us.
				signalIfReady();
			}
		}
		
		function downloadSingleFile(item) {
			var onSingleFileLoaded = function(contents) {
				console.log('Downloaded contents of file "' + item.title + '"');
				
				files.push({ contents: contents, metadata: item });
				filesToLoad -= 1;
				
				signalIfReady();
			};
			
			self.downloadItem(item, onSingleFileLoaded);
		}
		
		function signalIfReady() {
			if ( filesToLoad === 0 && !moreFilesMayExist ) {
				console.log('All files loaded from Google Drive');
				
				onAllFilesLoaded(files);
			}
		}
	};
	
	var saveNewFile = function(file, onSaved, onError) {
		self.uploadFile(file, null, onSaved, onError);
	};
	
	var saveOldFile = function(file, id, onSaved, onError) {
		self.uploadFile(file, id, onSaved, onError);
	};
	
	var removeFile = function(id, onRemoved, onError) {
		var request = gapi.client.drive.files.trash({
			fileId: id
		});
		self.makeRequest(request, onRemoved, onError);
	};
	
	var uploadFile = function(file, id, onFileUploaded, onError) {
		var boundary = '-------314159265358979323846';
		var delimiter = "\r\n--" + boundary + "\r\n";
		var close_delim = "\r\n--" + boundary + "--";
		
		if ( id ) {
			var path = '/upload/drive/v2/files/' + id;
			var method = 'PUT';
		} else {
			var path = '/upload/drive/v2/files';
			var method = 'POST';
		}
		
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function(e) {
			var dataURL = reader.result;
			var base64Data = dataURL.substring(dataURL.indexOf(',') + 1);
			var contentType = file.type || 'application/octet-stream';
			var metadata = {
				'title': file.name,
				'mimeType': contentType
			};
			
			var multipartRequestBody =
				delimiter +
				'Content-Type: application/json\r\n\r\n' +
				JSON.stringify(metadata) +
				delimiter +
				'Content-Type: ' + contentType + '\r\n' +
				'Content-Transfer-Encoding: base64\r\n' +
				'\r\n' +
				base64Data +
				close_delim;
			
			var request = gapi.client.request({
				'path': path,
				'method': method,
				'params': {'uploadType': 'multipart'},
				'headers': {
					'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
				},
				'body': multipartRequestBody
			});
			
			self.makeRequest(request, onFileUploaded, onError);
		};
	};
	
	Ambience.App.GoogleDrive.prototype = {
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
		listAdventures: function() {
			return when.parallel([
				function() {
					return when.delay(100, 'Adventure one');
				},
				function() {
					return when.delay(200, 'Adventure two');
				}
			]);
		},
		// Files with text contents (adventures in this case).
		downloadTextFile: function(id) {
			return when.delay(100, {
				id: id,
				contents: JSON.stringify({ id: id })
			});
		},
		// Media files, whose contents will not be used directly but rather through URLs.
		downloadMediaFile: function(id) {
			if ( id === 'error' ) {
				return when.reject(when.delay(100));
			} else {
				return when.delay(100, {
					id: id,
					url: id + '.jpg',
					name: id,
					mimeType: 'image/jpeg'
				});
			}
		},
		uploadFile: function(file) {
			return when.delay(100);
		},
		selectImage: function() {
			var deferred = when.defer();
			
			setTimeout(function() {
				deferred.notify(1);
			}, 100);
			
			setTimeout(function() {
				var media = {
					id: 'image',
					url: 'image.svg',
					name: 'image',
					mimeType: 'image/svg+xml'
				};
				deferred.resolve(media);
			}, 200);

			return deferred.promise;
		}
	};
})();