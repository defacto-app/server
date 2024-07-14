import type { NextFunction, Request, Response } from "express";

import PackageModel from "../model/package.model";
import SendResponse from "../libs/response-helper";

class SlugMiddleware {
	public async packageId(req: Request, res: Response, next: NextFunction) {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			SendResponse.serverError(res, error.message);
		}
	}
}

export default new SlugMiddleware();
