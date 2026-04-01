import express from 'express';
import type { Request, Response } from 'express';
import {User} from '../schema.js';

const router = express.Router();


router.post('/login',(req: Request,res: Response) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = User.findOne({
        "username": username,
        "password": password
    });

    if(user == null){
        res.status(200).json({"error": "Incorrect Password"});
    }
    else{
        res.status(200).json({"error": ""});
    }
});
router.post('/register',(req: Request,res: Response) => {
    const username = req.body.username;
    const password = req.body.password;
    User.insertOne({
        "username": username,
        "password": password
    });
});

export default router;