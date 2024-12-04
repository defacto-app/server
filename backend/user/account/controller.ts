import SendResponse from "../../libs/response-helper";
import type { Request, Response } from "express";
import UserModel from "../model";
/*import AddressModel from "../../address/model";
import type { AuthDataType } from "../../auth/model";*/

const AccountController = {
/*	async getAccountDetails(req: Request, res: Response): Promise<void> {
		try {
			const user = res.locals.user as any;

			SendResponse.success(res, "User account retrieved", user);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},*/

	async updateAccountDetails(req: Request, res: Response): Promise<void> {
		try {
			const user = res.locals.user;
			const { phoneNumber } = req.body;

			// First validate the phone number format
			if (!phoneNumber || !/^\d{11,15}$/.test(phoneNumber)) {
				throw new Error(
					"Invalid phone number format. Must be between 11 and 15 digits",
				);
			}

			// Get the current user first to check if they already have a phone number
			const currentUser = await UserModel.findOne({ publicId: user.publicId });
			if (!currentUser) {
				throw new Error("User not found");
			}

			// Check if phone number is already in use by someone else
			const existingUser = await UserModel.findOne({
				phoneNumber: phoneNumber,
				publicId: { $ne: user.publicId }, // Exclude current user
			});

			if (existingUser) {
				throw new Error("Phone number is already in use by another user");
			}

			// Update the user's phone number
			const updatedUser = await UserModel.findOneAndUpdate(
				{ publicId: user.publicId },
				{ $set: { phoneNumber } },
				{
					new: true,
					runValidators: true,
				},
			);

			// Determine if this was an add or update operation
			const successMessage = currentUser.phoneNumber
				? "Phone number updated successfully"
				: "Phone number added successfully";

			SendResponse.success(res, successMessage, updatedUser);
		} catch (error: any) {
			SendResponse.badRequest(
				res,
				error.message || "Failed to process phone number",
				error,
			);
		}
	},
/*	async allAddress(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as any;

		try {
			const address = await AddressModel.find({
				userId: user.publicId,
			})
				.select("-_id -updatedAt")
				.sort({
					createdAt: -1,
				}); // Exclude these fields

			SendResponse.success(res, "Address retrieved successfully", address);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async addAddress(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as AuthDataType;
		console.log(user.publicId, "user");

		const newAddress = new AddressModel({
			userId: user.publicId,
			...req.body,
		});

		await newAddress.save();

		try {
			SendResponse.success(res, "New address added", newAddress);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async deleteAddress(req: Request, res: Response): Promise<void> {
		const address = res.locals.address;

		try {
			await AddressModel.findOneAndDelete({ publicId: address.publicId });
			SendResponse.success(res, "Address deleted successfully", {});
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},*/
};

export default AccountController;
