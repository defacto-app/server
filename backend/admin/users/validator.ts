import { z } from "zod";

// Schema definition
export const createUserSchema = z.object({
   email: z.string().email("Invalid email address"),
   phoneNumber: z.string()
      .min(11, "Phone number must be at least 11 digits")
      .max(15, "Phone number cannot exceed 15 digits"),
   firstName: z.string().min(1, "First name is required"),
   lastName: z.string().optional(),
   role: z.enum(["customer", "admin", "driver", "manager", "staff"], {
      errorMap: () => ({ message: "Invalid role selected" })
   }),
   password: z.string().min(8, "Password must be at least 8 characters")
});

// Types
type ValidationResponse = {
   success: boolean;
   data: z.infer<typeof createUserSchema> | null;
   errors: Record<string, string> | null;
};

// Validator
export const UserValidator = {
   validateCreate: async (body: any): Promise<ValidationResponse> => {
      try {
         const result = createUserSchema.safeParse(body);

         if (!result.success) {
            const formattedErrors = result.error.errors.reduce(
               (acc, error) => {
                  const path = error.path.join(".");
                  acc[path] = error.message;
                  return acc;
               },
               {} as Record<string, string>
            );

            return {
               success: false,
               data: null,
               errors: formattedErrors,
            };
         }

         return {
            success: true,
            data: result.data,
            errors: null,
         };
      } catch (error: any) {
         return {
            success: false,
            data: null,
            errors: { _error: error.message },
         };
      }
   },
};