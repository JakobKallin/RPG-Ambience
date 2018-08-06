var objectURLFromDataURL = function(dataURL) {
	var base64 = dataURL.substring(dataURL.indexOf(',') + 1);
	var byteString = atob(base64);
	var mimeType = dataURL.substring(dataURL.indexOf(':') + 1, dataURL.indexOf(';'));
	
	var buffer = new ArrayBuffer(byteString.length);
	var integers = new Uint8Array(buffer);
	for ( var i = 0; i < byteString.length; ++i ) {
		integers[i] = byteString.charCodeAt(i);
	}
	var blob = new Blob([integers], { type: mimeType });
	
	return window.URL.createObjectURL(blob);
};