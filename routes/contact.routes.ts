import { Router } from "express";
import { clearAll, getAll, identify } from "../controllers/contact.controller";

const router = Router();

router.post("/", identify);

router.get("/", getAll);
router.delete("/clear", clearAll);

export default router;