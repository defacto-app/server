import type { Request, Response } from "express";
import axios from "axios";
import env from "../../config/env";

const PublicController = {
	async google_api(req: Request, res: Response): Promise<void> {
		const { input } = req.query;

		console.log("input", input);
		try {
			const response = await axios.get(
				// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
				`https://maps.googleapis.com/maps/api/place/autocomplete/json`,
				{
					params: {
						input,
						key: env.GOOGLE_MAPS_API_KEY,
					},
				},
			);

			res.json(response.data);
		} catch (error) {
			res.status(500).send("Error fetching places");
		}
	},
};

export default PublicController;
