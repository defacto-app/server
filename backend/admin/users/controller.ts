import type { Request, Response } from "express";
import SendResponse from "../../libs/response-helper";

import { UserService } from "./services";
import { UserValidator } from "./validator";
import AuthModel from "../../auth/model";

const AdminUserController = {
	async all(req: Request, res: Response): Promise<void> {
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 20;
		const search: string = (req.query.search as string) || "";

		try {
			// Delegate logic to the service
			const result = await UserService.getAllUsers({ page, perPage, search });
			SendResponse.success(res, "Users retrieved", result);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
	async create(req: Request, res: Response): Promise<void> {
		try {
			// Use the validator
			const validationResult = await UserValidator.validateCreate(req.body);

			if (!validationResult.success || !validationResult.data) {
				SendResponse.badRequest(
					res,
					"Invalid input data",
					validationResult.errors,
				);
				return;
			}

			// Check if user already exists using validated data
			const existingAuth = await AuthModel.findOne({
				$or: [
					{ email: validationResult.data?.email },
					{ phoneNumber: validationResult.data?.phoneNumber },
				],
			});

			if (existingAuth) {
				SendResponse.conflict(
					// Changed to conflict instead of badRequest for better semantics
					res,
					"User with this email or phone number already exists",
				);
				return;
			}

			// Create the user with validated data
			const { user } = await UserService.createUser(validationResult.data);

			SendResponse.created(res, "User created successfully", {
				user: {
					userId: user.userId,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
				},
			});
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
	async delete(req: Request, res: Response): Promise<void> {
		const { userId } = req.params; // Extract userId from request params

		try {
			// Delegate deletion logic to the service
			const result = await UserService.deleteUser(userId);

			if (!result.userDeleted) {
				SendResponse.notFound(res, "User not found");
			}

			SendResponse.success(
				res,
				"User and authentication record deleted successfully",
			);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
};

export default AdminUserController;
