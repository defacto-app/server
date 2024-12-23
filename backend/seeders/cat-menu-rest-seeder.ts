import { seedMenuItems } from "../admin/restaurant/menu/seeder";
import { seedCategories } from "./category-seeder";
import { seedRestaurants } from "./restaurant-seeder";

async function runSeeders() {
  try {
    console.log("Seeding Categories...");
    await seedCategories();
    console.log("Categories seeded successfully!");

    console.log("Seeding Restaurants...");
    await seedRestaurants({ count: 10 });
    console.log("Restaurants seeded successfully!");

    console.log("Seeding Menu Items...");
    await seedMenuItems();
    console.log("Menu items seeded successfully!");

    console.log("\nAll seeders completed successfully!");
  } catch (error) {
    console.error("Error during seeding process:", error);
  }
}

runSeeders();
