// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.GoogleDriveLibrary = function() {
	var self = this;
	
	self.adventures = [];
	self.adventures.load = function(onAllAdventuresLoaded) {
		console.log('Loading adventures from Google Drive');
		
		gapi.client.load('drive', 'v2', function() {
			self.drive.authorize(function() {
				requestAdventures(onAllAdventuresLoaded);
			});
		});
		
		function requestAdventures(onAllAdventuresLoaded) {
			console.log('Requesting adventures from Google Drive');
			
			var mimeTypes = ['application/json', 'application/octet-stream', 'text/plain'];
			var mimeTypeQuery = mimeTypes.map(function(mimeType) {
				return "mimeType = '" + mimeType + "'";
			}).join(' or ');
			var query = 'trashed = false and (' + mimeTypeQuery + ')';
			
			self.drive.downloadFiles(query, onAllFilesLoaded, function(item) {
				return item.fileExtension === 'ambience'
			});
			
			function onAllFilesLoaded(files) {
				files
				.map(function(file) {
					var config = JSON.parse(file.contents);
					var adventure = Ambience.App.Adventure.fromConfig(config);
					adventure.id = file.metadata.id;
					return adventure;
				})
				// Simply calling forEach on self.adventures.push gives this error: "Array.prototype.push called on null or undefined".
				.forEach(function(adventure) {
					self.adventures.push(adventure);
				});
				
				onAllAdventuresLoaded(self.adventures);
			}
		}
	};
	
	self.adventures.save = function() {
		console.log('Saving adventures to Google Drive');
		
		this.forEach(function(adventure) {
			saveSingleAdventure(adventure, onSingleAdventureSaved);
			function onSingleAdventureSaved(item) {
				console.log('Adventure "' + adventure.title + '" was saved to Google Drive');
				adventure.id = item.id;
			}
		});
		
		adventuresToRemove.forEach(function(adventure) {
			removeSingleAdventure(adventure, onSingleAdventureRemoved);
			function onSingleAdventureRemoved() {
				console.log('Adventure "' + adventure.title + '" was removed from Google Drive');
			}
		});
		
		function saveSingleAdventure(adventure, onSaved) {
			var onError = function() {
				console.log('Adventure "' + adventure.title + '" was not saved to Google Drive');
			};
			
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
	
	self.drive = new Ambience.App.GoogleDriveLibrary.GoogleDrive();
	self.media = new Ambience.App.GoogleDriveLibrary.MediaLibrary();
	self.media.drive = self.drive;
};

Ambience.App.GoogleDriveLibrary.prototype.onExit = function() {
	return 'Google Drive library received the exit signal';
};

Ambience.App.GoogleDriveLibrary.MediaLibrary = function() {
	var self = this;
	
	self.loadAdventure = function(adventure, onMediaLoad) {
		console.log('Loading media for adventure ' + adventure.title + ' from Google Drive');
	};
	
	self.loadScene = function(scene, onMediaLoad) {
		console.log('Loading media for scene ' + scene.name + ' from Google Drive');
	};
	
	
	
	var adventuresToLoad = [];
	var loadedAdventures = [];
	self.loadAdventure = function(adventure, onSingleMediaLoaded) {
		if ( loadedAdventures.contains(adventure) ) {
			console.log(
				'Not loading media for adventure "' +
				adventure.title +
				'"; it has already been loaded'
			);
			return;
		}
		
		console.log('Loading media for adventure "' + adventure.title + '"');
		adventure.scenes.forEach(function(scene) {
			self.loadScene(scene, onSingleMediaLoaded);
		});
		loadedAdventures.push(adventure);
	};
	
	self.loadScene = function(scene, onSingleMediaLoaded) {
		scene.media.forEach(function(media) {
			self.loadMedia(media.id, function(loadedMedia) {
				media.url = loadedMedia.url;
				media.thumbnail = loadedMedia.thumbnail;
				onSingleMediaLoaded(media);
			});
		});
	};
	
	self.loadMedia = function(id, onMediaLoaded) {
		console.log('Loading media ' + id + ' from Google Drive');
		
		var media = {
			id: id,
			url: null,
			name: null,
			mimeType: null
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
			
			self.drive.downloadBlob(item, onBlobLoaded);
		}
		
		function onBlobLoaded(blob) {
			media.url = window.URL.createObjectURL(blob);
			onMediaLoaded(media);
		}
	};
	
	self.saveMedia = function(id, file, onSave) {
		console.log('Saving media ' + id + ' to Google Drive');
	};
};

Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectImage = function(onImageLoaded) {
	var self = this;
	
	console.log('Selecting image from Google Drive');
	
	google.load('picker', '1', { callback: function() {
		var views = {
			docs: new google.picker.View(google.picker.ViewId.DOCS_IMAGES),
			recent: new google.picker.View(google.picker.ViewId.RECENTLY_PICKED)
		};
		var picker = new google.picker.PickerBuilder()
			.setAppId(self.drive.appID)
			.addView(views.docs)
			.addView(views.recent)
			.setCallback(onPickerAction)
			.build();
		picker.setVisible(true);
		
		function onPickerAction(data) {
			if ( data.action === google.picker.Action.PICKED ) {
				var fileID = data.docs[0].id;
				self.loadMedia(fileID, onImageLoaded);
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
			recent: new google.picker.View(google.picker.ViewId.RECENTLY_PICKED)
		};
		var picker = new google.picker.PickerBuilder()
			.setAppId(self.drive.appID)
			.addView(views.docs)
			.addView(views.recent)
			.setSelectableMimeTypes('audio/mpeg,audio/ogg,audio/webm')
			.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
			.setCallback(onPickerAction)
			.build();
		picker.setVisible(true);
		
		function onPickerAction(data) {
			if ( data.action === google.picker.Action.PICKED ) {
				data.docs.forEach(function(doc) {
					self.loadMedia(doc.id, onSingleTrackLoaded);
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
	
	var latestContents = {};
	self.downloadItem = function(item, onLoad, onError) {
		onLoad = onLoad || function() {};
		onError = onError || function() {};
		
		var request = new XMLHttpRequest();
		var token = gapi.auth.getToken().access_token;
		request.open('GET', item.downloadUrl);
		request.setRequestHeader('Authorization', 'Bearer ' + token);
		request.send();
		
		request.addEventListener('load', function() {
			latestContents[item.id] = request.responseText;
			onLoad(request.responseText);
		});
		
		request.addEventListener('error', onError);
	};
	
	self.downloadBlob = function(item, onBlobLoaded, onError) {
		onBlobLoaded = onBlobLoaded || function() {};
		onError = onError || function() {};
		
		var request = new XMLHttpRequest();
		var token = gapi.auth.getToken().access_token;
		request.open('GET', item.downloadUrl);
		request.responseType = 'blob';
		request.setRequestHeader('Authorization', 'Bearer ' + token);
		request.send();
		
		request.addEventListener('load', function() {
			onBlobLoaded(request.response);
		});
		
		request.addEventListener('error', onError);
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
				downloadFile(item, onAllFilesLoaded);
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
		
		function downloadFile(item) {
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
	
	self.downloadSingleFile = function(url, onLoad, onError) {
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
		reader.readAsBinaryString(file);
		reader.onload = function(e) {
			var contents = reader.result;
			
			// Only upload file if modified.
			if ( id && contents === latestContents[id] ) {
				console.log('Not uploading file "' + file.name + '" because it has not been modified');
				return;
			}
			
			var contentType = file.type || 'application/octet-stream';
			var metadata = {
				'title': file.name,
				'mimeType': contentType
			};
			
			var base64Data = btoa(contents);
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
			
			self.makeRequest(request, onRequestCompleted, onError);
			
			function onRequestCompleted(item) {
				latestContents[item.id] = contents;
				onFileUploaded(item);
			}
		};
	};
};