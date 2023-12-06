import {Request,Response, NextFunction } from "express";
import PostService from "../services/post-service";
import IPost from "../models/post-model";
import { StatusCodes } from "http-status-codes";
import { UserRequest } from "../middlewares/authen-middleware";




class PostController {

    static getAllPost = async (req: UserRequest, res: Response, next: NextFunction)=> {
        try{
            const user_id : string = req.user_id ? req.user_id : '';
            const response = await PostService.getAllPost(user_id);
            res.status(200).json(response);
        }
        catch(err){
            next(err);
        }
    }

    static createPost = async (req: Request, res: Response, next: NextFunction) =>{

        try{

            let {user_id, description, fileList} = req.body;
            const response = await PostService.createPost({user_id,description} as IPost,fileList)
            res.status(200).json(response)
        }
        catch(err){
            next(err);
        }
        
    }

    static getPostByPostId = async (req: Request, res: Response, next: NextFunction) =>{
        try{
            const {post_id} = req.params;
            const response = await PostService.getPostByPostId(post_id);
            res.status(StatusCodes.OK).json(response);
        }
        catch(err){
            next(err)
        }
    }

    static getPostByUserId = async (req: UserRequest, res: Response, next: NextFunction) =>{
        try{
            const {user_id} = req.params;
            const current_user_id : string = req.user_id ? req.user_id : '';
            const response = await PostService.getPostByUserId(user_id, current_user_id);
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

    static likePost = async (req: UserRequest, res: Response, next: NextFunction) => {
        try{
            const {post_id} = req.body;
            const user_id : string = req.user_id ? req.user_id : '';
            const response = await PostService.likePost(user_id,post_id);
            res.status(StatusCodes.OK).json(response);
        }
        catch(err){
            next(err);
        }
    }

   

}


export default PostController;