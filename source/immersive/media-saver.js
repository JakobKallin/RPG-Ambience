self.onmessage = function(messageEvent) {
	var message = messageEvent.data;
	var id = message.id;
	var file = message.file;
	
	var reader = new FileReaderSync();
	var dataURL = reader.readAsDataURL(file);
	self.postMessage({
		id: id,
		dataURL: dataURL
	});
};