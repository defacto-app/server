import Chance from "chance";
import slugify from "slugify";

const chance = new Chance();

type MenuItem = {
	name: string;
	price: number;
	description: string;
};

type Restaurant = {
	_id: string;
	category: keyof typeof menuItemsByCategory;
};

const menuItemsByCategory: { [key: string]: MenuItem[] } = {
	Pasta: [
		{
			name: "Spaghetti Carbonara",
			price: 12.99,
			description:
				"Classic Italian pasta with eggs, cheese, pancetta, and pepper.",
		},
		{
			name: "Fettuccine Alfredo",
			price: 13.99,
			description:
				"Rich and creamy Alfredo sauce served over fettuccine pasta.",
		},
	],
	Sushi: [
		{
			name: "California Roll",
			price: 8.99,
			description: "Sushi roll with crab, avocado, and cucumber.",
		},
		{
			name: "Spicy Tuna Roll",
			price: 9.99,
			description: "Sushi roll with spicy tuna and cucumber.",
		},
	],
	Pizza: [
		{
			name: "Margherita Pizza",
			price: 10.99,
			description: "Classic pizza with tomato sauce, mozzarella, and basil.",
		},
		{
			name: "Pepperoni Pizza",
			price: 11.99,
			description: "Pizza topped with pepperoni and mozzarella cheese.",
		},
	],
	Burgers: [
		{
			name: "Cheeseburger",
			price: 9.99,
			description:
				"Grilled beef patty with cheese, lettuce, tomato, and pickles.",
		},
		{
			name: "Veggie Burger",
			price: 8.99,
			description: "Grilled veggie patty with lettuce, tomato, and avocado.",
		},
	],
	Salads: [
		{
			name: "Caesar Salad",
			price: 7.99,
			description:
				"Classic Caesar salad with romaine lettuce, croutons, and Caesar dressing.",
		},
		{
			name: "Greek Salad",
			price: 8.99,
			description:
				"Salad with tomatoes, cucumbers, olives, feta cheese, and olive oil.",
		},
	],
};
export function generateOpeningHours() {
	const openingHour = chance.hour({ twentyfour: false });
	const closingHour = chance.hour({ twentyfour: false });

	const openingMinute = chance.minute();
	const closingMinute = chance.minute();

	const openingPeriod = chance.ampm();
	const closingPeriod = chance.ampm();

	const formattedOpeningHour = `${openingHour}:${openingMinute < 10 ? "0" : ""}${openingMinute} ${openingPeriod.toUpperCase()}`;
	const formattedClosingHour = `${closingHour}:${closingMinute < 10 ? "0" : ""}${closingMinute} ${closingPeriod.toUpperCase()}`;

	return `${formattedOpeningHour} - ${formattedClosingHour}`;
}

export function generateRestaurantNames(n: number) {
	const foodAdjectives = [
		"Appetizing", "Blazing", "Charming", "Delightful", "Exquisite", "Flavorful", "Gourmet", "Hearty",
		"Inviting", "Juicy", "Kitschy", "Luxurious", "Mouthwatering", "Nostalgic", "Organic", "Piquant",
		"Quaint", "Rustic", "Savory", "Tantalizing", "Upscale", "Vibrant", "Wholesome", "Xotic",
		"Yummy", "Zesty"
	];
	const foodNouns = [
		"Alcove", "Bistro", "Café", "Diner", "Eatery", "Farmhouse", "Grill", "Hub",
		"Inn", "Joint", "Kitchen", "Lounge", "Mess", "Nook", "Oasis", "Pub",
		"Quarters", "Restaurant", "Steakhouse", "Tavern", "Umbrella", "Venue", "Watering Hole", "Xpress",
		"Yard", "Zone"
	];

	const restaurantNames = new Set<string>(); // Use a Set to ensure unique names

	while (restaurantNames.size < n) {
		const adjective = foodAdjectives[Math.floor(Math.random() * foodAdjectives.length)];
		const noun = foodNouns[Math.floor(Math.random() * foodNouns.length)];
		const name = `${adjective} ${noun}`;

		restaurantNames.add(name); // Set will automatically avoid duplicates
	}

	return Array.from(restaurantNames); // Convert back to array
}


export function generateRestaurants(n: number) {
	const restaurantNames = generateRestaurantNames(n);
	const restaurants = [];
	const slugs = new Set<string>(); // Track unique slugs

	for (let i = 0; i < n; i++) {
		const restaurant = generateRestaurant(restaurantNames[i]);

		// Ensure slug is unique by modifying it if necessary
		let uniqueSlug = restaurant.slug;
		let counter = 1;
		while (slugs.has(uniqueSlug)) {
			uniqueSlug = `${restaurant.slug}-${counter}`;
			counter++;
		}

		restaurant.slug = uniqueSlug;
		slugs.add(uniqueSlug);
		restaurants.push(restaurant);
	}

	return restaurants;
}



function generateRestaurant(name: string) {
	const category = chance.pickone(Object.keys(menuItemsByCategory));
	return {
		name: name,
		slug: slugify(name, { lower: true, strict: true }),
		deliveryTime: `${chance.integer({ min: 10, max: 20 })}-${chance.integer({ min: 21, max: 45 })} mins`,
		category: category,
		image: "https://placehold.co/600x400.png",
		address: chance.address(),
		phone: chance.phone(),
		email: chance.email(),
		openingHours: generateOpeningHours(),
	};
}


export function generateMenuItemsForRestaurant(restaurant: Restaurant) {
	const items = menuItemsByCategory[restaurant.category];

	return items.map((item) => ({
		...item,
		restaurantId: restaurant._id,
		image: `https://example.com/images/${item.name.toLowerCase().replace(/ /g, "_")}.jpg`,
	}));
}
