class SuccessBotError extends Error {
	constructor(message: string | undefined) {
		super(message); // (1)
		this.name = 'YourError'; // (2)
	}
}

const tester = () => {
	throw new SuccessBotError('Whoops!');
};

try {
	tester();
} catch (err) {
	if (err instanceof SuccessBotError) {
		alert(err.message); // Whoops!
		alert(err.name); // YourError
		alert(err.stack); // a list of nested calls with line numbers for each
	}
}
