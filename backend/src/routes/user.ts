import express from 'express';
import { RegisterSchema,LoginSchema } from '../types';
import {prismaClient} from '../prismaClient';
const router = express.Router();
import jwt from "jsonwebtoken"

router.post('/register',async(req,res):Promise<any>=>{
    const body = req.body;
    console.log(body)
    if(!RegisterSchema.parse(body)){
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
router.post("/login",async(req,res)=>{
    const body = req.body;
    if(!LoginSchema.parse(body)){
        res.json({
            message:"Login validation failed."
        })
    }
    const user = await prismaClient.user.findUnique({
        where:{
            email:body.email
        }
    })
    if(!user){
        res.json({
            message:"No user exists of this username."
        })
        return;
    }

    const token = jwt.sign({
        id: user.id
    },'abc')
    res.json({
        token:token,name:user.name
    })
    
})
export const userRouter = router;
