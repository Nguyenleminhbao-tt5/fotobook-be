import {Request,Response, NextFunction } from "express";
import PostService from "../services/post-service";
import IPost from "../models/post-model";




class PostController {

    static getAllPost = async (req: Request, res: Response, next: NextFunction)=> {
        throw new Error("Method not implemented.");
    }

    static createPost = async (req: Request, res: Response, next: NextFunction) =>{

        try{
            let {user_id, description, images} :IPost = req.body;
            const response = await PostService.createPost({user_id,description,images})
            res.status(200).json(response)
        }
        catch(err){
            next(err);
        }
        
    }

    static getPost = async (req: Request, res: Response, next: NextFunction) =>{
        throw new Error("Method not implemented.");
    }

    static updatePost = async (req: Request, res: Response, next: NextFunction) =>{
        throw new Error("Method not implemented.");
    }

    static deletePost = async (req: Request, res: Response, next: NextFunction) => {
        throw new Error("Method not implemented.");
    }


}


export default PostController;