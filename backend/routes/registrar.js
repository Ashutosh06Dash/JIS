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

const signUpInput= z.object({
    name:z.string(),
    userName :z.string(),
    password :z.string().min(8),
    email :z.string().email(),
    contactNumber :z.string().regex(/^[0-9]{10}$/)
})

const logInInput=z.object({
    userName:z.string(),
    password :z.string().min(8)
})

const caseInput = z.object({
    defendantName: z.string(),
    defendantAddress: z.string(),
    crimeType: z.string(),
    crimeDate: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid crimeDate"
    }),
    crimeLocation: z.string(),
    arrestingOfficer: z.string(),
    arrestDate: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid arrestDate"
    }),
    hearingDate: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Invalid hearingDate"
    }),
})

const caseUpdateInput = z.object({
    summary: z.string(),
    status: z.enum(["PENDING", "RESOLVED"]),
    nextHearingDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid nextHearingDate"
    }).optional()
})

const caseQueryInput = z.object({
    status: z.string().optional(),
    date: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date"
    }).optional(),
    caseId: z.string().optional()
})

//test
router.get("/s",(req,res)=>{
    return res.status(200).json({
        message:"User Exists",
    })
})


router.post("/signup",async(req,res)=>{
    const body=req.body
    const validation=signUpInput.safeParse(body)

    if(!validation.success){
        return res.status(411).json({
            message:"Incorrect Data"
        })
        
    }
    try{
        const existingUser=await prisma.user.findUnique({where:{userName:body.userName}})
        if(existingUser){
            return res.status(411).json({
                message:"User Exists",
            })
            
        }
        const salt = await bcrypt.genSalt(10);
        const passwordWithPepper = body.password + process.env.PEPPER;
        const hashedPassword = await bcrypt.hash(passwordWithPepper, salt);

        const user = await prisma.user.create({
            data: {
                name: body.name,
                role: Role.REGISTRAR,
                userName: body.userName,
                password: hashedPassword,
                email: body.email,
                contactNumber: body.contactNumber,
                salt:salt
            },
        });
        const token = jwt.sign(
            { userName: user.userName, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({
            message:"User Created Successfully",
            token: token,
        });
    }
    catch(err){
        return res.status(400).json({
            message:err
        });
        
    }
})

router.post("/login",async(req,res)=>{
    const body=req.body
    const validation=logInInput.safeParse(body)

    if(!validation.success){
        return res.status(411).json({
            message:"Incorrect Data"
        })
        
    }
    try{
        const user=await prisma.user.findUnique({where:{userName:body.userName}})
        
        if (!user || user.role !== Role.REGISTRAR) {
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

router.post('/case-creation',authMiddleware, async (req, res) => {
    try{
        const body=req.body
        const validation=caseInput.safeParse(body);
        if(!validation.success){
            return res.status(411).json({
                message:"Incorrect Data"
            })
        }
        const hearingDateObj = new Date(body.hearingDate);
    
        // Checking if the hearing date is already taken.
        const existingHearing = await prisma.hearing.findFirst({
            where: { hearingDate: hearingDateObj }
        });
        if(existingHearing){
            return res.status(400).json({ message: 'Selected hearing date is already taken. Please choose a free date.' });
        }
        const newCase = await prisma.caseDetails.create({
            data:{
                defendantName:body.defendantName,
                defendantAddress:body.defendantAddress,
                crimeType:body.crimeType,
                crimeDate: new Date(body.crimeDate),
                crimeLocation:body.crimeLocation,
                arrestingOfficer:body.arrestingOfficer,
                arrestDate: new Date(body.arrestDate),
                hearings:{
                    create: { hearingDate: new Date(body.hearingDate) }
                }
            }
        });
        res.status(201).json({ message: 'Case registered successfully', case: newCase });
    }
    catch(err) {
        return res.status(400).json({
            message:err
        });
    }
});

router.put("/case-updation/:cin",authMiddleware,async(req,res)=>{
    try{
        const body=req.body;
        const validation=caseUpdateInput.safeParse(body)
        if(!validation.success){
            return res.status(411).json({
                message:"Incorrect Data"
            })
        }
        const { summary, status, nextHearingDate } = body
        const cin = req.params.cin;
        const existingCase = await prisma.caseDetails.findUnique({ where: { cin: cin } });
        if(!existingCase){
            return res.status(404).json({ message: "Case not found" });
        }
        
        // Create a summary for the case
        await prisma.caseSummary.create({
            data:{
              content: summary,
              case: { connect: { id: existingCase.id } }
            }
        });
        
        // Update the case status and set completion date if resolved
        const updateData = { status };
        if(status === CaseStatus.RESOLVED) {
            updateData.completionDate = new Date();
        }
        
        // Add next hearing date if provided and case is still pending
        if(status !== CaseStatus.RESOLVED && nextHearingDate) {
            const nextHearingDateObj = new Date(nextHearingDate);
            const existingHearing = await prisma.hearing.findFirst({
                where: { hearingDate: nextHearingDateObj }
            });
            if (existingHearing) {
                return res.status(400).json({ message: "Selected new hearing date is already taken. Please choose a free date." });
            }
            await prisma.hearing.create({
                data: { hearingDate: nextHearingDateObj, case: { connect: { id: existingCase.id } } }
            });
        }
        
        // Update the case with the new data
        const updatedCase = await prisma.caseDetails.update({
            where: { cin },
            data: updateData,
            include: { hearings: true, summaries: true }
        });
        
        res.status(200).json({ 
            message: "Case updated successfully",
            case: updatedCase
        });
    }
    catch(err){
        console.error("Error updating case:", err);
        return res.status(400).json({
            message: err
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
  
router.post("/create-lawyer", authMiddleware, async (req, res) => {
    try {
        const body = req.body;
        const validation = signUpInput.safeParse(body);
        if (!validation.success) {
            return res.status(411).json({ message: "Incorrect Data" });
        }
        const existingUser = await prisma.user.findUnique({ where: { userName: body.userName } });
        if (existingUser) return res.status(411).json({ message: "User Exists" });
        const salt = await bcrypt.genSalt(10);
        const passwordWithPepper = body.password + process.env.PEPPER;
        const hashedPassword = await bcrypt.hash(passwordWithPepper, salt);
        const lawyer = await prisma.user.create({
            data: {
                name: body.name,
                role: Role.LAWYER,
                userName: body.userName,
                password: hashedPassword,
                email: body.email,
                contactNumber: body.contactNumber,
                salt: salt
            }
        });
        res.status(201).json({ message: "Lawyer created successfully", lawyer });
    }
    catch (err) {
        return res.status(400).json({ message: err });
    }
});

router.post("/create-judge", authMiddleware, async (req, res) => {
    try {
        const body = req.body;
        const validation = signUpInput.safeParse(body);
        if (!validation.success) {
            return res.status(411).json({ message: "Incorrect Data" });
        }
        const existingUser = await prisma.user.findUnique({ where: { userName: body.userName } });
        if (existingUser) return res.status(411).json({ message: "User Exists" });
        const salt = await bcrypt.genSalt(10);
        const passwordWithPepper = body.password + process.env.PEPPER;
        const hashedPassword = await bcrypt.hash(passwordWithPepper, salt);
        const lawyer = await prisma.user.create({
            data: {
                name: body.name,
                role: Role.JUDGE,
                userName: body.userName,
                password: hashedPassword,
                email: body.email,
                contactNumber: body.contactNumber,
                salt: salt
            }
        });
        res.status(201).json({ message: "Judge created successfully", lawyer });
    }
    catch (err) {
        return res.status(400).json({ message: err });
    }
});

router.post("/clear-bill/:username", authMiddleware, async (req, res) => {
    try {
        const { username } = req.params;
        const lawyer = await prisma.user.findUnique({
            where: { userName: username },
        });
    
        if (!lawyer) {
            return res.status(404).json({ message: "Lawyer not found" });
        }

        const result = await prisma.billing.updateMany({
            where: { lawyerId: lawyer.id, paymentStatus: "PENDING" },
            data: {
            paymentStatus: PaymentStatus.PAID,
            chargeAmount: 0.0,
            },
        });
    
        res.status(200).json({
            message: `Billing cleared for lawyer ${username}`,
            updatedCount: result.count,
        });
    }
    catch(err){
        res.status(400).json({ message: err });
    }
  });
  

router.delete("/delete-lawyer/:userName", authMiddleware, async (req, res) => {
    try {
        const { userName } = req.params;
        const deleted = await prisma.user.delete({ where: { userName: userName } });
        res.status(200).json({ message: "Lawyer deleted successfully", user: deleted });
    }
    catch (err) {
        res.status(400).json({ message: err });
    }
});
  

router.delete("/delete-judge/:userName", authMiddleware, async (req, res) => {
    try {
        const { userName } = req.params;
        const deleted = await prisma.user.delete({ where: { userName: userName } });
        res.status(200).json({ message: "Judge deleted successfully", user: deleted });
    }
    catch (err) {
        res.status(400).json({ message: err.toString() });
    }
});

router.get("/hearing-dates", authMiddleware, async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required" });
        }
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        const hearings = await prisma.hearing.findMany({
            where: { hearingDate: { gte: startDate, lt: endDate } },
            select: { hearingDate: true }
        });
        const occupiedDays = new Set();
        hearings.forEach(h => {
            occupiedDays.add(h.hearingDate.getDate());
        });
        const daysInMonth = new Date(year, month, 0).getDate();
        const dates = [];
        for (let day = 1; day <= daysInMonth; day++) {
            dates.push({ day, occupied: occupiedDays.has(day) });
        }
        res.status(200).json({ dates });
    }
    catch (err) {
        res.status(400).json({ message: err });
    }
});

export default router
