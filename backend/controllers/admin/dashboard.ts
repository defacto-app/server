import type { Request, Response } from "express";


import AuthModel from "../../auth/model";

const Dashboard = {
	async all_users(req: Request, res: Response): Promise<void> {
		try {
			const users = await AuthModel.find({});

			res.status(200).json(users);
		} catch (e) {
			res.status(500).json({
				error: e,
			});
		}
	},
};

export default Dashboard;
