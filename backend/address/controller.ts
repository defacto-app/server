import type { Request, Response } from "express";
import AddressModel from "./model";
import type { AuthDataType } from "../auth/model";
import SendResponse from "../libs/response-helper";

const AddressController = {
	async all(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as any;
		console.log(user.publicId, "user");

		try {
			const address = await AddressModel.find({
				userId: user.publicId,
			});

			res.json({
				message: "Address retrieved successfully.",
				success: true,
				address,
				timestamp: new Date(),
			});
		} catch (error: any) {
			// biome-ignore lint/style/useTemplate: <explanation>
			res.status(500).send("Error Fetching  order: " + error.message);
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
			SendResponse.success(res, "New address added", {});
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
	}


};

export default AddressController;
