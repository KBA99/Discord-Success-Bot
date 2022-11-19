/* ----------------------------- MongoDB Setup ----------------------------- */
import mongoose from 'mongoose';
import { mongoDB } from '~/config';

export const connectToDatabase = async() => {
	mongoose.connect(mongoDB.dbLocalURL, { autoCreate: true, autoIndex: true }, () =>
		console.log('\x1b[32m%s\x1b[0m', '[Initialize][Database] MongoDB Connected 🧳')
	);
};
