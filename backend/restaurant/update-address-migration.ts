import mongoose from "mongoose";
import { connectDB } from "../../config/mongodb";
import RestaurantModel from "./model";
import type { AddressType } from "../../types";

const asabaBounds = {
	north: 6.25,
	south: 6.1,
	east: 6.8,
	west: 6.65,
};

// Helper function to generate random coordinates within Asaba bounds
function generateRandomCoordinates() {
	const lat = Number((Math.random() * (asabaBounds.north - asabaBounds.south) + asabaBounds.south).toFixed(6));
	const lng = Number((Math.random() * (asabaBounds.east - asabaBounds.west) + asabaBounds.west).toFixed(6));
	return { lat, lng };
}

// Helper function to generate random location within Asaba
function generateRandomLocation() {
	const areas = [
		"Okpanam Road", "Nnebisi Road", "Summit Road", "DLA Road", "Jesus Saves Road",
		"Dennis Osadebe Way", "Mariam Babangida Way", "Ibusa Road", "Cable Point",
		"Core Area", "Infant Jesus", "West End", "GRA", "Bonsaac"
	];

	const streetNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
	const streetTypes = ["Street", "Close", "Avenue", "Road", "Lane"];

	const area = areas[Math.floor(Math.random() * areas.length)];
	const number = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
	const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];

	return `${number} ${area} ${streetType}, Asaba, Delta State`;
}

function generateNewAddress(): AddressType {
	const landmarks = ['Bank', 'School', 'Market', 'Church', 'Park', 'Shopping Mall', 'Hospital', 'Police Station'];

	return {
		label: "Main Branch", // Optional field, you might want to randomize this or leave it undefined
		location: generateRandomLocation(),
		coordinates: generateRandomCoordinates(),
		additionalDetails: `Near ${landmarks[Math.floor(Math.random() * landmarks.length)]}`,
	};
}

async function migrateAddresses() {
	console.time("Migration time");

	try {
		await connectDB();
		console.log("Connected to database");

		const restaurants = await RestaurantModel.find({});
		console.log(`Found ${restaurants.length} restaurants to migrate`);

		let migratedCount = 0;

		for (const restaurant of restaurants) {
			const newAddress = generateNewAddress();

			// Update the restaurant document with new address structure
			await RestaurantModel.updateOne(
				{ _id: restaurant._id },
				{
					$set: {
						address: newAddress
					}
				}
			);

			migratedCount++;
			if (migratedCount % 10 === 0) {
				console.log(`Migrated ${migratedCount} restaurants`);
			}
		}

		console.log(`Successfully migrated ${migratedCount} restaurants`);

	} catch (error) {
		console.error("Migration failed:", error);
	} finally {
		await mongoose.disconnect();
		console.log("Database connection closed");
		console.timeEnd("Migration time");
	}
}

migrateAddresses().catch((error) => {
	console.error("Unhandled Error:", error);
	process.exit(1);
});