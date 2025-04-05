import express from "express";
const router=express.Router();

import registrarRouter from "./registrar.js"
import judgeRouter from "./judge.js"
import lawyerRouter from "./lawyer.js"

router.use("/registrar",registrarRouter);
router.use("/judge",judgeRouter);
router.use("/lawyer",lawyerRouter);

export default router;