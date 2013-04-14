// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.GoogleDriveLibrary = function() {
	var self = this;
	
	self.adventures = [];
	// This is updated in adventures.load and checked in adventures.save to only save adventures that have been modified.
	var latestJSON = {};
	
	self.adventures.load = function(onAllAdventuresLoaded) {
		console.log('Loading adventures from Google Drive');
		
		gapi.client.load('drive', 'v2', function() {
			self.drive.authorize(function() {
				requestAdventures(onAllAdventuresLoaded);
			});
		});
		
		function requestAdventures(onAllAdventuresLoaded) {
			console.log('Requesting adventures from Google Drive');
			
			// The Google Drive API does not support the "or" operator, so for now we only search for application/json. (https://developers.google.com/drive/search-parameters)
			// TODO: This should be fixed in the future so that manually created files (with the wrong mime type) can also be used.
			var query = "trashed = false and mimeType = 'application/json'";
			
			self.drive.downloadFiles(query, onAllFilesLoaded, function(item) {
				return item.fileExtension === 'ambience'
			});
			
			function onAllFilesLoaded(files) {
				files
				.map(function(file) {
					var config = JSON.parse(file.contents);
					var adventure = Ambience.App.Adventure.fromConfig(config);
					adventure.id = file.metadata.id;
					adventure.isEditable = file.metadata.editable;
					latestJSON[adventure.id] = file.contents;
					return adventure;
				})
				// Simply calling forEach on self.adventures.push gives this error: "Array.prototype.push called on null or undefined".
				.forEach(function(adventure) {
					self.adventures.push(adventure);
				});
				
				onAllAdventuresLoaded(self.adventures);
				
				// Only save Google Drive as a preference if adventures were successfully loaded.
				window.localStorage.library = self.name;
			}
		}
	};
	
	self.adventures.currentlyBeingSaved = 0;
	self.adventures.save = function() {
		if ( self.adventures.currentlyBeingSaved > 0 ) {
			console.log('Ignoring request to save adventures to Google Drive because saving is already in progress');
			return;
		}
		
		console.log('Saving adventures to Google Drive');
		
		self.adventures.map(function(adventure) {
			var config = adventure.toConfig();
			var json = angular.toJson(config);
			
			// Only downloaded adventures have isEditable, so explicitly check for false.
			if ( adventure.isEditable === false ) {
				var shouldBeSaved = false;
			} else if ( adventure.id ) {
				var shouldBeSaved = json !== latestJSON[adventure.id];
			} else {
				var shouldBeSaved = true;
			}
			
			if ( shouldBeSaved ) {
				console.log('Uploading adventure "' + adventure.title + '" to Google Drive');
				self.adventures.currentlyBeingSaved += 1;
				saveSingleAdventure(adventure, onSingleAdventureSaved, onError);
			} else {
				console.log('Not uploading adventure "' + adventure.title + '" to Google Drive because it is not editable or has not been modified');
			}
			
			function onSingleAdventureSaved(item) {
				console.log('Adventure "' + adventure.title + '" was saved to Google Drive');
				adventure.id = item.id;
				latestJSON[adventure.id] = json;
				self.adventures.currentlyBeingSaved -= 1;
			}
			
			function onError() {
				console.log('Adventure "' + adventure.title + '" was not saved to Google Drive');
				self.adventures.currentlyBeingSaved -= 1;
			}
		});
		
		adventuresToRemove.forEach(function(adventure) {
			removeSingleAdventure(adventure, onSingleAdventureRemoved);
			function onSingleAdventureRemoved() {
				console.log('Adventure "' + adventure.title + '" was removed from Google Drive');
			}
		});
		
		function saveSingleAdventure(adventure, onSaved, onError) {
			var file = fileFromAdventure(adventure);
			if ( adventure.id ) {
				self.drive.saveOldFile(file, adventure.id, onSaved, onError);
			} else {
				self.drive.saveNewFile(file, onSaved, onError);
			}
		}
		
		function fileFromAdventure(adventure) {
			var config = adventure.toConfig();
			var json = angular.toJson(config);
			var file = new Blob([json], { type: 'application/json' });
			file.name = adventure.title + '.ambience';
			
			return file;
		}
		
		function removeSingleAdventure(adventure, onRemoved) {
			// We can only remove the adventure from Google Drive it has been saved there to begin with.
			if ( !adventure.id ) {
				return;
			}
			
			self.drive.removeFile(adventure.id, onRemoved);
		}
	};
	
	var removeFromArray = self.adventures.remove;
	var adventuresToRemove = [];
	self.adventures.remove = function(adventure) {
		adventuresToRemove.push(adventure);
		removeFromArray.call(self.adventures, adventure);
	};
	
	self.adventures.download = function() {
		var adventureBlobs = self.adventures.map(function(adventure) {
			var config = adventure.toConfig();
			var json = angular.toJson(config);
			var blob = new Blob([json], { type: 'application/json' });
			return {
				adventure: adventure,
				blob: blob
			};
		});
		
		if ( navigator.msSaveBlob ) {
			adventureBlobs.forEach(function(adventureBlob) {
				var adventure = adventureBlob.adventure;
				var blob = adventureBlob.blob;
				var filename = adventure.title + '.ambience';
				navigator.msSaveBlob(blob, filename);
			});
		} else {
			var links = adventureBlobs.map(function(adventureBlob) {
				var adventure = adventureBlob.adventure;
				var blob = adventureBlob.blob;
				var url = window.URL.createObjectURL(blob);
				
				var link = document.createElement('a');
				link.download = adventure.title + '.ambience';
				link.href = url;
				link.target = '_blank';
				link.style.display = 'none';
				
				return link;
			});
			
			links.forEach(function(link) {
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			});
		}
	};
	
	self.drive = new Ambience.App.GoogleDriveLibrary.GoogleDrive();
	self.media = new Ambience.App.GoogleDriveLibrary.MediaLibrary();
	self.media.drive = self.drive;
};

Ambience.App.GoogleDriveLibrary.prototype.name = 'Google Drive';

Ambience.App.GoogleDriveLibrary.prototype.onExit = function() {
	var self = this;
	
	// At this point, adventures.save has just been called. If there was an error uploading any adventure, it will currently be uploading again and the message below will be displayed. This is the same as if one adventure is simply being saved because it has been modified, so there is no special case for errors.
	if ( self.adventures.currentlyBeingSaved > 0 ) {
		return (
			'Your adventures are currently being saved to Google Drive. If you exit now, you risk losing data.' + '\n\n' +
			'If this message persists, go to the "Options" tab and click "Save Google Drive Adventures to Your Computer", then manually upload them to Google Drive.'
		);
	}
};

Ambience.App.GoogleDriveLibrary.MediaLibrary = function() {
	var self = this;
	
	self.load = function(id, onMediaLoaded) {
		var media = {
			id: id,
			url: null,
			name: null,
			mimeType: null,
			thumbnail: null
		};
		
		var request = gapi.client.drive.files.get({
			fileId: id
		});
		self.drive.makeRequest(request, onItemLoaded);
		
		function onItemLoaded(item) {
			media.name = item.title;
			media.mimeType = item.mimeType;
			if ( item.thumbnailLink ) {
				media.thumbnail = item.thumbnailLink;
			}
			
			self.drive.queueBlobDownload(item, onBlobLoaded);
		}
		
		function onBlobLoaded(blob) {
			media.url = window.URL.createObjectURL(blob);
			onMediaLoaded(media);
		}
	};
};

Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectImage = function(onImageLoaded) {
	var self = this;
	
	console.log('Selecting image from Google Drive');
	
	google.load('picker', '1', { callback: function() {
		var views = {
			docs: new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES),
			upload: new google.picker.DocsUploadView()
		};
		views.docs.setIncludeFolders(true);
		
		var picker = new google.picker.PickerBuilder()
			.setAppId(self.drive.appID)
			.addView(views.docs)
			.addView(views.upload)
			.setCallback(onPickerAction)
			.build();
		picker.setVisible(true);
		
		function onPickerAction(data) {
			if ( data.action === google.picker.Action.PICKED ) {
				var mediaID = data.docs[0].id;
				self.load(mediaID, onImageLoaded);
			}
		}
	}});
};
Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectImage.label = "Select Image From Google Drive";

Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectTracks = function(onSingleTrackLoaded) {
	var self = this;
	
	console.log('Selecting tracks from Google Drive');
	
	google.load('picker', '1', { callback: function() {
		var views = {
			docs: new google.picker.View(google.picker.ViewId.DOCS),
			upload: new google.picker.DocsUploadView()
		};

		var mimeTypes = [
			'audio/mpeg',
			'audio/ogg',
			'audio/webm',
			'audio/wave',
			'audio/wav'
		];
		var picker = new google.picker.PickerBuilder()
			.setAppId(self.drive.appID)
			.addView(views.docs)
			.addView(views.upload)
			.setSelectableMimeTypes(mimeTypes.join(','))
			.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
			.setCallback(onPickerAction)
			.build();
		picker.setVisible(true);
		
		function onPickerAction(data) {
			if ( data.action === google.picker.Action.PICKED ) {
				data.docs.forEach(function(doc) {
					var mediaID = doc.id;
					self.load(mediaID, onSingleTrackLoaded);
				});
			}
		}
	}});
};
Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectTracks.label = "Add Tracks From Google Drive";

Ambience.App.GoogleDriveLibrary.GoogleDrive = function() {
	var self = this;
	
	self.appID = '907013371139.apps.googleusercontent.com';
	
	self.authorize = function(onAuth) {
		console.log('Authorizing to Google Drive');
		
		gapi.auth.authorize(
			{
				client_id: self.appID,
				scope: 'https://www.googleapis.com/auth/drive',
				immediate: false
			},
			onPossibleAuth
		);
		
		function onPossibleAuth(result) {
			console.log('Receiving authorization result');
			
			if ( result && !result.error ) {
				console.log('Authorization succeeded');
				onAuth();
			} else {
				console.log('Authorization failed; trying again');
				gapi.auth.authorize(
					{
						client_id: self.appID,
						scope: 'https://www.googleapis.com/auth/drive',
						immediate: false
					},
					onPossibleAuth
				);
			}
		}
	};
	
	self.makeRequest = function(request, onLoad, onError) {
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
	
	self.downloadItem = function(item, onLoad, onError) {
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
	self.queueBlobDownload = function(item, onBlobLoaded, onError) {
		queuedDownloads.push({
			item: item,
			onLoaded: onBlobLoaded,
			onError: onError
		});
		
		if ( downloadInProgress ) {
			console.log('Queuing download of file ' + item.id);
		} else {
			console.log('Downloading file ' + item.id + ' immediately because there is no download in progress');
			self.downloadBlob(item, onBlobLoaded, onError)
		}
	};
	
	self.downloadBlob = function(item, onBlobLoaded, onError) {
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
	self.downloadFiles = function(query, onAllFilesLoaded, itemFilter) {
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
	
	self.saveNewFile = function(file, onSaved, onError) {
		self.uploadFile(file, null, onSaved, onError);
	};
	
	self.saveOldFile = function(file, id, onSaved, onError) {
		self.uploadFile(file, id, onSaved, onError);
	};
	
	self.removeFile = function(id, onRemoved, onError) {
		var request = gapi.client.drive.files.trash({
			fileId: id
		});
		self.makeRequest(request, onRemoved, onError);
	};
	
	self.uploadFile = function(file, id, onFileUploaded, onError) {
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
};