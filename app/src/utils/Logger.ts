export class Logger {
	static info(message?: any) {
		console.log('\x1b[36m%s\x1b[0m', message, '\x1b[0m');
	}

	static warn(message: any) {
		console.log('\x1b[31m%s\x1b[0m', message, '\x1b[0m');
	}
}
