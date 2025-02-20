import { Router } from "express";


import FileMiddleware from "../middleware/file.middleware";
import FileController from "../controllers/file.controller";

const router = Router();

router.put("/api/file/:fileId", FileMiddleware.fileId, FileController.delete);
router.get("/api/file/:fileId", FileMiddleware.fileId, FileController.get);

export default router;
