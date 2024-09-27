import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { $file } from "../../config/config";
import fs from "node:fs";
import moment from "moment";
import FileModel from "../model/files.model";

// Define storage for multer

class FileMiddleware {
	public async fileId(req: Request, res: Response, next: NextFunction) {
		try {
			const fileId = req.params.fileId;

			if (!fileId) {
				return res.status(400).json({ error: "Application ID is required" });
			}

			const file = await FileModel.findOne({
				publicId: fileId,
			});

			if (!file) {
				return res.status(404).json({
					message: "Your does not exist",
				});
			}

			res.locals.file = file;

			next();
		} catch (error: any) {
			return res.status(500).json({ error: error.message });
		}
	}

	public async upload(req: Request, res: Response, next: NextFunction) {
		const { uploadLabel } = req.query as any;

		enum UploadLabel {
			ProjectImage = "projectImage",
			TeamImage = "teamImage",
			// Add more labels as needed
		}

		function getPath(uploadLabel: UploadLabel): string {
			switch (uploadLabel) {
				case "projectImage":
					return "projects";
				case "teamImage":
					return "teams";
				default:
					return "other"; // You can set a default folder or handle other labels as needed
			}
		}

		const selected = getPath(uploadLabel) as string;

		try {
			const storage = multer.diskStorage({
				destination: (req, file, cb) => {
					const folderPath = `${$file[selected]}/${moment().format("YYYY-MM-DD")}`;

					if (!fs.existsSync(folderPath)) {
						fs.mkdirSync(folderPath, { recursive: true });
					}

					cb(null, folderPath);
				},
				filename: (req, file, cb) => {
					cb(null, `${Date.now()}-${file.originalname}`); // Set filename
				},
			});

			const upload = multer({ storage: storage });

			upload.single("generic-file")(req, res, (err: any) => {
				if (err) {
					return res.status(400).json({ error: err.message });
				}
				next();
			});
		} catch (error: any) {
			return res.status(500).json({ error: error.message });
		}
	}
}
export default new FileMiddleware();
