var AdventureWriter = function(app) {
	var self = this;
	
	self.write = function(adventure) {
		var blob = createBlob(adventure);
		download(blob);
	};
	
	var createBlob = function(adventure) {
		var state = {
			scenes: adventure.scenes.map(function(scene) {
				return scene.copyState();
			})
		};
		var json = JSON.stringify(state);
		var blob = new Blob([json], { type: 'application/json' });
		
		return blob;
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