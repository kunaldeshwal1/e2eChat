import express from 'express';
import { registerSchema } from '../types';
import {prismaClient} from '../prismaClient';
const router = express.Router();

router.post('/register',async(req,res):Promise<any>=>{
    const body = req.body;
    if(!registerSchema.parse(body)){
        res.json({
            message:"The registration validation failed"
        })
    }
    const userExists = await prismaClient.user.findUnique({
        where:{
            email:body.email
        }
    })
    if(userExists){
        res.status(409).json({
            message:"User already exists."
        })
        return;
    }
    const user = await prismaClient.user.create({
        data: {
            name: body.name,
            email: body.email,
            password: body.password
        },
      })

    res.json({
        message:"Validation passed",user
    })
})
export const userRouter = router;
