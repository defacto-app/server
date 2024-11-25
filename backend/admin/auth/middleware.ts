import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../services/jwt.service";
import AuthModel from "../../auth/model";


class AuthMiddleware {

	public async validateAdmin(req: Request, res: Response, next: NextFunction) {
		const authorization = req.headers.authorization as string;

		if (!authorization) {
			return res.status(401).json({ error: "Authorization token required" });
		}

		const token = authorization.split(" ")[1];

		try {
			const data = await verifyToken(token);

			if (!data) {
				return res.status(401).json({ error: "invalid token" });
			}


			const user = await AuthModel.findById(data.id, {
				password: 0,
				createdAt: 0,
				updatedAt: 0,
			});

			if (!user) {
				return res.status(401).json({ error: "invalid token" });
			}

			if (user.role !== "admin") {
				return res.status(401).json({ error: "Unauthorized" });
			}

			res.locals.user = user;

			// update last seen

			return next();
		} catch (error) {
			return res.status(401).json({ error: "Invalid token" });
		}
	}

	public async authorizeRoles(req: Request, res: Response, next: NextFunction) {
		const user = res.locals.user as any;

		if (user.role === "admin") {
			return next();
		}

		return res.status(401).json({ error: "Unauthorized" });
	}


}

// Additional methods for loading user, checking admin rights, etc., can be added here

export default new AuthMiddleware();
