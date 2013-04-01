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
				self.adventures.request(onAllAdventuresLoaded);
			});
		});
	};
	
	self.adventures.request = function(onAllAdventuresLoaded) {
		console.log('Requesting adventures from Google Drive');
		
		var mimeTypes = [
			'application/json',
			'application/octet-stream',
			'text/plain'
		];
		var mimeTypeQuery = mimeTypes.map(function(mimeType) {
			return "mimeType = '" + mimeType + "'";
		}).join(' or ');
		
		var query = 'trashed = false and (' + mimeTypeQuery + ')';
		var itemsPerRequest = 100;
		var request = gapi.client.drive.files.list({
			q: query,
			maxResults: itemsPerRequest
		});
		
		var adventuresToLoad = 0;
		var moreAdventuresMayExist = true;
		
		self.drive.makeRequest(request, onItemsLoaded);
		
		function onItemsLoaded(response) {
			// It appears that not even an empty array is returned when there are zero items, so create one here.
			if ( !response.items ) {
				response.items = [];
			}
			
			console.log('Receiving metadata for ' + response.items.length + ' adventures');
			
			// We apparently cannot query for file extensions in the Google Drive API so we filter here instead.
			var adventureItems = response.items.filter(function(item) {
				return item.fileExtension === 'ambience'
			});
			
			adventuresToLoad += adventureItems.length;
			adventureItems.forEach(function(item) {
				downloadAdventure(item, onAllAdventuresLoaded);
			});
			
			if ( response.items.length === itemsPerRequest && response.nextPageToken ) {
				console.log('Requesting next page of adventures');
				
				moreAdventuresMayExist = true;
				
				var nextRequest = gapi.client.drive.files.list({
					q: query,
					maxResults: itemsPerRequest,
					pageToken: response.nextPageToken
				});
				self.drive.makeRequest(nextRequest, onItemsLoaded);
			} else {
				console.log('Done requesting adventure pages');
				
				moreAdventuresMayExist = false;
				// If we reach this point after retrieving an empty list of items, we must call signalIfReady explicitly because there might not be any item download left to trigger it for us.
				signalIfReady();
			}
		}
		
		function downloadAdventure(item) {
			var onSingleAdventureLoaded = function(request) {
				console.log('Downloaded JSON for adventure file "' + item.title + '"');
				
				adventuresToLoad -= 1;
				
				var config = JSON.parse(request.responseText);
				var adventure = Ambience.App.Adventure.fromConfig(config);
				self.adventures.push(adventure);
				
				signalIfReady();
			};
			
			self.drive.downloadItem(item, onSingleAdventureLoaded);
		}
		
		function signalIfReady() {
			if ( adventuresToLoad === 0 && !moreAdventuresMayExist ) {
				console.log('All adventures loaded from Google Drive; sorting by date');
				
				self.adventures.sort(function(a, b) {
					return a.creationDate - b.creationDate;
				});
				onAllAdventuresLoaded(self.adventures);
			}
		}
	};
	
	self.drive = new Ambience.App.GoogleDriveLibrary.GoogleDrive();
	self.media = new Ambience.App.GoogleDriveLibrary.MediaLibrary();
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
	
	self.loadMedia = function(id, onSuccess) {
		console.log('Loading media ' + id + ' from Google Drive');
	};
	
	self.saveMedia = function(id, file, onSave) {
		console.log('Saving media ' + id + ' to Google Drive');
	};
};

Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectImage = function(onLoad) {
	console.log('Selecting image from Google Drive');
};

Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectTracks = function(onLoad) {
	console.log('Selecting tracks from Google Drive');
};

Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectFiles = function(onLoad, multiple, mimeType) {
};

Ambience.App.GoogleDriveLibrary.GoogleDrive = function() {
	var self = this;
	
	self.appID = '907013371139.apps.googleusercontent.com';
	
	self.authorize = function(onAuth) {
		console.log('Authorizing to Google Drive');
		
		gapi.auth.authorize(
			{
				client_id: self.appID,
				scope: 'https://www.googleapis.com/auth/drive',
				immediate: true
			},
			onPossibleAuth
		);
		
		function onPossibleAuth(result) {
			if ( result && !result.error ) {
				onAuth();
			} else {
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
		
		self.downloadFile(item.downloadUrl, onLoad, onError);
	};
	
	self.downloadFile = function(url, onLoad, onError) {
		onLoad = onLoad || function() {};
		onError = onError || function() {};
		
		var request = new XMLHttpRequest();
		var token = gapi.auth.getToken().access_token;
		request.open('GET', url);
		request.setRequestHeader('Authorization', 'Bearer ' + token);
		request.send();
		
		request.addEventListener('load', function() {
			onLoad(request);
		});
		
		request.addEventListener('error', onError);
	};
	
	self.uploadFile = function(file, path, method, onLoad, onError) {
		const boundary = '-------314159265358979323846';
		const delimiter = "\r\n--" + boundary + "\r\n";
		const close_delim = "\r\n--" + boundary + "--";
		
		var reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onload = function(e) {
			var contentType = file.type || 'application/octet-stream';
			var metadata = {
				'title': file.name,
				'mimeType': contentType
			};
			
			var base64Data = btoa(reader.result);
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
			
			self.makeRequest(request, onLoad, onError);
		}
	};
};