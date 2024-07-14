import type { Request, Response } from "express";
import type { AuthDataType } from "../../auth/model";
import PackageModel, { type PackageDataType } from "../../model/package.model";
import SendResponse from "../../libs/response-helper";
import PackageValidator from "./validator";
import paginate from "../../utils/pagination";

const PackageController = {
	async all(req: Request, res: Response): Promise<void> {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const user = res.locals.user as any;

		// Extract page and perPage from request query. Set default values if not provided.
		const page: number = Number.parseInt(req.query.page as string) || 1;
		const perPage: number = Number.parseInt(req.query.perPage as string) || 10;
		const query = { userId: user.userId };
		const projection = {
			"dropOffDetails._id": 0,
			"dropOffDetails.label": 0, // Ensure this field exists or remove if not necessary
			"dropOffDetails.createdAt": 0,
			"dropOffDetails.updatedAt": 0,
			"dropOffDetails.userId": 0,
			"pickupDetails._id": 0,
			"pickupDetails.label": 0, // Ensure this field exists or remove if not necessary
			"pickupDetails.userId": 0,
			"pickupDetails.createdAt": 0,
			"pickupDetails.updatedAt": 0,
			userId: 0,
			_id: 0,
			__v: 0, // Exclude the version key if not already done by default
		};
		try {
			const paginationResult = await paginate(
				PackageModel,
				page,
				perPage,
				query,
				projection,
			);

			SendResponse.success(res, "Packages retrieved", paginationResult);
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async create(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as AuthDataType;

		const newPackage = new PackageModel({
			userId: user.publicId,
			...req.body,
		});

		await newPackage.save();

		try {
			// Send the updated user back to the client\
			SendResponse.success(res, "Created New Package Delivery.", {
				packageId: newPackage.publicId,
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			// Handle possible errors
			SendResponse.serverError(res, error.message);
		}
	},

	async one(req: Request, res: Response): Promise<void> {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const data = res.locals.packageItem as any;

		try {
			SendResponse.success(res, "Package retrieved", data);
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	},

	async update(req: Request, res: Response): Promise<void> {
		const { error } = await PackageValidator.update(req.body);

		if (error) {
			SendResponse.validationError(res, error);
			return;
		}

		const data = res.locals.packageItem as PackageDataType;

		try {
			SendResponse.success(res, "Package delivery updated successfully.", data);
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			res.status(500).send(`Error Updating  order: ${error.message}`);
		}
	},

	async delete(req: Request, res: Response): Promise<void> {
		const data = res.locals.packageItem as PackageDataType;

		await PackageModel.findOneAndDelete({
			publicId: data.publicId,
		});

		try {
			res.json({
				message: "Package deleted.",
				success: true,
				timestamp: new Date(),
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			res.status(500).send(`Error Deleting  order: ${error.message}`);
		}
	},
};

export default PackageController;
