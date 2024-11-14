import mongoose from "mongoose";
import OrderModel from "./model";
import { connectDB } from "../../../config/mongodb"; // Import your order model

// Function to generate a simple orderId for users (e.g., "ORD-123456")
const generateOrderId = (): string => {
   const randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit number
   return `ORD-${randomNumber}`; // Format like "ORD-123456"
};

// Seeder function to update existing orders with orderId
async function seedOrderIdForOrders() {
   console.time("Seeding OrderId Time");

   try {
      // Connect to the database
      await connectDB();

      // Fetch all orders that are missing the orderId field
      const orders = await OrderModel.find({ orderId: { $exists: false } });
      console.log(`${orders.length} orders found without orderId`);

      // Loop through each order and update it with a new orderId
      for (const order of orders) {
         const newOrderId = generateOrderId();

         // Update the order with the new orderId
         await OrderModel.updateOne(
            { _id: order._id }, // Filter by order _id
            { $set: { orderId: newOrderId } } // Set the new orderId
         );

         console.log(`Order ${order._id} updated with orderId: ${newOrderId}`);
      }

      console.log("All orders updated successfully.");
   } catch (error) {
      console.error("Error updating orders with orderId:", error);
   } finally {
      // Close the database connection
      await mongoose.disconnect();
      console.log("Database connection closed.");
      console.timeEnd("Seeding OrderId Time");
   }
}

// Run the seeder
seedOrderIdForOrders().catch((error) => {
   console.error("Unhandled Error:", error);
   process.exit(1);
});
