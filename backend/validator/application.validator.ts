import Joi from "joi";

export default {
	update: async (body: any) => {
		const schema = Joi.object({
			firstName: Joi.string().min(2).messages({
				"string.base": `First Name should be a type of 'text'`,
				"string.empty": `First Name cannot be empty`,
				"string.min": `First Name should have a minimum length of {#limit}`,
				"any.required": `First Name is required`,
			}),
			lastName: Joi.string().min(2).messages({
				"string.base": `Last Name should be a type of 'text'`,
				"string.empty": `Last Name cannot be empty`,
				"string.min": `Last Name should have a minimum length of {#limit}`,
				"any.required": `Last Name is required`,
			}),
			email: Joi.string().email().messages({
				"string.email": `Invalid email address`,
				"string.empty": `Email cannot be empty`,
			}),
			appliedPosition: Joi.string().min(2).messages({
				"string.base": `Applied Position should be a type of 'text'`,
				"string.empty": `Applied Position cannot be empty`,
				"string.min": `Applied Position should have a minimum length of {#limit}`,
				"any.required": `Applied Position is required`,
			}),

			phoneNumber: Joi.string().min(10).messages({
				"string.base": `Phone number should be a type of 'text'`,
				"string.empty": `Phone number cannot be empty`,
				"string.min": `Phone number should have a minimum length of {#limit}`,
				"any.required": `Phone number is required`,
			}),
			startDate: Joi.date().greater("now").messages({
				"date.base": `Start Date should be a valid date`,
				"date.greater": `Start Date must be a future date`,
			}),
			interviewDate: Joi.date().greater("now").messages({
				"date.base": `Interview Date should be a valid date`,
				"date.greater": `Interview Date must be a future date`,
			}),
			resume: Joi.number().min(1).messages({
				"number.base": `Resume should be a number`,
				"number.min": `Resume is required`,
			}),
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
