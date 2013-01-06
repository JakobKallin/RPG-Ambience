describe('Knockwrap', function() {
	var container;

	beforeEach(function() {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function() {
		document.body.removeChild(container);
	});
	
	it('notifies changes to simple properties', function() {
		var target = {
			name: 'James'
		};
		knockwrap.wrapProperty(target, 'name');
		target.name = 'John';
		expect(target.name).toBe('John');
	});
	
	it('notifies changes to computed properties', function() {
		var latestValue;
		var viewModel = {
			first: 'James',
			last: 'Smith',
			get full() {
				return latestValue = this.first + ' ' + this.last;
			}
		};
		knockwrap.wrapObject(viewModel);
		
		viewModel.first = 'Robert';
		expect(latestValue).toBe('Robert Smith');
	});
	
	it('notifies changes to objects inside objects', function() {
		var latestValue;
		var person = {
			name: { first: 'James', last: 'Smith' },
			get fullName() {
				return latestValue = this.name.first + ' ' + this.name.last;
			}
		};
		knockwrap.wrapObject(person);
		
		person.name.first = 'Robert';
		expect(latestValue).toBe('Robert Smith');
	});
	
	it('only wraps values if they are objects', function() {
		// These calls should throw exceptions.
		knockwrap.wrapObject("James");
		knockwrap.wrapObject(0);
	});
	
	it('notifies changes to reassigned object properties', function() {
		var latestValue;
		
		var person = {
			name: { first: 'James', last: 'Smith' },
			get fullName() {
				return latestValue = this.name.first + ' ' + this.name.last;
			}
		};
		knockwrap.wrapObject(person);
		
		person.name = { first: 'Robert', last: 'Johnson' };
		expect(latestValue).toBe('Robert Johnson');
	});
	
	it('notifies changes to initially undefined object properties', function() {
		var latestValue;
		
		var viewModel = {
			person: undefined
		};
		knockwrap.wrapObject(viewModel);
		
		viewModel.person = {
			name: 'James',
			get title() {
				console.log(this);
				return latestValue = 'Mr. ' + this.name;
			}
		};
		expect(latestValue).toBe('Mr. James');
	});
});

describe('Knockwrap array wrapping', function() {
	it('notifies changes to objects in arrays', function() {
		var latestValue;
		var viewModel = {
			array: [ { name: 'James' } ],
			get firstTitle() {
				return latestValue = 'Mr. ' + this.array[0].name;
			}
		};
		knockwrap.wrapObject(viewModel);
		
		viewModel.array[0].name = 'Robert';
		expect(latestValue).toBe('Mr. Robert');
	});
	
	it('exposes objects added to arrays', function() {
		var latestValue;
		var viewModel = {
			array: []
		};
		knockwrap.wrapObject(viewModel);
		
		viewModel.array.push({ name: 'James' })
		expect(viewModel.array[0].name).toBe('James');
	});
	
	// This is to make sure that array indexes are wrapped only when they are outside the array's old range.
	it('exposes multiple objects added to arrays', function() {
		var latestValue;
		var viewModel = {
			array: []
		};
		knockwrap.wrapObject(viewModel);
		
		viewModel.array.push({ name: 'James' })
		viewModel.array.push({ name: 'Robert' })
		expect(viewModel.array[1].name).toBe('Robert');
	});
	
	it('exposes length property of array', function() {
		var viewModel = {
			array: []
		};
		knockwrap.wrapObject(viewModel);
		
		expect(viewModel.array.length).toBe(0);
	});
	
	it('updates length property of array', function() {
		var latestValue;
		var viewModel = {
			array: [],
			get count() {
				return latestValue = this.array.length;
			}
		};
		knockwrap.wrapObject(viewModel);
		
		viewModel.array.push({ name: 'James' });
		expect(viewModel.array.length).toBe(1);
	});
	
	it('removes objects removed by the splice method', function() {
		var viewModel = {
			array: [{ name: 'James' }]
		};
		knockwrap.wrapObject(viewModel);
		
		viewModel.array.splice(0);
		expect(viewModel.array.length).toBe(0);
	});
	
	it('notifies changes to objects added by the splice method', function() {
		var viewModel = {
			array: []
		};
		knockwrap.wrapObject(viewModel);
		
		var latestValue;
		viewModel.array.splice(0, 0, {
			name: 'James',
			get title() {
				return latestValue = 'Mr. ' + this.name;
			}
		});
		viewModel.array[0].name = 'Robert';
		expect(latestValue).toBe('Mr. Robert');
	});
	
	it('notifies changes to objects added after others have been removed', function() {
		var viewModel = {
			array: [{ name: 'James' }]
		};
		knockwrap.wrapObject(viewModel);
		
		var latestValue;
		viewModel.array.splice(0, 1);
		viewModel.array.splice(0, 0, {
			name: 'Robert',
			get title() {
				return latestValue = 'Mr. ' + this.name;
			}
		});
		viewModel.array[0].name = 'Michael';
		expect(latestValue).toBe('Mr. Michael');
	});
	
	it('notifies changes to objects added after others have been removed, using different methods', function() {
		var viewModel = {
			array: []
		};
		knockwrap.wrapObject(viewModel);
		
		var latestValue;
		viewModel.array.push({ name: 'James' });
		viewModel.array.splice(0, 1);
		viewModel.array.splice(0, 0, {
			name: 'Robert',
			get title() {
				return latestValue = 'Mr. ' + this.name;
			}
		});
		viewModel.array[0].name = 'Michael';
		expect(latestValue).toBe('Mr. Michael');
	});
	
	it('supports non-mutating array methods', function() {
		var viewModel = {
			array: [
				{ name: 'James' },
				{ name: 'Robert' }
			]
		};
		knockwrap.wrapObject(viewModel);
		
		var secondName = viewModel.array.slice(1)[0].name;
		expect(secondName).toBe('Robert');
	});
});

describe('Knockwrap observable copying', function() {
	it('deeply copies simple properties', function() {
		var person = { name: 'James' };
		knockwrap.wrapObject(person);
		
		var other = person.copy();
		other.name = 'Robert';
		
		expect(person.name).toBe('James');
		expect(other.name).toBe('Robert');
	});
	
	it('deeply copies getters', function() {
		var james = {
			first: 'James',
			last: 'Smith',
			get full() {
				return this.first + ' ' + this.last;
			}
		};
		knockwrap.wrapObject(james);
		
		var robert = james.copy();
		robert.first = 'Robert';
		
		expect(james.full).toBe('James Smith');
		expect(robert.full).toBe('Robert Smith');
	});
	
	it('deeply copies arrays', function() {
		var james = {
			nicknames: ['Jim']
		};
		knockwrap.wrapObject(james);
		
		var jimmy = james.copy();
		jimmy.nicknames.push('Jimmy');
		
		expect(james.nicknames.length).toBe(1);
		expect(jimmy.nicknames.length).toBe(2);
	});
	
	it('deeply copies objects in arrays', function() {
		var james = {
			foods: [ {type: 'tomato', color: 'red'} ]
		};
		knockwrap.wrapObject(james);
		
		var robert = james.copy();
		robert.foods[0].color = 'green';
		
		expect(james.foods[0].color).toBe('red');
		expect(robert.foods[0].color).toBe('green');
	});
	
	it('deeply copies objects inside objects', function() {
		var james = {
			food: { type: 'tomato', color: 'red' }
		};
		knockwrap.wrapObject(james);
		
		var robert = james.copy();
		robert.food.color = 'green';
		
		expect(james.food.color).toBe('red');
		expect(robert.food.color).toBe('green');
	});
});

describe('Knockwrap "this" reassignment', function() {
	it('retains "this" keyword in wrapped functions', function() {
		var james = {
			name: 'James',
			changeName: function() {
				this.name = 'Robert';
			}
		};
		knockwrap.wrapObject(james);
		
		var michael = { name: 'Michael' };
		james.changeName.apply(michael);
		
		expect(james.name).toBe('Robert');
		expect(michael.name).toBe('Michael');
	});
	
	it('retains "this" keyword in copied functions', function() {
		var james = {
			name: 'James',
			changeName: function() {
				this.name = 'Robert';
			}
		};
		knockwrap.wrapObject(james);
		var james2 = james.copy();
		
		var michael = { name: 'Michael' };
		james2.changeName.apply(michael);
		
		expect(james.name).toBe('James');
		expect(james2.name).toBe('Robert');
		expect(michael.name).toBe('Michael');
	});
	
	it('retains "this" keyword in copied nested functions', function() {
		var james = {
			name: {
				first: 'James',
				change: function() {
					this.first = 'Robert';
				}
			}
		};
		knockwrap.wrapObject(james);
		var james2 = james.copy();
		
		var michael = { first: 'Michael' };
		james2.name.change.apply(michael);
		
		expect(james.name.first).toBe('James');
		expect(james2.name.first).toBe('Robert');
		expect(michael.first).toBe('Michael');
	});
	
	// The reason for this test is that objects might become incorrectly wrapped twice.
	it('retains "this" keyword in functions inside objects copied twice', function() {
		var james = {
			name: {
				first: 'James',
				change: function() {
					this.first = 'Robert';
				}
			}
		};
		knockwrap.wrapObject(james);
		var james2 = james.copy();
		var james3 = james2.copy();
		
		var michael = { first: 'Michael' };
		james3.name.change.apply(michael);
		
		expect(james.name.first).toBe('James');
		expect(james2.name.first).toBe('James');
		expect(james3.name.first).toBe('Robert');
		expect(michael.first).toBe('Michael');
	});
});

describe('Knockwrap state copying', function() {
	it('copies simple values', function() {
		var james = {
			name: 'James'
		};
		knockwrap.wrap(james);
		var copy = james.copyState();
		
		expect(copy.name).toBe('James');
	});
	
	it('copies simple unwrapped values', function() {
		var james = {};
		knockwrap.wrap(james);
		james.name = 'James';
		var copy = james.copyState();
		
		expect(copy.name).toBe('James');
	});
	
	it('copies arrays', function() {
		var james = {
				nicknames: ['Jim', 'Jimmy']
		};
		knockwrap.wrap(james);
		var copy = james.copyState();
		
		expect(copy.nicknames).toEqual(['Jim', 'Jimmy']);
	});
	
	it('copies objects inside objects', function() {
		var james = {
				name: {
					first: 'James',
					last: 'Smith'
				}
		};
		knockwrap.wrap(james);
		var copy = james.copyState();
		
		expect(copy.name).toEqual({ first: 'James', last: 'Smith' });
	});
	
	it('copies objects inside arrays', function() {
		var james = {
			nicknames: [
				{ name: 'Jim' },
				{ name: 'Jimmy' }
			]
		};
		knockwrap.wrap(james);
		var copy = james.copyState();
		
		expect(copy.nicknames).toEqual([{ name: 'Jim' }, { name: 'Jimmy' }]);
	});
	
	it('does not copy getters', function() {
		var james = {
				get name() {
					return 'James';
				}
		};
		knockwrap.wrap(james);
		var copy = james.copyState();
		
		expect('name' in copy).toBe(false);
	});

	// Arrays are a special case, so make sure that array getters are ignored like other getters.
	it('does not copy array getters', function() {
		var james = {
				get names() {
					return ['James', 'Jim'];
				}
		};
		knockwrap.wrap(james);
		var copy = james.copyState();
		
		expect('names' in copy).toBe(false);
	});
	
	it('does not copy functions', function() {
		var james = {
				name: function() {
					return 'James';
				}
		};
		knockwrap.wrap(james);
		var copy = james.copyState();
		
		expect('name' in copy).toBe(false);
	});
});