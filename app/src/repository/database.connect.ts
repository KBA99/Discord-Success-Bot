/* ----------------------------- MongoDB Setup ----------------------------- */
import mongoose from 'mongoose';
import { mongoDB } from '~/config';

export const connectToDatabase = async (dataBaseURL: string = mongoDB.dbLocalURL) => {
	const connection = mongoose.connect(dataBaseURL, { autoCreate: true, autoIndex: true });
	console.log('\x1b[32m%s\x1b[0m', '[Initialize][Database] MongoDB Connected 🧳');
	console.log('\x1b[33m%s\x1b[0m', `[Initialize][Database] Databse URL: ${dataBaseURL}`);
	return connection;
};
