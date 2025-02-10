import { Router } from "express";
import { identify } from "../controllers/contact.controller";
import { clear } from "console";

const router = Router();

router.post("/", identify);

router.post("/clear", clear);

export default router;