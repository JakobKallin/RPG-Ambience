// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.GoogleDriveLibrary = function() {
	var self = this;
	
	self.adventures = [];
	self.adventures.load = function(onLoad) {
		console.log('Loading adventures from Google Drive.');
	};
	
	self.googleDrive = new Ambience.App.GoogleDriveLibrary.GoogleDrive();
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