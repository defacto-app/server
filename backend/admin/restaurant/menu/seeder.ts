import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import MenuModel from "../../../menu/model";
import RestaurantModel from "../../../restaurant/model";
import CategoryModel from "../category/model";
import { connectDB } from "../../../../config/mongodb";

const MENU_ITEM_TEMPLATES = {
	Chicken: [
		{ name: "Grilled Chicken", price: 2500 },
		{ name: "Spicy Wings", price: 2000 },
		{ name: "Chicken & Chips", price: 1800 },
		{ name: "Chicken Sandwich", price: 1500 }
	],
	Burgers: [
		{ name: "Classic Burger", price: 2000 },
		{ name: "Cheese Burger", price: 2200 },
		{ name: "Chicken Burger", price: 2100 },
		{ name: "Double Burger", price: 2800 }
	],
	"Fried Rice": [
		{ name: "Special Fried Rice", price: 1800 },
		{ name: "Chinese Fried Rice", price: 2000 },
		{ name: "Nigerian Fried Rice", price: 1500 }
	],
	Desserts: [
		{ name: "Ice Cream Sundae", price: 1500 },
		{ name: "Chocolate Cake", price: 2000 },
		{ name: "Fruit Parfait", price: 1800 }
	],
	Chinese: [
		{ name: "Sweet and Sour Chicken", price: 2500 },
		{ name: "Fried Rice", price: 2000 },
		{ name: "Spring Rolls", price: 1500 }
	],
	Shawarma: [
		{ name: "Chicken Shawarma", price: 1500 },
		{ name: "Beef Shawarma", price: 1800 },
		{ name: "Mixed Shawarma", price: 2000 }
	],
	"Local food": [
		{ name: "Jollof Rice", price: 1500 },
		{ name: "Fried Rice", price: 1500 },
		{ name: "Pounded Yam & Soup", price: 2000 }
	]
} as any;

function generateUniqueSlug(name: string): string {
	const baseSlug = slugify(name, { lower: true, strict: true });
	const uniqueSuffix = uuidv4().slice(0, 6);
	return `${baseSlug}-${uniqueSuffix}`;
}

export async function seedMenuItems() {
	console.log("Seeding menu items...");
	try {
		await connectDB();

		// Clear existing menu items
		await MenuModel.deleteMany({});
		console.log("Cleared existing menu items");

		const categories = await CategoryModel.find().lean();
		const restaurants = await RestaurantModel.find().lean();

		const menuItems = [];
		const BATCH_SIZE = 1000;

		for (const restaurant of restaurants) {
			const categoryItems = MENU_ITEM_TEMPLATES[restaurant.category] || [];

			for (const item of categoryItems) {
				const priceVariation = 0.8 + Math.random() * 0.4; // 80% to 120% of base price
				menuItems.push({
					publicId: uuidv4(),
					name: item.name,
					slug: generateUniqueSlug(item.name),
					price: Math.round(item.price * priceVariation),
					available: true,
					parent: restaurant.publicId,
					categoryId: categories.find(
						(cat) => cat.name === restaurant.category
					)?.publicId,
					image: "https://placehold.co/600x400.png",
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}

			// Insert in batches to avoid memory issues
			if (menuItems.length >= BATCH_SIZE) {
				await MenuModel.insertMany(menuItems);
				console.log(`Inserted batch of ${menuItems.length} menu items`);
				menuItems.length = 0; // Clear array while maintaining reference
			}
		}

		// Insert remaining items
		if (menuItems.length > 0) {
			await MenuModel.insertMany(menuItems);
			console.log(`Inserted final batch of ${menuItems.length} menu items`);
		}

		const totalCount = await MenuModel.countDocuments();
		console.log(`Seeded ${totalCount} menu items total`);
	} catch (error) {
		console.error("Error during menu item seeding:", error);
		throw error;
	}
}