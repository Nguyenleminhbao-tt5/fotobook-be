import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import UserService from "../services/user-service";
import { StatusCodes } from "http-status-codes";
import { UserRequest } from "../middlewares/authen-middleware";

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
                   res.status(StatusCodes.OK).json(response);                   
                }
                else{
                    res.status(StatusCodes.OK).json(
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
            res.status(StatusCodes.OK).json(response); 
        }
        catch(err)
        {
            next(err);
        }
    }

    static getFollower = async (req: UserRequest, res: Response, next: NextFunction)=>{

        try{
            const user_id : string = req.user_id ? req.user_id : '';
            const response = await UserService.getFollower(user_id);
            res.status(StatusCodes.OK).json(response)
        }
        catch(err){
            next(err);
        }
    }

    static getFollowing = async (req: UserRequest, res: Response, next: NextFunction)=>{

        try{
            const user_id : string = req.user_id ? req.user_id : '';
            const response = await UserService.getFollowing(user_id);
            res.status(StatusCodes.OK).json(response)
        }
        catch(err){
            next(err);
        }
    }

    static getFriend = async (req: UserRequest, res: Response, next: NextFunction)=>{
        try{
            const user_id : string = req.user_id ? req.user_id : '';
            const response = await UserService.getFriend(user_id);
            res.status(StatusCodes.OK).json(response)
        }
        catch(err){

        }
    }

    static refreshAccessToken = async (req: Request, res: Response, next: NextFunction)=>{
        try {
            let refreshToken = req.body.refreshToken;
            const response = UserService.verifyRefreshToken(refreshToken);
            if(response) res.status(StatusCodes.OK).json(response)
            
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

    static follow = async (req: UserRequest, res: Response, next: NextFunction)=>{
        try{
            const {follower_id} = req.body;
            const following_id : string = req.user_id ? req.user_id : '';
            const response = await UserService.follow(follower_id, following_id);
            res.status(StatusCodes.OK).json(response);
        }
        catch(err){
            next(err);
        }
    }

    static getUserByToken = async (req: Request, res: Response, next: NextFunction)=>{
        try{
            const {token}= req.params;
            const response = await UserService.getUserByToken(token);
            res.status(StatusCodes.OK).json(response);

        }
        catch(err)
        {
            next(err);
        }
    }

    static updateUser = async (req: UserRequest, res: Response, next: NextFunction)=>{
        try{
            const user_id : string = req.user_id ? req.user_id : '';
            const {avatar} = req.body; 
            const response = await UserService.updateUser(user_id, avatar);
            res.status(StatusCodes.OK).json(response)
        }
        catch(err){
            throw err;
        }
    }

    
}

export default UserController;