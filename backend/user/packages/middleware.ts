import type { NextFunction, Request, Response } from "express";
import PackageModel from "../../model/package.model";
import SendResponse from "../../libs/response-helper";

class PackageMiddleware {

	public async userPackages(req: Request, res: Response, next: NextFunction) {
		const user = res.locals.user as any;

		const { status } = req.query;

		try {
			// Execute the query
			res.locals.packages = await PackageModel.find(
				{
					userId: user.userId,
					status: status || { $ne: 0 },
				},

				{
					status: 1,
					createdAt: 1,
					publicId: 1,
					"dropOffDetails.location": 1,
					charge: 1,
				},
				{
					sort: { createdAt: -1 },
					limit: 10,
				},
			);

			next();
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}

	public async packageId(req: Request, res: Response, next: NextFunction) {

		const user = res.locals.user as any;
		const packageId = req.params.packageId;

		try {
			if (!packageId) {
				return res.status(400).json({ error: "packageId  is required" });
			}

			// Execute the query
			const pkg = await PackageModel.findOne({
				publicId: packageId,
				userId: user.userId,
			});

			if (!pkg) {
				SendResponse.notFound(
					res,
					`Sorry, package  ${packageId} is deleted or doesnt exist `,
				);
			}

			res.locals.packageItem = pkg;

			next();

		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}
}

export default new PackageMiddleware();
