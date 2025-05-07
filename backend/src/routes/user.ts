import express from 'express';

const router = express.Router();

router.get('/abc',async(req,res):Promise<any>=>{
    res.send('abc')
})
export const userRouter = router;
