import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import RestaurantModel from "../restaurant/model";
import { connectDB } from "../../config/mongodb";
import { generateAddress } from "../admin/restaurant/seeder/update-address-migration";

const RESTAURANT_DATA = [
  { name: "Bleisure Chinese & Nigerian Cuisine", category: "Chinese", rating: 92, reviews: 70, promotion: "-50% some items" },
  { name: "Cold Stone Creamery", category: "Desserts", rating: 79, reviews: 55 },
];

function generateUniqueSlug(name: string): string {
  const baseSlug = slugify(name, { lower: true, strict: true });
  const uniqueSuffix = uuidv4().slice(0, 6);
  return `${baseSlug}-${uniqueSuffix}`;
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

function generateAdditionalRestaurants(existingRestaurants: any[], totalNeeded: number) {
  const additional = [];
  const existingCount = existingRestaurants.length;
  const remainingCount = totalNeeded - existingCount;
  const categories = ["Chinese", "Desserts", "Burgers", "Local food", "Chicken", "Shawarma", "Fried Rice"];

  for (let i = 0; i < remainingCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    additional.push({
      name: `Restaurant ${existingCount + i + 1}`,
      category,
      rating: Math.floor(Math.random() * 20) + 80, // 80-100 rating
      reviews: Math.floor(Math.random() * 500) + 10, // 10-510 reviews
      // biome-ignore lint/style/useTemplate: <explanation>
      discount: Math.random() > 0.7 ? "-" + (Math.floor(Math.random() * 30) + 10) + "% some items" : null
    });
  }

  return [...existingRestaurants, ...additional];
}

export async function seedRestaurants() {
  console.log("Seeding restaurants...");
  try {
    await connectDB();

    // Clear existing restaurants
    await RestaurantModel.deleteMany({});
    console.log("Cleared existing restaurants");

    // Generate 100 restaurants
    const allRestaurants = generateAdditionalRestaurants(RESTAURANT_DATA, 100);

    // Generate restaurant documents
    const restaurantDocs = allRestaurants.map((data) => {
      const publicId = uuidv4();
      return {
        publicId,
        restaurantPublicId: publicId,
        name: data.name,
        slug: generateUniqueSlug(data.name),
        category: data.category,
        rating: data.rating,
        reviews: data.reviews,
        discount: data.discount || null,
        deliveryTime: {
          min: 5 + Math.floor(Math.random() * 10),
          max: 40 + Math.floor(Math.random() * 20),
        },
        image: "https://placehold.co/600x400.png",
        logo: "https://placehold.co/600x400.png",
        address: generateAddress(),
        phone: `+234${Math.floor(Math.random() * 1000000000)}`,
        email: `${slugify(data.name, { lower: true })}@example.com`,
        openingHours: generateOpeningHours(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const savedRestaurants = await RestaurantModel.insertMany(restaurantDocs);
    console.log(`Seeded ${savedRestaurants.length} restaurants`);

    return savedRestaurants;
  } catch (error) {
    console.error("Error during restaurant seeding:", error);
    throw error;
  }
}