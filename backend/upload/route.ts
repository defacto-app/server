import express from 'express';
import multer from 'multer';
import UploadController from "./controller"; // To handle file uploads

const upload = multer({ dest: 'uploads/' }); // Temporary location to store uploaded files
const router = express.Router();

// Image upload route
router.post("/image", upload.single("image"), UploadController.image);

export default router;
