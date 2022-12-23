import { createWriteStream } from 'fs';

export function logToFile(filePath: string) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = function (...args: any[]) {
			const result = originalMethod.apply(this, args);

			// Write the message to the text file
			createWriteStream(filePath, { flags: 'a' }).write(`${args[0]}` + ` :: ${new Date()}\n`);

			return result;
		};
	};
}

export class Logger {
	@logToFile('log.txt')
	static info(message?: any) {
		console.log('\x1b[36m%s\x1b[0m', message, '\x1b[0m');
	}

	@logToFile('log.txt')
	static warn(message: any) {
		console.log('\x1b[31m%s\x1b[0m', message, '\x1b[0m');
	}
}
