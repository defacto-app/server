import type { Request, Response } from "express";
import UserModel from "../../user/model";
import SendResponse from "../../libs/response-helper";

const UserController = {
	async updateUser(req: Request, res: Response): Promise<void> {
		const user = res.locals.user as any;

		try {
			const updatedUser = await UserModel.findOneAndUpdate(
				{ userId: user?.userId },
				{
					$set: req.body,
					updated_at: new Date(),
				},
				{ new: true },
			);

			if (!updatedUser) {
				SendResponse.notFound(res, "User not found");
			}

			SendResponse.success(res, "User updated successfully", {});
		} catch (error: any) {
			// Handle possible errors
			SendResponse.serverError(res, error.message);
			res.status(500).send(`Error updating user: ${error.message}`);
		}
	},
};

export default UserController;
