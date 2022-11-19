export const generateRandomString = () => {
	const L = generateRandomLetter;
	const N = generateRandomNumber;

	const prefix = ``;
};

const generateRandomLetter = () => {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const charactersLength = characters.length;

	result = characters.charAt(Math.floor(Math.random() * charactersLength));

	return result;
};

const generateRandomNumber = () => {
	let result = '';
	const characters = '0123456789';
	const charactersLength = characters.length;

	result = characters.charAt(Math.floor(Math.random() * charactersLength));

	return result;
};
