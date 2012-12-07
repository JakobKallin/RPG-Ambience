var Adventure = function() {
	var self = this;
	
	self.title = '';
	self.scenes = [];
	
	// Adventure version, unrelated to application version.
	// Should be increased whenever the format of an adventure changes.
	self.version = 1;
	
	Object.defineProperty(self, 'media', {
		get: function() {
			return self.scenes.map(get('media')).flatten();
		}
	});
};