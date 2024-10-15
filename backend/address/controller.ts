import type { Request, Response } from "express";
import AddressModel from "./model";
import type { AuthDataType } from "../auth/model";
import SendResponse from "../libs/response-helper";

const AddressController = {
	async all(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as any;

		try {
			const address = await AddressModel.find({
				userId: user.publicId,
			}).select('-_id -updatedAt').sort({
				createdAt: -1,
			}); // Exclude these fields

			SendResponse.success(res, "Address retrieved successfully", address);
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async add(req: Request, res: Response): Promise<void> {
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

	async delete(req: Request, res: Response): Promise<void> {
		const address = res.locals.address;

		try {
			await AddressModel.findOneAndDelete({ publicId: address.publicId });
			SendResponse.success(res, "Address deleted successfully", {});
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},
};

export default AddressController;
