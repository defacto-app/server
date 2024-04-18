import Joi from "joi";

export default {
   contact: async function (body: any) {
      const schema = Joi.object({
         title: Joi.string().min(2).messages({
            "string.base": `Title should be a type of 'text'`,
            "string.empty": `Title  cannot be empty`,
            "string.min": `Title  should have a minimum length of {#limit}`,
            "any.required": `Title  is required`,
         }),

         email: Joi.string().email().required().messages({}),
         name: Joi.string()
            .required()
            .messages({
               "string.base": `Name should be a type of 'text'`,
               "string.empty": `Name  cannot be empty`,
               "string.min": `Name  should have a minimum length of {#limit}`,
               "any.required": `Name  is required`,
            })
            .max(255)
            .min(2),
         message: Joi.string()
            .required()
            .messages({
               "string.base": `Message should be a type of 'text'`,
               "string.empty": `Message  cannot be empty`,
               "string.min": `Message  should have a minimum length of {#limit}`,
               "any.required": `Message  is required`,
            })
            .max(255)
            .min(10),
      });

      try {
         const value = await schema.validateAsync(body, { abortEarly: false });

         return { value };
      } catch (e: any) {
         const errors = e.details.reduce((acc: any, detail: any) => {
            acc[detail.context.key] = detail.message;
            return acc;
         }, {});

         return { errors };
      }
   },
};
