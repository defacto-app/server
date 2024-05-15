import { z } from "zod";




const CoordinatesSchema = z.object({
   lat: z.number(),
   lng: z.number(),
});

const ContactDetailsSchema = z.object({
   name: z.string(),
   phone: z.string(),
   email: z.string().email(),
   address: z.string(),
   location: z.string(),
   cordinates: CoordinatesSchema,
});

const CashAvailableSchema = z.object({
   available: z.boolean(),
   amount: z.number(),
});

const PackageContentSchema = z.array(z.string());
export default {




   update_package: async function (body: any) {
      const bodySchema = z.object({
         name: z.string().min(2),
         description: z.string().min(10),
         price: z.number().min(1),
         content: PackageContentSchema,
         available: z.boolean(),

      });

      const result = bodySchema.safeParse(body);
      if (!result.success) {
         const formattedErrors: any = {};
         result.error.errors.forEach((error) => {
            const fieldName = error.path[0];
            formattedErrors[fieldName] = error.message;
         });

         return { data: null, error: formattedErrors };
      }

      return { data: result.data, error: null };
   }
};
