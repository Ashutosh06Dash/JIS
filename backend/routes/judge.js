import express from "express"
const router=express.Router();
import jwt from "jsonwebtoken"
import z from 'zod';
import bodyParser from 'body-parser';
import  authMiddleware  from "../middleware.js";
import bcrypt from 'bcrypt';
import { PrismaClient,Role,CaseStatus } from "@prisma/client"
import prisma from "../prisma/client.js"
const app=express();
app.use(express.json());
app.use(bodyParser);

const logInInput=z.object({
    userName:z.string(),
    password :z.string().min(8)
})

const caseQueryInput = z.object({
    status: z.string().optional(),
    date: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date"
    }).optional(),
    caseId: z.string().optional()
})

router.post("/login", async(req,res)=>{
    const body=req.body
    const validation=logInInput.safeParse(body)

    if(!validation.success){
        return res.status(411).json({
            message:"Incorrect Data"
        })
        
    }
    try{
        const user=await prisma.user.findUnique({where:{userName:body.userName}})
        
        if (!user || user.role !== Role.JUDGE) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }
        const passwordWithPepper = body.password + process.env.PEPPER;
        const isPasswordValid = await bcrypt.compare(passwordWithPepper, user.password);
        if(!isPasswordValid){
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        
        const token=jwt.sign({userName: user.userName,role:user.role},process.env.JWT_SECRET,{ expiresIn: '1h' });
        return res.status(200).json({
            token:token
        });
    }
    catch(err){
        return res.status(400).json({
            message:err
        });
    }
})

router.get("/cases/pending", authMiddleware, async (req, res) => {
    try {
        const { date } = req.query;
        let filter = { status: CaseStatus.PENDING};
        if (date) {
            const selectedDate = new Date(date);
            filter.caseStartDate = {
                gte: selectedDate,
                lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
            };
        }
      const cases = await prisma.caseDetails.findMany({ where: filter,
        include: {
            summaries: true,
            hearings: true,
          },
       });
      return res.status(200).json({ cases });
    }
    catch(err) {
        return res.status(400).json({ message: err });
    }
});
  
router.get("/cases/resolved", authMiddleware, async (req, res) => {
    try {
        const { date } = req.query;
        let filter = { status: CaseStatus.RESOLVED };
        if(date){
            const selectedDate = new Date(date);
            filter.completionDate={
                gte: selectedDate,
                lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
            };
        }
        const cases = await prisma.caseDetails.findMany({ where: filter,
            include: {
                summaries: true,
                hearings: true,
              },
         });
        res.status(200).json({ cases });
    }
    catch(err){
        return res.status(400).json({ message: err});
    }
});

router.get("/case-query/:cin", authMiddleware, async (req, res) => {
    try {
        const cin = req.params.cin;
        const caseDetails = await prisma.caseDetails.findUnique({
                            where: { cin: cin },
                            include: { hearings: true, summaries: true }
                        });
        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }
        res.status(200).json({ case: caseDetails });
    }
    catch (err) {
        return res.status(400).json({ message: err });
    }
});

export default router