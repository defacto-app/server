import Chance from "chance";
import mongoose from "mongoose";
import { connectDB } from "../../config/mongodb";
import RestaurantModel from "./model";
import MenuItemModel from "../menu/model";
import { generateOpeningHours, generateRestaurantNames } from "./utils";

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
   "Pasta": [
      { name: "Spaghetti Carbonara", price: 12.99, description: "Classic Italian pasta with eggs, cheese, pancetta, and pepper." },
      { name: "Fettuccine Alfredo", price: 13.99, description: "Rich and creamy Alfredo sauce served over fettuccine pasta." }
   ],
   "Sushi": [
      { name: "California Roll", price: 8.99, description: "Sushi roll with crab, avocado, and cucumber." },
      { name: "Spicy Tuna Roll", price: 9.99, description: "Sushi roll with spicy tuna and cucumber." }
   ],
   "Pizza": [
      { name: "Margherita Pizza", price: 10.99, description: "Classic pizza with tomato sauce, mozzarella, and basil." },
      { name: "Pepperoni Pizza", price: 11.99, description: "Pizza topped with pepperoni and mozzarella cheese." }
   ],
   "Burgers": [
      { name: "Cheeseburger", price: 9.99, description: "Grilled beef patty with cheese, lettuce, tomato, and pickles." },
      { name: "Veggie Burger", price: 8.99, description: "Grilled veggie patty with lettuce, tomato, and avocado." }
   ],
   "Salads": [
      { name: "Caesar Salad", price: 7.99, description: "Classic Caesar salad with romaine lettuce, croutons, and Caesar dressing." },
      { name: "Greek Salad", price: 8.99, description: "Salad with tomatoes, cucumbers, olives, feta cheese, and olive oil." }
   ]
};





function generateRestaurant(name:any) {
   const category = chance.pickone(Object.keys(menuItemsByCategory));
   return {
      name: name,
      rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Random rating between 3.5 and 5
      deliveryTime: `${chance.integer({ min: 10, max: 20 })}-${chance.integer({ min: 21, max: 45 })} mins`,
      category: category,
      image: `https://example.com/images/${chance.word()}.jpg`,
      address: chance.address(),
      phone: chance.phone(),
      email: chance.email(),
      openingHours: generateOpeningHours(),
   };
}

export function generateRestaurants(n: number) {
   const restaurantNames = generateRestaurantNames(n);
   const restaurants = [];
   for (let i = 0; i < n; i++) {
      restaurants.push(generateRestaurant(restaurantNames[i]));
   }
   return restaurants;
}

function generateMenuItemsForRestaurant(restaurant: Restaurant) {
   const items = menuItemsByCategory[restaurant.category];

   return items.map(item => ({
      ...item,
      restaurantId: restaurant._id,
      image: `https://example.com/images/${item.name.toLowerCase().replace(/ /g, "_")}.jpg`
   }));
}
//

async function seedData() {
   console.time("Seeding time");
   try {
      await connectDB();
      await RestaurantModel.deleteMany();
      await MenuItemModel.deleteMany();
      console.log("All existing restaurants and menu items deleted");

      const restaurants = generateRestaurants(50); // Generate 50 restaurants
      const restaurantDocs = await RestaurantModel.insertMany(restaurants);
      console.log("Restaurant data seeded successfully");

      let menuItems: any[] = [];
      restaurantDocs.forEach(restaurant => {
         const items = generateMenuItemsForRestaurant(restaurant);
         menuItems = menuItems.concat(items);
      });

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
