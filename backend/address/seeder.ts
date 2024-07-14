import mongoose from "mongoose";
import Chance from "chance";
import { connectDB } from "../../config/mongodb";
import AddressModel from "./model";
import UserModel from "../user/model";

const chance = new Chance();

// Helper function to get a random latitude and longitude within Abuja's approximate boundaries
function getRandomCoordinatesForAbuja() {
	const latRange = { min: 8.9, max: 9.2 };
	const lngRange = { min: 7.3, max: 7.6 };

	return {
		lat: chance.floating({ min: latRange.min, max: latRange.max }),
		lng: chance.floating({ min: lngRange.min, max: lngRange.max }),
	};
}

// Helper function to generate a random address in Abuja
function getRandomAbujaAddress() {
	const addresses = [
		"2 Rwang Pam St, Gwarinpa, Federal Capital Territory, Nigeria",
		"Bala Sokoto Wy, Jabi, Abuja 900108, Federal Capital Territory, Nigeria",
		"No 5, Kandi Close, Off Aminu Kano Crescent, Wuse 2, Abuja",
		"23 Lobito Crescent, Wuse 2, Abuja",
		"Plot 224 Solomon Lar Way, Utako District, Abuja",
		"1235 Tafawa Balewa Way, Area 11, Garki, Abuja, Federal Capital Territory, Nigeria",
		"4567 Ahmadu Bello Way, Garki, Abuja, Federal Capital Territory, Nigeria",
		"89 Gana Street, Maitama, Abuja, Federal Capital Territory, Nigeria",
		"12 Lord Lugard Street, Asokoro, Abuja, Federal Capital Territory, Nigeria",
		"45 Mike Akhigbe Way, Jabi, Abuja, Federal Capital Territory, Nigeria",
		"32 Jesse Jackson Street, Asokoro, Abuja, Federal Capital Territory, Nigeria",
		"Plot 654, Adetokunbo Ademola Crescent, Wuse 2, Abuja, Federal Capital Territory, Nigeria",
		"78 Ralph Shodeinde Street, Central Business District, Abuja, Federal Capital Territory, Nigeria",
		"11 Julius Nyerere Crescent, Asokoro, Abuja, Federal Capital Territory, Nigeria",
		"Plot 1234 Yakubu Gowon Crescent, Asokoro, Abuja, Federal Capital Territory, Nigeria",
		"Plot 2039 Augustus Aikhomu Way, Utako, Abuja, Federal Capital Territory, Nigeria",
		"15 Garki Street, Area 3, Garki, Abuja, Federal Capital Territory, Nigeria",
	];

	const locations = ["Gwarinpa", "Jabi", "Wuse 2", "Utako", "Maitama"];

	return {
		address: chance.pickone(addresses),
		location: chance.pickone(locations),
	};
}

async function seedAddresses() {
	console.time("Seeding time");
	try {
		await connectDB();
		await AddressModel.deleteMany();

		const allUsers = await UserModel.find({});
		if (!allUsers.length) {
			console.error("No users found");
			return;
		}
		const labels = ["home", "office"];

		for (const user of allUsers) {
			// Create exactly 5 addresses for each user
			for (let i = 0; i < 5; i++) {
				const { address, location } = getRandomAbujaAddress();
				const { lat, lng } = getRandomCoordinatesForAbuja();

				const newAddress = {
					userId: user.userId,
					address,
					location,
					label: chance.pickone(labels),

					coordinates: {
						lat,
						lng,
					},
				};

				await AddressModel.create(newAddress);
			}
		}

		console.log("All addresses have been successfully created.");
	} catch (error) {
		console.error("Error seeding data:", error);
	} finally {
		await mongoose.disconnect();
		console.log("Database connection closed.");
		console.timeEnd("Seeding time");
	}
}

seedAddresses().catch((error) => {
	console.error("Unhandled Error:", error);
	process.exit(1);
});

console.log("Seeding addresses...");
