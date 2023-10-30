import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import UserService from "../services/user-service";

class UserController {
    static createUser= async (req: Request, res: Response, next: NextFunction)=>
    {
        try{
            let {firstName, lastName,email, password,dob,sex} = req.body;
            await bcrypt.hash(password, parseInt(`${process.env.SALT_ROUND}`), async (err, hash)=>{
                // Store hash in your password DB.
                if (hash)
                {
                   let response = await UserService.createUser({firstName, lastName,email, password:hash,dob,sex})
                   if(response && response.type=='Success')
                   {
                    const user_id= response.message.user_id; 
                    const refreshToken= await UserService.generateRefreshToken(user_id)
                    res.cookie("refreshToken", refreshToken, {
                        httpOnly: true,
                        maxAge: 72 * 60 * 60 * 1000,
                      });
                   }
                   res.status(200).json(response);                   
                }
                else{
                    res.status(200).json(
                        {
                            type: 'Error',
                            code: 404,
                            message:  'Server error'
                        }
                    )
                }
            });
        }
        catch(err){
            next(err);
        }
    }
    
    static loginUser = async (req: Request, res: Response, next: NextFunction)=>
    {
        try{
            let {email, password} = req.body;
            const response = await UserService.loginUser({email, password}); 
            if(response && response.type=='Success')
            {
                const user_id= response.message.id; 
                const refreshToken= await UserService.generateRefreshToken(user_id)
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 72 * 60 * 60 * 1000,
                    });
            }
            res.status(200).json(response); 
        }
        catch(err)
        {
            next(err);
        }
    }

    static test = async (req: Request, res: Response, next: NextFunction)=>{
        res.status(200).json({
            message: "Test successful"
        })
    }

    static refreshAccessToken = async (req: Request, res: Response, next: NextFunction)=>{
        try {
            let refreshToken = req.body.refreshToken;
            const response = UserService.verifyRefreshToken(refreshToken);
            if(response) res.status(200).json(response)
            
            res.status(200).json(
                {
                    type: 'Error',
                    code: 404,
                    message:  'Server error'
                }
            )
        
        } 
        catch (errr) {
            next(errr);
        }
    }

    
}

export default UserController;