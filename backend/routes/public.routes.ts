import { Router } from "express";

const router = Router();

router.get("/google-places", (req, res) => {
	res.send("Google Places API wow !!");
});

export default router;
