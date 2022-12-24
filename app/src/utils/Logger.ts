import { promises as fs } from 'fs';
import { format } from 'util';

export function logToFile(filePath: string) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const result = await originalMethod.apply(this, args);

			try {
				await fs.appendFile(filePath, `${format(...args)} :: ${new Date()}\n`);
			} catch (error) {
				console.error(error);
			}

			return result;
		};
	};
}

export class Logger {
	@logToFile('log.txt')
	static async info(message?: any) {
		console.log('\x1b[36m%s\x1b[0m', message, '\x1b[0m');
	}

	@logToFile('log.txt')
	static async warn(message: any) {
		console.log('\x1b[31m%s\x1b[0m', message, '\x1b[0m');
	}
}
