
import mongoose from "mongoose";
import { connectDB } from "../../config/mongodb";
import RestaurantModel from "./model";
import MenuItemModel from "../menu/model";
import { generateMenuItemsForRestaurant, generateRestaurants } from "./utils";

//

async function seedData() {
	console.time("Seeding time");

	const NUMBER_OF_RESTAURANTS = 5;
	try {
		await connectDB();
		await RestaurantModel.deleteMany();
		await MenuItemModel.deleteMany();
		console.log("All existing restaurants and menu items deleted");

		const restaurants = generateRestaurants(NUMBER_OF_RESTAURANTS); // Generate 50 restaurants
		const restaurantDocs = await RestaurantModel.insertMany(restaurants);
		console.log("Restaurant data seeded successfully");

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let menuItems: any[] = [];
		for (const restaurant of restaurantDocs) {
			const items = generateMenuItemsForRestaurant(restaurant);
			menuItems = menuItems.concat(items);
		}

		await MenuItemModel.insertMany(menuItems);
		console.log("Menu item data seeded successfully");
	} catch (error) {
		console.error("Error seeding data:", error);
	} finally {
		await mongoose.disconnect();
		console.log("Database connection closed.");
		console.timeEnd("Seeding time");
	}
}

seedData().catch((error) => {
	console.error("Unhandled Error:", error);
	process.exit(1);
});

console.log("Seeding packages...");
