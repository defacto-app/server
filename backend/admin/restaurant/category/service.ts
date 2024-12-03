import CategoryModel from "./model";

class CategoryService {
   // For simple search/listing of categories
   static async getAllCategories(search: string, page: number, perPage: number) {
      const query: any = {};

      if (search) {
         query.name = { $regex: search, $options: "i" };
      }

      const pipeline = [
         { $match: query },
         {
            $lookup: {
               from: "menus",
               localField: "_id",
               foreignField: "categoryId",
               as: "menuItems"
            }
         },
         {
            $lookup: {
               from: "restaurants",
               localField: "_id",
               foreignField: "categoryId",
               as: "restaurants"
            }
         },
         {
            $project: {
               name: 1,
               slug: 1,
               publicId: 1,
               menuCount: { $size: "$menuItems" },
               restaurantCount: { $size: "$restaurants" },
               createdAt: 1,
               updatedAt: 1
            }
         },
         { $skip: (page - 1) * perPage },
         { $limit: perPage }
      ];

      const [categories, totalCount] = await Promise.all([
         CategoryModel.aggregate(pipeline),
         CategoryModel.countDocuments(query)
      ]);

      return {
         data: categories,
         meta: {
            page,
            perPage,
            total: totalCount,
            totalPages: Math.ceil(totalCount / perPage)
         }
      };
   }

   // For quick search suggestions
   static async searchCategories(search: string) {
      return CategoryModel.find(
         { name: { $regex: search, $options: "i" } },
         { name: 1, slug: 1, publicId: 1 }
      ).limit(10);
   }
}

export default CategoryService;