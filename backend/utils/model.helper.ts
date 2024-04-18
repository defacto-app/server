import { Request, Response } from "express";
import { Model } from "mongoose";

// Pagination helper interface
interface PaginationOptions {
   model: Model<any>;
   query: object;
   page: number;
   limit: number;
   searchString?: string;
   projection?: object;
   sortOptions?: object;
}

// Pagination helper function
export const paginateResults = async ({
   model,
   query,
   page,
   limit,
   searchString = "",
   projection = {},
   sortOptions = {},
}: PaginationOptions) => {
   // Escape special characters in search string
   const escapedSearchString = searchString.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
   );

   // Add search conditions to query
   if (searchString) {
      query["$or"] = [
         { name: { $regex: escapedSearchString, $options: "i" } },
         { description: { $regex: escapedSearchString, $options: "i" } },
      ];
   }

   // Calculate total count and skip
   const totalCount = await model.countDocuments(query);
   const skip = (page - 1) * limit;

   // Fetch data with conditions, projection, limit, and skip
   const data = await model.find(query, projection, {
      limit: limit,
      skip: skip,
      sort: sortOptions,
   });

   // Calculate last page
   const lastPage = Math.ceil(totalCount / limit);

   // Construct meta object
   const meta = {
      total: totalCount,
      perPage: limit,
      page: page,
      lastPage: lastPage,
   };

   return { meta, data };
};

// Example usage in an Express route handler
