import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
// biome-ignore lint/style/useImportType: <explanation>
import { RestaurantDataType } from "./model";
import type { CategoryDataType } from "../admin/restaurant/category/model";

export function generateRestaurantNames(n: number) {
	const foodAdjectives = [
		"Appetizing",
		"Blazing",
		"Charming",
		"Delightful",
		"Exquisite",
		"Flavorful",
		"Gourmet",
		"Hearty",
		"Inviting",
		"Juicy",
		"Kitschy",
		"Luxurious",
		"Mouthwatering",
		"Nostalgic",
		"Organic",
		"Piquant",
		"Quaint",
		"Rustic",
		"Savory",
		"Tantalizing",
		"Upscale",
		"Vibrant",
		"Wholesome",
		"Xotic",
		"Yummy",
		"Zesty",
	];
	const foodNouns = [
		"Alcove",
		"Bistro",
		"Café",
		"Diner",
		"Eatery",
		"Farmhouse",
		"Grill",
		"Hub",
		"Inn",
		"Joint",
		"Kitchen",
		"Lounge",
		"Mess",
		"Nook",
		"Oasis",
		"Pub",
		"Quarters",
		"Restaurant",
		"Steakhouse",
		"Tavern",
		"Umbrella",
		"Venue",
		"Watering Hole",
		"Xpress",
		"Yard",
		"Zone",
	];

	const restaurantNames = new Set<string>(); // Use a Set to ensure unique names

	while (restaurantNames.size < n) {
		const adjective =
			foodAdjectives[Math.floor(Math.random() * foodAdjectives.length)];
		const noun = foodNouns[Math.floor(Math.random() * foodNouns.length)];
		const name = `${adjective} ${noun}`;

		restaurantNames.add(name); // Set will automatically avoid duplicates
	}

	return Array.from(restaurantNames); // Convert back to array
}

//
//
//
//
//

// Restaurant Categories (make them distinct from menu categories)
const RESTAURANT_CATEGORIES = [
	"Fast Food Burgers",
	"Gourmet Pizza",
	"Classic Italian",
	"Fresh Pasta",
	"Healthy Salads",
	"Premium Sushi",
	"Fresh Seafood",
	"Health Food",
	"Sweet Desserts",
	"Specialty Drinks",
] as const;

// Menu Categories (distinct from restaurant categories)
const MENU_CATEGORIES = [
	"Main Dishes",
	"Starters",
	"Sweet Treats",
	"Refreshments",
	"Chef Specials",
	"Side Orders",
	"Morning Menu",
	"Lunch Specials",
	"Evening Menu",
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateUniqueSlug(name: string, index: number): string {
	const baseSlug = slugify(name, { lower: true });
	const uniqueSuffix = uuidv4().slice(0, 6);
	return `${baseSlug}-${uniqueSuffix}`;
}

export function generateCategories() {
	const restaurantCategories = RESTAURANT_CATEGORIES.map((name, index) => ({
		publicId: uuidv4(),
		name,
		slug: generateUniqueSlug(name, index),
		description: `${name} category for restaurants`,
		active: true,
		categoryType: "restaurant" as const,
		createdAt: new Date(),
		updatedAt: new Date(),
	}));

	const menuCategories = MENU_CATEGORIES.map((name, index) => ({
		publicId: uuidv4(),
		name,
		slug: generateUniqueSlug(name, index),
		description: `${name} category for menu items`,
		active: true,
		categoryType: "menu" as const,
		createdAt: new Date(),
		updatedAt: new Date(),
	}));

	return [...restaurantCategories, ...menuCategories];
}

function generateRandomName(): string {
	const prefixes = [
		"Little",
		"Big",
		"Golden",
		"Silver",
		"Blue",
		"Red",
		"Green",
		"Royal",
	];
	const nouns = [
		"Kitchen",
		"Bistro",
		"Cafe",
		"Restaurant",
		"Diner",
		"Grill",
		"Place",
		"Eatery",
	];
	const suffixes = [
		"Express",
		"House",
		"Hub",
		"Spot",
		"Junction",
		"Corner",
		"Garden",
	];

	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

	return `${prefix} ${noun} ${suffix}`;
}

function generateOpeningHours() {
	return {
		monday: { open: "08:00", close: "22:00", isClosed: false },
		tuesday: { open: "08:00", close: "22:00", isClosed: false },
		wednesday: { open: "08:00", close: "22:00", isClosed: false },
		thursday: { open: "08:00", close: "22:00", isClosed: false },
		friday: { open: "08:00", close: "23:00", isClosed: false },
		saturday: { open: "09:00", close: "23:00", isClosed: false },
		sunday: { open: "09:00", close: "21:00", isClosed: false },
	};
}

export function generateRestaurants(
	count: number,
	restaurantCategories: any
) {
	return Array.from({ length: count }).map(() => {
		const publicId = uuidv4();
		const name = generateRandomName();
		const uniqueSlug = `${slugify(name, { lower: true })}-${uuidv4().slice(0, 6)}`;
		const randomCategory =
			restaurantCategories[
				Math.floor(Math.random() * restaurantCategories.length)
			];

		return {
			name,
			slug: uniqueSlug,
			publicId,
			restaurantPublicId: publicId,
			deliveryTime: {
				min: 20 + Math.floor(Math.random() * 20),
				max: 40 + Math.floor(Math.random() * 20),
			},
			category: randomCategory.name,
			image: "https://placehold.co/600x400.png",
			logo: "https://placehold.co/150x150.png",
			address: {
				street: "123 Main St",
				city: "Sample City",
				state: "Sample State",
				zip: "12345",
			},
			phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
			email: `contact@${uniqueSlug.replace(/-/g, "")}.com`,
			rating: Number((Math.random() * 2 + 3).toFixed(1)),
			openingHours: generateOpeningHours(),
			discount:
				Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : undefined,
		};
	});
}

const menuItemTemplates = {
	"Main Dishes": [
		{ name: "Grilled Chicken", price: 1899 },
		{ name: "Steak", price: 2499 },
		{ name: "Fish Fillet", price: 1799 },
	],
	Starters: [
		{ name: "Spring Rolls", price: 899 },
		{ name: "Soup", price: 699 },
		{ name: "Salad", price: 799 },
	],
	"Sweet Treats": [
		{ name: "Chocolate Cake", price: 899 },
		{ name: "Ice Cream", price: 599 },
		{ name: "Apple Pie", price: 799 },
	],
	Refreshments: [
		{ name: "Fresh Juice", price: 499 },
		{ name: "Iced Tea", price: 399 },
		{ name: "Soda", price: 299 },
	],
} as any;

export function generateMenuItemsForRestaurant(
	restaurant: RestaurantDataType,
	menuCategories: CategoryDataType[],
) {
	const menuItems = [] as any;

	for (const category of menuCategories) {
		const templates = menuItemTemplates[category.name] || [];
		const items = templates.map((template: { name: string; price: any }) => ({
			publicId: uuidv4(),
			name: template.name,
			slug: `${slugify(template.name, { lower: true })}-${uuidv4().slice(0, 6)}`,
			price: template.price,
			available: true,
			parent: restaurant.publicId,
			categoryId: category.publicId,
			image: "https://placehold.co/600x400.png",
			createdAt: new Date(),
			updatedAt: new Date(),
			isDeleted: false,
		}));

		menuItems.push(...items);
	}

	return menuItems;
}
