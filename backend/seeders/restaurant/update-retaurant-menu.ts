import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import RestaurantModel from "../../restaurant/model";
import { connectDB } from "../../../config/mongodb";
import MenuModel from "../../menu/model";
import CategoryModel from "../../admin/restaurant/category/model";

interface MenuCategory {
   [categoryName: string]: {
      name: string;
      description: string;
      price: number;
   }[];
}

async function seedMenuForRestaurant(
   restaurantSlug: string,
   menuCategories: MenuCategory
): Promise<void> {
   try {
      await connectDB();
      console.log("Connected to database");

      // Fetch the restaurant by slug
      const restaurant = await RestaurantModel.findOne({ slug: restaurantSlug });
      if (!restaurant) {
         throw new Error(`Restaurant with slug "${restaurantSlug}" not found.`);
      }

      console.log(`Found restaurant: ${restaurant.name}`);

      // Delete all existing menu items for the restaurant
      await MenuModel.deleteMany({ parent: restaurant.publicId });
      console.log(`Deleted existing menu items for "${restaurant.name}"`);

      const menuItems = [];

      for (const [categoryName, items] of Object.entries(menuCategories)) {
         // Check if category exists, if not, create it
         let category = await CategoryModel.findOne({
            name: categoryName,
            categoryType: "menu",
         });

         if (!category) {
            category = await CategoryModel.create({
               publicId: uuidv4(),
               name: categoryName,
               slug: slugify(categoryName, { lower: true, strict: true }),
               description: `${categoryName} category for menu items`,
               active: true,
               categoryType: "menu",
               createdAt: new Date(),
               updatedAt: new Date(),
            });
            console.log(`Created new category: ${categoryName}`);
         }

         // Add menu items for the category
         for (const item of items) {
            const menuItem = {
               publicId: uuidv4(),
               name: item.name,
               slug: slugify(`${item.name} ${uuidv4()}`, { lower: true }),
               description: item.description,
               categoryId: category.publicId,
               image: `https://placehold.co/600x400.png?text=${encodeURIComponent(
                  item.name
               )}`,
               price: item.price,
               available: true,
               parent: restaurant.publicId,
               createdAt: new Date(),
               updatedAt: new Date(),
            };

            menuItems.push(menuItem);
         }
      }

      // Insert new menu items into the database
      if (menuItems.length > 0) {
         await MenuModel.insertMany(menuItems);
         console.log(
            `Inserted ${menuItems.length} menu items for "${restaurant.name}"`
         );
      } else {
         console.log("No menu items to insert.");
      }
   } catch (error) {
      console.error("Error during menu seeding:", error);
   } finally {
      await mongoose.disconnect();
      console.log("Database connection closed");
   }
}

// Example usage
const restaurantSlug = "Pinkberry";
const menuCategories = {
  "Promotions": [
    {
      name: "Pinkberry Buddies",
      description: "Buy 1 Midi to-go for you and your buddy @ 4900",
      price: 4900,
      discount: "-35%"
    },
    {
      name: "Berry Christmas",
      description: "Buy 1 Large To-Go Cup for N8500",
      price: 8500,
      discount: "-18%"
    }
  ],
  "Top Sellers": [
    {
      name: "Pinkberry Buddies",
      description: "Buy 1 Midi to-go for you and your buddy @ 4900",
      price: 4900,
      discount: "-35%"
    }
  ],
  "Chill Deals": [
    {
      name: "Berry Christmas",
      description: "Buy 1 Large To-Go Cup for N8500",
      price: 8500,
      discount: "-18%"
    },
    {
      name: "Pinkberry Buddies",
      description: "Buy 1 Midi to-go for you and your buddy @ 4900",
      price: 4900,
      discount: "-35%"
    }
  ],
  "Frozen Yogurt": [
    {
      name: "Original",
      description: "Our signature flavor- sweet and tangy with a refreshing finish",
      price: 4500
    },
    {
      name: "Kiwi",
      description: "Light, refreshing, nutritious & tasty Pinkberry yoghurt made with real Kiwi",
      price: 4500
    },
    {
      name: "Strawberry",
      description: "Fresh and fruity made with real Strawberries",
      price: 4500
    }
  ],
  "Parfait Frozen Yoghurt": [
    {
      name: "Parfait",
      description: "Layers of daily cut fresh fruit topped with granola and swirl of delicious frozen yoghurt",
      price: 7000
    }
  ],
  "Waffle Bowls": [
    {
      name: "Coated Waffles",
      description: "Crispy, crunchy waffle coated with chocolates, rainbow sprinkles or coconut shavings",
      price: 1200
    },
    {
      name: "Dipped Waffles",
      description: "Crispy, crunchy waffle dipped in chocolate",
      price: 1000
    },
    {
      name: "Plain Waffle",
      description: "Plain crispy, crunchy waffle",
      price: 800
    }
  ]
};


seedMenuForRestaurant(restaurantSlug, menuCategories).catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});
