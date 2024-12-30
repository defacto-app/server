import RestaurantModel from "../../restaurant/model";
import { createRestaurantSchema } from "./validator";

export class RestaurantService {
   static async createRestaurant(data: any) {
      const validatedData = createRestaurantSchema.parse(data); // Validate data using zod

      const newRestaurant = new RestaurantModel({
         name: validatedData.name,
         category: validatedData.category,
         address: validatedData.address,
         phone: validatedData.phone,
         email: validatedData.email,
         openingHours: validatedData.openingHours,
         deliveryTime: {
            min: validatedData.deliveryTime.min,
            max: validatedData.deliveryTime.max,
         },
      });

      return await newRestaurant.save();
   }
}
