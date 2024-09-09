import mongoose from "mongoose";
import { connectDB } from "../../config/mongodb";

import { v4 as uuidv4 } from "uuid";
import Chance from "chance";
import RestaurantModel from "../restaurant/model";
import CategoryModel from "../category/model";
import MenuModel from "./model";
import slugify from "slugify";

const chance = new Chance();

// Menu items for each category
const menuItemsByCategory = {
	"Bakery and Pastry": ["Croissant", "Baguette", "Danish", "Muffin", "Bagel", "Scones", "Eclair"],
	"Breakfast": ["Pancakes", "Omelette", "French Toast", "Cereal", "Eggs Benedict", "Avocado Toast", "Hash Browns"],
	"Burgers": ["Cheeseburger", "Bacon Burger", "Veggie Burger", "Chicken Burger", "Double Cheeseburger"],
	"Chinese": ["Sweet and Sour Chicken", "Kung Pao Chicken", "Spring Rolls", "Fried Dumplings", "Peking Duck"],
	"Desserts": ["Chocolate Cake", "Apple Pie", "Cheesecake", "Brownies", "Tiramisu", "Ice Cream", "Panna Cotta"],
	"rice": ["Fried Rice", "Jollof Rice", "Biryani", "Sushi Rice", "Sticky Rice"],
	"Grill": ["Grilled Chicken", "BBQ Ribs", "Grilled Steak", "Grilled Vegetables", "Grilled Salmon"],
	"Healthy": ["Quinoa Salad", "Avocado Salad", "Green Smoothie", "Grilled Chicken Salad", "Acai Bowl"],
	"international": ["Tacos", "Sushi", "Pizza", "Paella", "Ramen"],
	"juices": ["Orange Juice", "Apple Juice", "Carrot Juice", "Green Juice", "Watermelon Juice"],
	"Local food": ["Amala", "Pounded Yam", "Efo Riro", "Banga Soup", "Afang Soup"],
	"Nigerian": ["Jollof Rice", "Pounded Yam", "Egusi Soup", "Moi Moi", "Fried Plantain"],
	"Pizza": ["Pepperoni Pizza", "Margherita Pizza", "BBQ Chicken Pizza", "Veggie Pizza", "Hawaiian Pizza"],
	"Seafood": ["Grilled Salmon", "Shrimp Scampi", "Lobster Tail", "Crab Cakes", "Fish Tacos"],
	"Shawarma": ["Chicken Shawarma", "Beef Shawarma", "Lamb Shawarma", "Falafel Wrap", "Shawarma Salad"],
	"Snacks": ["Chips", "Popcorn", "Nachos", "Pretzels", "Fries"],
	"Traditional": ["Efo Riro", "Fufu", "Afang Soup", "Bitterleaf Soup", "Ogbono Soup"],
} as any;

async function seedMenus() {
	console.time("Seeding time");
	try {
		// Connect to the database
		await connectDB();

		// Fetch all restaurants
		const restaurants = await RestaurantModel.find({});
		if (!restaurants || restaurants.length === 0) {
			console.log("No restaurants found in the database.");
			return;
		}

		// Fetch all categories
		const categories = await CategoryModel.find({});
		if (!categories || categories.length === 0) {
			console.log("No categories found in the database.");
			return;
		}

		// Clear out existing menu items
		await MenuModel.deleteMany();

		// Seed random menu items for each restaurant
		const menuItems = [];
		for (const restaurant of restaurants) {
			// Pick a random number of menu items between 5 and 15
			const numberOfItems = chance.integer({ min: 5, max: 15 });

			// Generate menu items for each restaurant
			for (let i = 0; i < numberOfItems; i++) {
				// Pick a random category for this menu item
				const randomCategory = chance.pickone(categories);

				// Get the actual category name
				const categoryName = randomCategory.name;

				// Fetch the list of food items for this category
				const foodItems = menuItemsByCategory[categoryName];

				// If there are no predefined food items for the category, skip
				if (!foodItems || foodItems.length === 0) {
					continue;
				}

				// Pick a random food item from the category
				const foodName = chance.pickone(foodItems);

				// Generate a menu item
				const menuItem = {
					publicId: uuidv4(),
					name: foodName,
					slug: slugify(`${foodName} ${uuidv4()}`, { lower: true }), // Ensure unique slug
					category: categoryName,
					image: "https://placehold.co/600x400.png", // Placeholder image
					price: chance.floating({ min: 5, max: 100, fixed: 2 }), // Random price between $5 and $100
					available: chance.bool(), // Randomly available or not
					parent: restaurant.publicId, // Associate menu item with restaurant
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				menuItems.push(menuItem);
			}
		}

		// Insert the menu items into the database
		await MenuModel.insertMany(menuItems);

		console.log("Menu items seeded successfully.");
	} catch (error) {
		console.error("Error seeding data:", error);
	} finally {
		await mongoose.disconnect();
		console.log("Database connection closed.");
		console.timeEnd("Seeding time");
	}
}

seedMenus().catch((error) => {
	console.error("Unhandled Error:", error);
	process.exit(1);
});

console.log("Seeding menus...");
