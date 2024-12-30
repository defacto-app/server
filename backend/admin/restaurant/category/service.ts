import CategoryModel from "./model";

class CategoryService {
   // For simple search/listing of categories
   static async getAllCategories(
      search: string,
      page: number,
      perPage: number,
      categoryType: string
   ) {
      const query: any = {};

      // Log the received inputs

      // Apply search filter
      if (search) {
         query.name = { $regex: search, $options: "i" };
      }

      // Apply categoryType filter
      if (categoryType && categoryType !== "all") {
         query.categoryType = categoryType;
      }

      // Log the constructed query

      try {
         // Fetch categories with pagination
         const categories = await CategoryModel.find(query)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .select("name slug publicId categoryType createdAt updatedAt") // Only select required fields
            .exec();

         // Get total count of documents
         const totalCount = await CategoryModel.countDocuments(query);

         // Log the results
         console.log("Categories result:", categories);
         console.log("Total count result:", totalCount);

         return {
            data: categories,
            meta: {
               page,
               perPage,
               total: totalCount,
               totalPages: Math.ceil(totalCount / perPage),
            },
         };
      } catch (error) {
         console.error("Error in getAllCategories:", error.message);
         throw error;
      }
   }

   static async searchCategories(search: string, categoryType?: string) {
      const filter: any = {};

      // Add regex for search if provided
      if (search) {
         filter.name = { $regex: `.*${search}.*`, $options: "i" }; // Ensure partial matches
      }

      // Add categoryType filter if provided
      if (categoryType) {
         filter.categoryType = categoryType;
      }

      // Log the constructed filter for debugging
      console.log("Constructed Filter:", filter);

      // Fetch categories with the specified filter
      return CategoryModel.find(filter, {
         name: 1,
         slug: 1,
         publicId: 1,
         categoryType: 1,
      })
         .sort({ name: 1 }) // Sort alphabetically by name (ascending)
         .limit(10); // Limit the results to 10
   }

}

export default CategoryService;
