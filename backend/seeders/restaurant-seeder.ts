import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import { connectDB } from "../../config/mongodb";
import CategoryModel from "../admin/restaurant/category/model";
import RestaurantModel from "../restaurant/model";
import { RESTAURANT_NAMES } from "./data";



interface SeedRestaurantOptions {
  count?: number;
  clearExisting?: boolean;
}

// Helper Functions
function generateRandomRating(): number {
  return Number((Math.random() * 1.5 + 3.5).toFixed(1)); // Between 3.5 and 5.0
}

function generateRandomPromotion(): string | null {
  const promotions = [
    "-10% on some items",
    "-20% on selected items",
    "-30% on orders over ₦3,000",
    "-50% some items",
    null,
  ];
  return promotions[Math.floor(Math.random() * promotions.length)];
}

function generateRandomDeliveryTime(): { min: number; max: number } {
  const isFastDelivery = Math.random() < 0.5;

  if (isFastDelivery) {
    const min = 10 + Math.floor(Math.random() * 10);
    const max = min + 5 + Math.floor(Math.random() * 10);
    return { min, max };
  }

  const min = 20 + Math.floor(Math.random() * 10);
  const max = min + 10 + Math.floor(Math.random() * 20);
  return { min, max };
}

function generateRandomAddress() {
  const branchNames = ["Main Branch", "Downtown Branch", "Southern Branch"];
  const streets = ["Main Street", "Nnebisi Road", "Okpanam Road", "Ibusa Avenue"];

  return {
    branchName: branchNames[Math.floor(Math.random() * branchNames.length)],
    fullAddress: `${Math.floor(Math.random() * 100 + 1)} ${
      streets[Math.floor(Math.random() * streets.length)]
    }, Asaba, Delta State`,
    coordinates: {
      latitude: Number((6.145 + Math.random() * 0.01).toFixed(5)),
      longitude: Number((6.795 + Math.random() * 0.01).toFixed(5)),
    },
    additionalDetails: "Near Shopping Mall"
  };
}

function generateRandomOpeningHours() {
  const defaultHours = {
    open: "09:00",
    close: "21:00",
    isClosed: false
  };

  return {
    monday: { ...defaultHours },
    tuesday: { ...defaultHours },
    wednesday: { ...defaultHours },
    thursday: { ...defaultHours },
    friday: { ...defaultHours },
    saturday: { ...defaultHours },
    sunday: { ...defaultHours }
  };
}

async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = slugify(name, { lower: true, strict: true });
  const existingRestaurant = await RestaurantModel.findOne({ slug: baseSlug });

  if (existingRestaurant) {
    return `${baseSlug}-${uuidv4().slice(0, 6)}`;
  }

  return baseSlug;
}

// Main Seeding Function
export async function seedRestaurants({
  count = 10,
  clearExisting = true
}: SeedRestaurantOptions = {}) {
  console.time("Restaurant seeding time");

  try {
    await connectDB();
    console.log("Connected to database");

    if (clearExisting) {
      await RestaurantModel.deleteMany({});
      console.log("Cleared existing restaurant data");
    }

    // Fetch restaurant categories
    const categories = await CategoryModel.find({ categoryType: "restaurant" });
    if (categories.length === 0) {
      throw new Error("No restaurant categories found. Please seed categories first.");
    }

    // Generate restaurants
    const restaurantsToInsert = await Promise.all(
      RESTAURANT_NAMES.slice(0, count).map(async (name) => {
        // Assign 1-3 random categories to each restaurant
        const categoryCount = Math.floor(Math.random() * 3) + 1;
        const shuffledCategories = categories.sort(() => 0.5 - Math.random());
        const selectedCategories = shuffledCategories
          .slice(0, categoryCount)
          .map(cat => cat.publicId);

        return {
          publicId: uuidv4(),
          name,
          slug: await generateUniqueSlug(name),
          categories: selectedCategories,
          rating: generateRandomRating(),
          promotion: generateRandomPromotion(),
          deliveryTime: generateRandomDeliveryTime(),
          logo: `https://placehold.co/600x400.png?text=${encodeURIComponent(
            name.toLowerCase().replace(/\s+/g, "-")
          )}`,
          image: `https://placehold.co/600x400.png?text=${encodeURIComponent(
            name.toLowerCase().replace(/\s+/g, "-")
          )}`,
          address: generateRandomAddress(),
          phone: `+23480${Math.floor(Math.random() * 10000000)
            .toString()
            .padStart(7, "0")}`,
          email: `contact@${name.toLowerCase().replace(/\s+/g, "")}.com`,
          openingHours: generateRandomOpeningHours(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      })
    );

    // Insert restaurants
    const result = await RestaurantModel.insertMany(restaurantsToInsert);

    console.log("\nSeeding Summary:");
    console.log("-----------------");
    console.log(`Total Restaurants Seeded: ${result.length}`);
    console.log(`Categories per Restaurant: 1-3`);
    console.log(`Sample Categories Used: ${categories.slice(0, 3).map(c => c.name).join(", ")}...`);

  } catch (error) {
    console.error("Error during restaurant seeding:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("\nDatabase connection closed");
    console.timeEnd("Restaurant seeding time");
  }
}

seedRestaurants({ count: 6 })
.catch(error => {
  console.error("Unhandled Error:", error);
  process.exit(1);
});