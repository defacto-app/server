import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "../../config/mongodb";
import RestaurantModel from "./model";
import MenuItemModel from "../menu/model";

const restaurants = [
   {
      name: "Italiano Delight",
      rating: 4.7,
      deliveryTime: "10-25 mins",
      category: "Pasta",
      image: "https://example.com/images/italiano_delight.jpg",
      address: "123 Pasta Lane",
      phone: "123-456-7890",
      email: "contact@italianodelight.com",
      openingHours: "10:00 AM - 11:00 PM",
   },
   {
      name: "Sushi Paradise",
      rating: 4.8,
      deliveryTime: "15-30 mins",
      category: "Sushi",
      image: "https://example.com/images/sushi_paradise.jpg",
      address: "456 Sushi Blvd",
      phone: "987-654-3210",
      email: "contact@sushiparadise.com",
      openingHours: "11:00 AM - 10:00 PM",
   },
   // Add more restaurant objects as needed
];

const menuItems = [
   {
      name: "Spaghetti Carbonara",
      price: 12.99,
      description: "Classic Italian pasta with eggs, cheese, pancetta, and pepper.",
      image: "https://example.com/images/spaghetti_carbonara.jpg",
      restaurantName: "Italiano Delight",
   },
   {
      name: "Fettuccine Alfredo",
      price: 13.99,
      description: "Rich and creamy Alfredo sauce served over fettuccine pasta.",
      image: "https://example.com/images/fettuccine_alfredo.jpg",
      restaurantName: "Italiano Delight",
   },
   {
      name: "California Roll",
      price: 8.99,
      description: "Sushi roll with crab, avocado, and cucumber.",
      image: "https://example.com/images/california_roll.jpg",
      restaurantName: "Sushi Paradise",
   },
   {
      name: "Spicy Tuna Roll",
      price: 9.99,
      description: "Sushi roll with spicy tuna and cucumber.",
      image: "https://example.com/images/spicy_tuna_roll.jpg",
      restaurantName: "Sushi Paradise",
   },
   // Add more menu items for other restaurants as needed
];

async function seedData() {
   console.time("Seeding time");
   try {
      await connectDB();
      await RestaurantModel.deleteMany();
      await MenuItemModel.deleteMany();
      console.log("All existing restaurants and menu items deleted");

      const restaurantDocs = await RestaurantModel.insertMany(restaurants);
      console.log("Restaurant data seeded successfully");

      const menuItemsWithRestaurantIds = menuItems.map(item => {
         const restaurant = restaurantDocs.find(r => r.name === item.restaurantName);
         return {
            ...item,
            restaurantId: restaurant._id as mongoose.Types.ObjectId,
            publicId: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
         };
      });

      await MenuItemModel.insertMany(menuItemsWithRestaurantIds);
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
