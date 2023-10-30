import {Request,Response, NextFunction } from "express";
import PostService from "../services/post-service";
import IPost from "../models/post-model";
import { StatusCodes } from "http-status-codes";




class PostController {

    static getAllPost = async (req: Request, res: Response, next: NextFunction)=> {
        try{
            const response = await PostService.getAllPost();
            res.status(200).json(response);
        }
        catch(err){
            next(err);
        }
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
        try{
            const {post_id} = req.params;
            const response = await PostService.getPost(post_id);
            res.status(StatusCodes.OK).json(response);
        }
        catch(err){
            next(err)
        }
    }

    static updatePost = async (req: Request, res: Response, next: NextFunction) =>{
        throw new Error("Method not implemented.");
    }

    static deletePost = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const {post_id} = req.params;
            const response = await PostService.deletePost(post_id);
            res.status(StatusCodes.OK).json(response);
        }
        catch(err){
            next(err)
        }
    }


}


export default PostController;