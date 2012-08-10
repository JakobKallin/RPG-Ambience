var Key = {
	name: function(code) {
		if ( code in this.names ) {
			return this.names[code];
		}
	},
	names: {
		8: 'Backspace',
		13: 'Enter',
		32: 'Space',
		112: 'F1',
		113: 'F2',
		114: 'F3',
		115: 'F4',
		116: 'F5',
		117: 'F6',
		118: 'F7',
		119: 'F8',
		120: 'F9',
		121: 'F10',
		122: 'F11',
		123: 'F12'
	}
};