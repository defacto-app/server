import { v4 as uuidv4 } from "uuid";
import fs from "node:fs";
import path from "node:path";
import { RESTAURANT_NAMES } from "./data";

type Restaurant = {
   id: string;
   name: string;
   rating: number;
   promotion: string | null;
   deliveryTime: { min: number; max: number };
   logo: string;
   image: string;
   address: {
      branchName: string;
      fullAddress: string;
      coordinates: { latitude: number; longitude: number };
      additionalDetails: string;
   };
   email: string;
   phone: string;
   openingHours: {
      monday: { open: string; close: string; isClosed: boolean };
      tuesday: { open: string; close: string; isClosed: boolean };
      wednesday: { open: string; close: string; isClosed: boolean };
      thursday: { open: string; close: string; isClosed: boolean };
      friday: { open: string; close: string; isClosed: boolean };
      saturday: { open: string; close: string; isClosed: boolean };
      sunday: { open: string; close: string; isClosed: boolean };
   };
};

// Helper function to generate a random rating
function generateRandomRating(): number {
   return Number((Math.random() * 1.5 + 3.5).toFixed(1)); // Between 3.5 and 5.0
}

// Helper function to generate a random promotion
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

// Updated: Helper function to generate random delivery times
function generateRandomDeliveryTime(): { min: number; max: number } {
   // Probability for delivery time under 30 minutes (e.g., 60%)
   const isFastDelivery = Math.random() < 0.5; // 60% chance

   if (isFastDelivery) {
      const min = 10 + Math.floor(Math.random() * 10); // Min delivery time: 10-20 mins
      const max = min + 5 + Math.floor(Math.random() * 10); // Max delivery time: 15-30 mins
      return { min, max };
   }

   const min = 20 + Math.floor(Math.random() * 10); // Min delivery time: 20-30 mins
   const max = min + 10 + Math.floor(Math.random() * 20); // Max delivery time: 30-50 mins
   return { min, max };
}

// Helper function to generate logo and image URLs
function generateImageUrl(name: string): string {
   const baseSlug = name.toLowerCase().replace(/\s+/g, "-");
   return `https://placehold.co/600x400.png?text=${encodeURIComponent(baseSlug)}`;
}

// Helper function to generate a detailed address
function generateRandomAddress(): Restaurant["address"] {
   const branchNames = ["Main Branch", "Downtown Branch", "Southern Branch"];
   const streets = ["Main Street", "Nnebisi Road", "Okpanam Road", "Ibusa Avenue"];
   const branchName = branchNames[Math.floor(Math.random() * branchNames.length)];
   const fullAddress = `${Math.floor(Math.random() * 100 + 1)} ${
      streets[Math.floor(Math.random() * streets.length)]
   }, Asaba, Delta State`;
   const coordinates = {
      latitude: Number((6.145 + Math.random() * 0.01).toFixed(5)),
      longitude: Number((6.795 + Math.random() * 0.01).toFixed(5)),
   };
   const additionalDetails = "Near Shopping Mall";

   return { branchName, fullAddress, coordinates, additionalDetails };
}

// Helper function to generate random opening hours
function generateRandomOpeningHours(): Restaurant["openingHours"] {
   const open = "09:00";
   const close = "21:00";
   const isClosed = false;
   return {
      monday: { open, close, isClosed },
      tuesday: { open, close, isClosed },
      wednesday: { open, close, isClosed },
      thursday: { open, close, isClosed },
      friday: { open, close, isClosed },
      saturday: { open, close, isClosed },
      sunday: { open, close, isClosed },
   };
}

// Function to generate restaurant JSON
function generateRestaurants(count: number): Restaurant[] {
   return RESTAURANT_NAMES.slice(0, count).map((name) => ({
      id: uuidv4(),
      name,
      rating: generateRandomRating(),
      promotion: generateRandomPromotion(),
      deliveryTime: generateRandomDeliveryTime(),
      logo: generateImageUrl(name),
      image: generateImageUrl(name),
      address: generateRandomAddress(),
      email: `contact@${name.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: `+23480${Math.floor(Math.random() * 10000000).toString().padStart(7, "0")}`,
      openingHours: generateRandomOpeningHours(),
   }));
}

// Generate restaurants and save to JSON
function saveRestaurantsToFile(count: number, filePath: string) {
   const restaurantData = generateRestaurants(count);
   const jsonData = JSON.stringify(restaurantData, null, 2);
   fs.writeFileSync(filePath, jsonData, "utf8");
   console.log(`JSON data has been written to ${filePath}`);
}

// Main script execution
const restaurantCount = 4; // Adjust as needed
const outputFilePath = path.join(__dirname, "restaurants.json");
saveRestaurantsToFile(restaurantCount, outputFilePath);
