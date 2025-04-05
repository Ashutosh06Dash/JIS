import express from "express"
const router=express.Router();
import jwt from "jsonwebtoken"
import z from 'zod';
import bodyParser from 'body-parser';
import  authMiddleware  from "../middleware.js";
import bcrypt from 'bcrypt';
import prisma from "../prisma/client.js";
import { Role, CaseStatus, PaymentStatus } from "@prisma/client"
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
        
        if (!user || user.role !== Role.LAWYER) {
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

const BILL_THRESHOLD = 100.0
router.get("/cases/resolved", authMiddleware, async (req, res) => {
    try {
      const { date } = req.query;
      let filter = { status: "RESOLVED" };
  
      if (date) {
        const selectedDate = new Date(date);
        filter.completionDate = {
          gte: selectedDate,
          lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
        };
      }
  
      const lawyerUsername = req.userName;
      console.log("Lawyer username:", lawyerUsername);
      let lawyerId = null;
  
      if (lawyerUsername) {
        const lawyer = await prisma.user.findUnique({
          where: { userName: lawyerUsername },
        });
  
        if (!lawyer) {
          return res.status(404).json({ message: "Lawyer not found" });
        }
  
        lawyerId = lawyer.id;
        console.log(lawyer)
  
        const billTotalResult = await prisma.billing.aggregate({
          where: { lawyerId, paymentStatus: "PENDING" },
          _sum: { chargeAmount: true },
        });
  
        const billTotal = billTotalResult._sum.chargeAmount || 0;
  
        if (billTotal >= BILL_THRESHOLD) {
          return res.status(403).json({
            message: "Billing threshold reached. Please complete payment.",
            redirect: "/bill",
          });
        }
      }
      
      console.log("hello")
      const cases = await prisma.caseDetails.findMany({
        where: filter,
        include: {
          summaries: true,
          hearings: true,
        },
      });
  
      if (lawyerId) {
        const billingPromises = cases.map(() =>
          prisma.billing.create({
            data: { lawyerId: lawyerId,
                chargeAmount: 10.0,
                paymentStatus: PaymentStatus.PENDING },
          })
        );
        try {
            await Promise.all(billingPromises);
        } catch (error) {
            console.error("Error creating billing entries:", error);
        }
      }
  
      res.status(200).json({ cases });
    } catch (err) {
      return res.status(400).json({ message: err.toString() });
    }
  });
  
  router.get("/cases/:caseId", authMiddleware, async (req, res) => {
    try {
      const { caseId } = req.params;
      const lawyerUsername = req.userName;
  
      if (!lawyerUsername) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const lawyer = await prisma.user.findUnique({
        where: { userName: lawyerUsername },
      });
  
      if (!lawyer) {
        return res.status(404).json({ message: "Lawyer not found" });
      }
  
      const caseData = await prisma.caseDetails.findUnique({
        where: { cin: caseId },
        include: {
          summaries: true,
          hearings: true,
        },
      });
  
      if (!caseData) {
        return res.status(404).json({ message: "Case not found" });
      }
  
      // Check if a billing entry already exists for this lawyer and case for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const existingBilling = await prisma.billing.findFirst({
        where: {
          lawyerId: lawyer.id,
          paymentStatus:PaymentStatus.PENDING,
          // If we have caseId field, use it
          ...(caseData.id ? { caseId: caseData.id } : {})
        }
      });
      
      // Only create a new billing entry if one doesn't exist for today
      if (!existingBilling) {
        // Add ₹10 billing charge on summary view
        await prisma.billing.create({
          data: {
            lawyerId: lawyer.id,
            chargeAmount: 10.0,
            paymentStatus:PaymentStatus.PENDING,
            // Include caseId if it's available in the schema
            ...(caseData.id ? { caseId: caseData.id } : {})
          },
        });
        console.log("New billing entry created");
      } else {
        console.log("Billing entry already exists for today, skipping");
      }
  
      res.status(200).json({ case: caseData });
    } catch (err) {
      console.error("Error in case summary route:", err);
      return res.status(400).json({ message: err.toString() });
    }
  });
  

// View Bill (Billing Details)
router.get("/bill", authMiddleware, async (req, res) => {
    try {
      const lawyerUsername = req.userName;
  
      if (!lawyerUsername)
        return res.status(401).json({ message: "Unauthorized" });
  
      const lawyer = await prisma.user.findUnique({
        where: { userName: lawyerUsername },
      });
  
      if (!lawyer) {
        return res.status(404).json({ message: "Lawyer not found" });
      }
  
      const bills = await prisma.billing.findMany({
        where: { lawyerId: lawyer.id },
        include: {
            case: true, 
          },
      });
  
      res.status(200).json({ bills });
    } catch (err) {
      return res.status(400).json({ message: err.toString() });
    }
});
  

export default router;
