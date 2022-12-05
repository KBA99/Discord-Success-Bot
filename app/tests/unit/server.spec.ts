import mongoose from 'mongoose';
import { connectToDatabase } from '~/app/src/repository/database.connect';

const TEST_DB_URL = 'mongodb://localhost/discord-success-bot-test';
let dbConnection: any;

const clearDatabse = async () => {
	await dbConnection.connection.db.dropDatabase();
};

const setup = async () => {
	// Given we are connected to our test database
	dbConnection = await connectToDatabase(TEST_DB_URL);
};

const teardown = async () => {
	await mongoose.disconnect();
};

beforeAll(async () => {
	return await setup();
});

beforeEach(async () => {
	return await clearDatabse();
});

afterAll(async () => {
	return await teardown();
});

// After the test

// Setup
// want to communciate with our DB

// After
// want to clear the databse

test('This test should pass', () => {
	expect(true);
});
