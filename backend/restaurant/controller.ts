import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import RestaurantModel from "./model";
import MenuModel from "../menu/model";
import CategoryModel from "../admin/restaurant/category/model";
import OrderModel from "../admin/order/model";

const RestaurantController = {
   async all(req: Request, res: Response): Promise<void> {
      try {
         const page: number = Number.parseInt(req.query.page as string) || 1;
         const perPage: number = Number.parseInt(req.query.perPage as string) || 9;
         const search: string = (req.query.search as string) || "";
         const category: string = (req.query.category as string) || "";
         const dietary: string[] = (req.query.dietary as string || "").split(",").filter(Boolean);
         const quickFilter: string = (req.query.quickFilter as string) || "";
         const sortBy: string = (req.query.sort as string) || "recommended";
         const priceRange: string = (req.query.priceRange as any) || "";

         // Initial match stage for basic restaurant filters
         const initialMatchStage: any = {};

         // Dietary filters
         if (dietary.length > 0) {
            initialMatchStage.dietaryOptions = { $all: dietary };
         }

         // Quick filters
         if (quickFilter === "under-30") {
            initialMatchStage["deliveryTime.max"] = { $lte: 30 };
         } else if (quickFilter === "top-rated") {
            initialMatchStage.rating = { $gte: 4.5 };
         }

         // Sort configuration
         let sortStage = {};
         switch (sortBy) {
            case "rating-high":
               sortStage = { rating: -1 };
               break;
            case "rating-low":
               sortStage = { rating: 1 };
               break;
            case "delivery-time":
               sortStage = { "deliveryTime.min": 1 };
               break;
            default:
               sortStage = { rating: -1, "deliveryTime.min": 1 }; // Default recommended sort
         }

         const pipeline = [
            // Initial restaurant filters
            ...(Object.keys(initialMatchStage).length > 0 ? [{ $match: initialMatchStage }] : []),

            // Lookup menu items
            {
               $lookup: {
                  from: "menus",
                  let: { restaurantId: "$publicId" },
                  pipeline: [
                     {
                        $match: {
                           $expr: { $eq: ["$parent", "$$restaurantId"] },
                           ...(category ? { categoryId: { $exists: true } } : {})
                        }
                     }
                  ],
                  as: "menuItems"
               }
            },

            // Only if category is specified, do category lookups and filtering
            ...(category ? [
               // Unwind menu items
               {
                  $unwind: {
                     path: "$menuItems",
                     preserveNullAndEmptyArrays: false // Remove restaurants with no matching menu items
                  }
               },
               // Lookup categories
               {
                  $lookup: {
                     from: "categories",
                     let: { categoryId: "$menuItems.categoryId" },
                     pipeline: [
                        {
                           $match: {
                              $expr: { $eq: ["$publicId", "$$categoryId"] }
                           }
                        }
                     ],
                     as: "menuItems.category"
                  }
               },
               // Match category name
               {
                  $match: {
                     "menuItems.category.name": {
                        $regex: `^${category}$`,
                        $options: "i"  // Case-insensitive match
                     }
                  }
               },
               // Group back to restaurants
               {
                  $group: {
                     _id: "$_id",
                     doc: { $first: "$$ROOT" }
                  }
               },
               {
                  $replaceRoot: { newRoot: "$doc" }
               }
            ] : []),

            // Price range filter
            ...(priceRange ? [{
               $match: {
                  "menuItems.price": priceRanges[priceRange] || {}
               }
            }] : []),

            // Search filter
            ...(search ? [{
               $match: {
                  $or: [
                     { name: { $regex: search, $options: "i" } },
                     { "menuItems.name": { $regex: search, $options: "i" } }
                  ]
               }
            }] : []),

            // Apply sorting
            { $sort: sortStage },

            // Pagination facet
            {
               $facet: {
                  metadata: [{ $count: "total" }],
                  data: [{ $skip: (page - 1) * perPage }, { $limit: perPage }]
               }
            }
         ];

         // For debugging
         console.log('Category filter:', category);
         console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

         const result = await RestaurantModel.aggregate(pipeline);
         const total = result[0]?.metadata[0]?.total || 0;
         const restaurants = result[0]?.data || [];

         const response = {
            meta: {
               page,
               perPage,
               total,
               totalPages: Math.ceil(total / perPage)
            },
            data: restaurants
         };

         SendResponse.success(res, "Restaurants retrieved", response);
      } catch (error: any) {
         console.error('Aggregation error:', error);
         SendResponse.serverError(res, error.message);
      }
   }
,
   async filters(req: Request, res: Response) {
      try {
         // 1. Get distinct category publicIds from the Restaurant model

         // 3. Build your categories array (id = publicId, name = actual category name)

         // 4. Fetch active menu categories separately (assuming these are "menu" type)
         const menuCategoriesDocs = await CategoryModel.find(
            { active: true, categoryType: "menu" },
            { name: 1, slug: 1, publicId: 1, _id: 0 }
         ).lean();

         const menuCategories = menuCategoriesDocs.map((cat) => ({
            id: cat.publicId,
            name: cat.name,
         }));

         // 5. Get min and max prices from menu items for the price range
         const menuStats = await MenuModel.aggregate([
            { $match: { isDeleted: false, available: true } },
            {
               $group: {
                  _id: null,
                  minPrice: { $min: "$price" },
                  maxPrice: { $max: "$price" },
               },
            },
         ]);

         // 6. Define any static filter options
         const dietaryOptions = [
            { id: "vegetarian", name: "Vegetarian" },
            { id: "vegan", name: "Vegan" },
            { id: "gluten-free", name: "Gluten-free" },
            { id: "halal", name: "Halal" },
         ];

         const sortOptions = [
            { id: "recommended", name: "Recommended" },
            { id: "rating-high", name: "Rating: High to Low" },
            { id: "rating-low", name: "Rating: Low to High" },
            { id: "price-low", name: "Price: Low to High" },
            { id: "price-high", name: "Price: High to Low" },
            { id: "delivery-time", name: "Delivery Time" },
         ];

         const quickFilters = [
            { id: "under-30", name: "Under 30 mins" },
            { id: "top-rated", name: "Top Rated" },
         ];

         // 7. Construct price ranges from minPrice/maxPrice
         const { minPrice = 0, maxPrice = 100 } = menuStats[0] || {};
         const priceRanges = [
            {
               id: "budget",
               name: "Budget",
               min: minPrice,
               max: minPrice + (maxPrice - minPrice) * 0.33,
            },
            {
               id: "moderate",
               name: "Moderate",
               min: minPrice + (maxPrice - minPrice) * 0.33,
               max: minPrice + (maxPrice - minPrice) * 0.66,
            },
            {
               id: "premium",
               name: "Premium",
               min: minPrice + (maxPrice - minPrice) * 0.66,
               max: maxPrice,
            },
         ];

         // 8. Final response data
         const filtersData = {
            menuCategories,
            dietary: dietaryOptions,
            priceRanges,
            sort: sortOptions,
            quickFilters,
         };

         // 9. Send the response
         SendResponse.success(
            res,
            "Filters generated successfully",
            filtersData
         );
      } catch (error) {
         const errorMessage =
            error instanceof Error
               ? error.message
               : "An error occurred while generating filters";
         SendResponse.serverError(res, errorMessage);
      }
   },

   async one(req: Request, res: Response): Promise<void> {
      const data = res.locals.restaurantItem as any;
      const searchQuery = req.query.search as string;
      const categoryId = req.query.categoryId as string;

      try {
         // Fetch active menu categories first
         const categories = await CategoryModel.find({
            categoryType: "menu",
            active: true,
         })
            .select("_id publicId name slug") // Add publicId to selection
            .sort("name");

         // Build search conditions
         const searchConditions: any = {
            parent: data.publicId,
         };

         // Add search query if provided
         if (searchQuery) {
            searchConditions.name = { $regex: searchQuery, $options: "i" };
         }

         // Add category filter if provided
         if (categoryId) {
            searchConditions.categoryId = categoryId;
         }

         // Fetch menu items
         const menuItems = await MenuModel.aggregate([
            { $match: searchConditions },
            {
               $lookup: {
                  from: "categories",
                  localField: "categoryId",
                  foreignField: "publicId", // Use publicId for lookup
                  as: "category",
               },
            },
            {
               $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
            },
            {
               $project: {
                  _id: 1,
                  name: 1,
                  slug: 1,
                  price: 1,
                  available: 1,
                  image: 1,
                  publicId: 1,
                  parent: 1,
                  categoryId: 1,
                  "category._id": 1,
                  "category.publicId": 1,
                  "category.name": 1,
                  "category.slug": 1,
               },
            },
            { $sort: { name: 1 } },
         ]);

         // Filter menu items to only include those with a valid category
         const validMenuItems = menuItems.filter((item: any) => item.category);

         // Collect category IDs from valid menu items
         const categoryIdsWithItems = new Set(
            validMenuItems.map((item: any) => item.category.publicId)
         );

         // Filter categories to include only those with associated menu items
         const filteredCategories = categories.filter((category) =>
            categoryIdsWithItems.has(category.publicId)
         );

         SendResponse.success(res, "Restaurant and menu retrieved", {
            restaurant: data,
            menu: validMenuItems,
            categories: filteredCategories,
         });
      } catch (error: any) {
         console.error("Restaurant controller error:", error);
         SendResponse.serverError(res, error.message);
      }
   },

   async categories(req: Request, res: Response): Promise<void> {
      try {
         // Extract search query from request query params
         const search = (req.query.search as string) || "";

         // Build the query object to filter active categories
         const query: any = { active: true };

         // If search is provided, add a regex filter to search in the 'name' field
         if (search) {
            query.name = { $regex: search, $options: "i" }; // 'i' for case-insensitive
         }

         // Find categories with the query (filtered by search and active status)
         const categories = await CategoryModel.find(
            query,
            "slug name description"
         );

         SendResponse.success(res, "Categories retrieved", categories);
      } catch (error: any) {
         SendResponse.serverError(res, error.message);
      }
   },

   async order(req: Request, res: Response): Promise<void> {
      const user = res.locals.user as any;
      try {
         // Step 1: Validate the request payload using the CreateOrderSchema
         const value = req.body;

         // Step 2: Extract data from validated request payload
         const {
            userId,
            dropOffDetails,
            pickupDetails,
            deliveryCharge,
            restaurantOrder,
            charge,
            description,
            cashPaymentLocation,
         } = value;

         console.log({ user, value });

         // Step 3: Create a new order document for a restaurant order
         const newOrder = new OrderModel({
            type: "food",
            userId,
            dropOffDetails,
            pickupDetails,
            charge,
            status: "pending", // Initial status of the order
            description,
            cashPaymentLocation,
            deliveryCharge,
            isInstant: true,
            restaurantOrder: restaurantOrder.map((item: any) => ({
               name: item.name,
               quantity: item.quantity,
               price: item.price,
            })),
         });

         // Step 4: Save the order to the database
         await newOrder.save();

         // Step 5: Send success response with the created order
         SendResponse.created(res, "Order created successfully");
      } catch (error) {
         console.error("Error creating order:", error);
         // Step 6: Handle any server errors and send a 500 response
         SendResponse.serverError(res, "Error creating order");
      }
   },
};

export default RestaurantController;
//
//
//
//
