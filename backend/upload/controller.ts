import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import SendResponse from "../libs/response-helper";
import env from "../../config/env"; // To handle file deletion from the server (optional if you want to remove temp uploads)

// Set up Cloudinary configuration
cloudinary.config({
	cloud_name: env.CLOUDINARY_CLOUD_NAME,
	api_key: env.CLOUDINARY_API_KEY,
	api_secret: env.CLOUDINARY_API_SECRET,
});

const UploadController = {
	async image(req: Request, res: Response): Promise<void> {
		try {
			// Check if a file was uploaded
			if (!req.file) {
				SendResponse.badRequest(res, "No image file uploaded");
				return; // Exit the function if no file is uploaded
			}

			// Upload the file to Cloudinary
			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "defacto/restaurant", // Optional: organize images in a folder
			});

			// Optional: remove file from server after upload to Cloudinary
			fs.unlinkSync(req.file.path);

			// Generate an optimized URL
			const optimizedUrl = cloudinary.url(result.public_id, {
				transformation: [
					{ width: 800, crop: "scale" },
					{ fetch_format: "auto", quality: "auto" },
				],
			});

			// Return the image URL from Cloudinary
			SendResponse.success(res, "Image uploaded successfully", optimizedUrl);
		} catch (error: any) {
			console.error(error);
			SendResponse.serverError(res, error.message);
		}
	},
};

export default UploadController;