import type { Request, Response } from "express";

import FilesModel from "../model/files.model";

const FileController = {
	async get(req: Request, res: Response): Promise<void> {
		const file = res.locals.file as any;

		try {
			res.status(200).json(file);
		} catch (e) {
			res.status(500).json({
				error: e,
			});
		}
	},

	async delete(req: Request, res: Response): Promise<void> {
		const file = res.locals.file as any;

		try {
			await FilesModel.updateOne(
				{
					publicId: file.publicId,
				},
				{
					$set: { deleted: true },
				},
				{
					new: true,
				},
			);
			// update the application filed and set the file to null

			res.status(200).json({
				message: "File Deleted",
				className: "text-red-500",
			});
		} catch (e) {
			res.status(500).json({
				error: e,
			});
		}
	},
};

export default FileController;
