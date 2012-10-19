var AdventureWriter = function(app) {
	var self = this;
	
	self.write = function(adventure) {
		var state = {
			scenes: adventure.scenes.map(function(scene) {
				return scene.copyState();
			})
		};
		
		embedMedia(state);
	};
	
	var embedMedia = function(state) {
		var mediaLeft = 0;
		
		state.scenes.forEach(function(scene) {
			if ( scene.image.path.length > 0 ) {
				mediaLeft += 1;
				var request = new XMLHttpRequest();
				request.open('GET', scene.image.path);
				request.responseType = 'blob';
				request.send();
				request.onload = function(requestEvent) {
					var blob = request.response;
					var reader = new FileReader();
					reader.readAsDataURL(blob);
					reader.onload = function(readEvent) {
						var url = reader.result;
						scene.image.path = url;
						mediaLeft -= 1;
						if ( mediaLeft === 0 ) {
							createBlob(state);
						}
					};
				};
			}
			
			scene.sound.tracks.forEach(function(track) {
				mediaLeft += 1;
				var request = new XMLHttpRequest();
				request.open('GET', track.path);
				request.responseType = 'blob';
				request.send();
				request.onload = function(requestEvent) {
					var blob = request.response;
					var reader = new FileReader();
					reader.readAsDataURL(blob);
					reader.onload = function(readEvent) {
						var url = reader.result;
						track.path = url;
						mediaLeft -= 1;
						if ( mediaLeft === 0 ) {
							createBlob(state);
						}
					};
				};
			});
		});
		
		// This happens when there is no media at all.
		if ( mediaLeft === 0 ) {
			createBlob(state);
		}
	};
	
	var createBlob = function(state) {
		var json = JSON.stringify(state);
		var blob = new Blob([json], { type: 'application/json' });
		download(blob);
	};
	
	var download = function(blob) {
		var url = window.URL.createObjectURL(blob);
		
		var link = document.createElement('a');
		link.href = url;
		link.target = '_blank';
		link.download = 'adventure.json';
		link.style.display = 'none';
		
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};
};