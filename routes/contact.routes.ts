import { Router } from "express";
import { getAll, identify } from "../controllers/contact.controller";
import { clear } from "console";

const router = Router();

router.post("/", identify);

// this path were added to easily test
// it's a feature not a bug 😁
router.get("/", getAll);



export default router;