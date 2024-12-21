import mongoose from "mongoose";
import { seedCategories } from "../admin/restaurant/category/seeder";
import { seedRestaurants } from "../admin/restaurant/seeder/seeder";
import { seedMenuItems } from "../admin/restaurant/menu/seeder";


async function runSeeders() {
	console.time("Total Seeding Time");

	try {
		// Run seeders in sequence
		await seedCategories();
		await seedRestaurants();
		await seedMenuItems();

		console.log("All data seeded successfully");
	} catch (error) {
		console.error("Error during seeding:", error);
	} finally {
		await mongoose.disconnect();
		console.log("Database connection closed");
		console.timeEnd("Total Seeding Time");
		process.exit(0);
	}
}

runSeeders().catch((error) => {
	console.error("Unhandled Error:", error);
	process.exit(1);
});