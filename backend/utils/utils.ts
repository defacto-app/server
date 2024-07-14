export function randomFormId() {
	const center = 1411378188;
	const range = 1000;
	const min = center - range;
	const max = center + range;
	return Number(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function formatPathForStorage(fullPath: string) {
	// Split the path at 'storage' and take the part after it
	const parts = fullPath.split("/uploads/");
	return parts[1] ? `uploads/${parts[1]}` : "";
}

// Usage example
const fullPath =
	"/Users/centurion-pc/hroot/job-seeker/server/storage/uploads/logos/2024-02-22/1708615105064-BTC.png";
// const storagePath = formatPathForStorage(fullPath);

export function getShortName(str: string) {
	const words = str.split(" ");
	let shortName = "";

	// Process only the first letter of each word
	for (let i = 0; i < words.length; i++) {
		shortName += words[i][0];
	}

	return shortName.toLowerCase();
}

export function generateSlug(data: string) {
	// Use the 'name' property to generate the slug
	return (
		data
			// Convert to lowercase
			.toLowerCase()
			// Replace spaces with hyphens
			.replace(/\s+/g, "-")
			// Remove special characters
			.replace(/[^\w\-]+/g, "")
			// Replace multiple hyphens with a single hyphen
			.replace(/\-\-+/g, "-")
	);
}

const OTP_LENGTH = 6;

export const generateOTP = (num = OTP_LENGTH) => {
	let otp = "";
	for (let i = 0; i < num; i++) {
		otp += Math.floor(Math.random() * 10); // Directly append random digit to otp
	}
	return otp;
};
