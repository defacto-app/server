import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import { connectDB } from "../../../../config/mongodb";
import CategoryModel from "./model";

const MENU_CATEGORIES = [
  "Alcohol",
  "Bakery and Pastry",
  "Beer",
  "Breakfast",
  "Burgers",
  "Chinese",
  "Desserts",
  "Fried Rice",
  "Grill",
  "Indian",
  "International",
  "Italian",
  "Jollof",
  "Juices",
  "Local food",
  "Nigerian",
  "Pasta",
  "Shawarma",
  "Snacks",
  "Traditional",
  "Vegetarian",
  "Chicken",
] as const;

function generateUniqueSlug(name: string): string {
  const baseSlug = slugify(name, { lower: true, strict: true });
  const uniqueSuffix = uuidv4().slice(0, 6);
  return `${baseSlug}-${uniqueSuffix}`;
}

export async function seedCategories() {
  console.log("Seeding categories...");
  try {
    await connectDB();

    // Clear existing categories
    await CategoryModel.deleteMany({});
    console.log("Cleared existing categories");

    // Generate categories
    const categories = MENU_CATEGORIES.map((name) => ({
      publicId: uuidv4(),
      name,
      slug: generateUniqueSlug(name),
      description: `${name} category`,
      active: true,
      categoryType: "menu",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const savedCategories = await CategoryModel.insertMany(categories);
    console.log(`Seeded ${savedCategories.length} categories`);
  } catch (error) {
    console.error("Error during category seeding:", error);
    throw error;
  }
}
