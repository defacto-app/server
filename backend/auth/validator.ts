import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";
import type { authBodyType } from "../../types";
import {
	formatErrors,
	PhoneNumberSchema,
} from "../validator/validation-helper";

const ngnError = "Invalid  Nigerian format phone number eg. +2348062516716";

export default {
	email_register: async (body: authBodyType) => {
		try {
			const registerSchema = z.object({
				email: z
					.string()
					.email({ message: "Invalid email address." })
					.optional(),
				password: z.string().min(6, {
					message: "Password must be at least 6 characters long.",
				}),
			});

			const result = registerSchema.safeParse(body);

			// if there are errors, return the errors

			if (!result.success) {
				const formattedErrors: any = {};
				result.error.errors.forEach((error) => {
					const fieldName = error.path[0];
					formattedErrors[fieldName] = error.message;
				});
				return { data: null, error: formattedErrors };
			}

			// if there are no errors, return the data

			return { data: result.data, error: null };
		} catch (e: any) {
			return { data: null, error: e.message };
		}
	},
	admin_login: async (body: authBodyType) => {
		try {
			const registerSchema = z.object({
				email: z
					.string()
					.email({ message: "Invalid email address." })
					.optional(),
				otp: z.string().min(6, {
					message: "OTP must be at least 6 characters long.",
				}),
			});

			const result = registerSchema.safeParse(body);

			// if there are errors, rPeturn the errors

			if (!result.success) {
				const formattedErrors: any = {};
				result.error.errors.forEach((error) => {
					const fieldName = error.path[0];
					formattedErrors[fieldName] = error.message;
				});
				return { data: null, error: formattedErrors };
			}

			// if there are no errors, return the data

			return { data: result.data, error: null };
		} catch (e: any) {
			return { data: null, error: e.message };
		}
	},

	email_login: async (body: authBodyType) => {
		const loginSchema = z.object({
			email: z.string().email({ message: "Invalid email address." }),
			password: z.string().min(6, {
				message: "Password must be at least 6 characters long.",
			}),
		});

		const result = loginSchema.safeParse(body);

		if (!result.success) {
			const formattedErrors: any = {};
			result.error.errors.forEach((error) => {
				const fieldName = error.path[0];
				formattedErrors[fieldName] = error.message;
			});
			return { data: null, error: formattedErrors };
		}

		return { data: result.data, error: null };
	},
	phone_login: async (body: any) => {
		try {
			// Define the authBodyType using Zod to ensure both phoneNumber and password are included
			const AuthBodySchema = z.object({
				phoneNumber: z.string().nonempty({
					message: "Phone number is required.",
				}),
				otp: z.string().length(6, {
					message: "OTP must be exactly 6 characters long.",
				}),
			});
			// Validate the initial schema
			const result = AuthBodySchema.safeParse(body);
			if (!result.success) {
				const formattedErrors = formatErrors(result.error.errors);

				return { data: null, error: formattedErrors };
			}

			// Parse and validate the phone number
			const { phoneNumber } = result.data;
			const parsedNumber = parsePhoneNumberFromString(phoneNumber, "NG"); // NG for Nigeria
			if (!parsedNumber?.isValid()) {
				return {
					data: null,
					error: {
						phoneNumber: ngnError,
					},
				};
			}

			return {
				data: {
					phoneNumber: parsedNumber.number, // or parsedNumber.formatInternational() for a formatted number
					otp: result.data.otp,
				},
				error: null,
			};
		} catch (e: any) {
			return { data: null, error: e.message };
		}
	},

	phone_number: async (body: any) => {
		const result = PhoneNumberSchema.safeParse(body);
		if (!result.success) {
			const formattedErrors = formatErrors(result.error.errors);

			return { data: null, error: formattedErrors };
		}
		const { phoneNumber } = result.data;
		try {
			const parsedNumber = parsePhoneNumberFromString(phoneNumber, "NG"); // 'NG' is the country code for Nigeria
			if (parsedNumber && !parsedNumber.isValid()) {
				return {
					data: null,
					error: {
						phoneNumber: ngnError,
					},
				};
			}
			const data = {
				phoneNumber: parsedNumber?.number,
				country: parsedNumber?.country,
				valid: true,
			};

			return { data, error: null };
		} catch (e: any) {
			return { data: null, error: e.message };
		}
	},

	email_address: async (body: any) => {
		const emailSchema = z.object({
			email: z.string().email({ message: "Invalid email address." }),
		});

		const result = emailSchema.safeParse(body);
		if (!result.success) {
			const formattedErrors: any = {};
			result.error.errors.forEach((error) => {
				const fieldName = error.path[0];
				formattedErrors[fieldName] = error.message;
			});

			return { data: null, error: formattedErrors };
		}

		return { data: result.data, error: null };
	},
};
