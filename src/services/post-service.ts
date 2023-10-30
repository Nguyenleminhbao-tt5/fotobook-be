import neo4j from "../utils/connect-neo4j";
import IPost from "../models/post-model";
import generateUniqueId from "generate-unique-id";
import getValue from "../helpers/get-value";
import getList from "../helpers/get-list";
import { IResponse } from "../interfaces/response-interface";
import {StatusCodes} from "http-status-codes"



class PostService {

    static getAllPost = async ()=> {
       try{
            const recordPosts= await neo4j.run(
                `MATCH (user:User)-[:Contain]->(post:Post)-[:Has]->(photo:Photo)
                RETURN user, post, COLLECT(photo) as photos`
            )
            const users  = await getList(recordPosts.records,'user');
            const posts  = await getList(recordPosts.records,'post');
            const photos = await getList(recordPosts.records,'photos',true);
            
            return {
                type: 'Success',
                code: StatusCodes.OK,
                message: {
                    users,
                    posts,
                    photos,
                }
            } as IResponse

       }
       catch(err){
            return {
                type: 'Error',
                code: StatusCodes.BAD_REQUEST,
                message: 'Get all posts failed'
            } as IResponse
       }
    }

    static createPost = async ({user_id, description, images}:IPost)=>{
        try{
            if (user_id == "" || description== "" || images==null)
            {
                return {
                    type:'Error',
                    code: 400,
                    message: 'Content of the post error '
                } as IResponse
            }
            
            const post_id :String= generateUniqueId({
                length: 32,
                useLetters: true
            });
           
            if(images)
            {
                 // generate string Post-[:Has]-Photo
                let strPhoto: String= "";
                images.forEach((image,index)=>{
                    const photo_id :String= generateUniqueId({
                        length: 32,
                        useLetters: true
                    });
                    strPhoto += `(p${index}:Photo {photo_id:'${photo_id}', source: '${image}', status: 'public'}),
                    (n)-[:Has]->(p${index}),`;
                })
                const recordPost = await neo4j.run(
                    `MATCH (u:User {user_id:'${user_id}'})
                    CREATE (n:Post {post_id:'${post_id}', description:'${description}', countLikes:0, status: 'public'}), 
                    ${strPhoto}
                    (u)-[:Contain]->(n) 
                    RETURN n AS post, u AS user
                    `
                )
                const recordPhoto = await neo4j.run(`  
                MATCH (n:Post{post_id:'${post_id}'})-[:Has]->(p:Photo) RETURN p AS photos`);

                let user = await getValue(recordPost.records[0],'user');
                let post = await getValue(recordPost.records[0],'post');
                let photos= await getList(recordPhoto.records,'photos');
                console.log(user, post, photos);
                return {
                    type: 'Success',
                    code: 200,
                    message: {
                        user_id: user.user_id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        avatar: user.avatar,
                        post_id: post.post_id,
                        description: post.description,
                        countLikes: post.countLikes,
                        photos: photos

                    }
                } as IResponse

                return {
                    type: 'Success',
                    code: 200,
                    message: 'Create post successfully'
                } as IResponse
            }

            return {
                type: 'Error',
                code: 400,
                message: 'Create post failed'
            } as IResponse
            
        }
        catch(err)
        {
            throw err;
        }
    }

    static getPost = async (post_id:String) =>{
       try{
            if(post_id == "")
            {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: "Invalid post"
                } as IResponse
            }

            const recordPost = await neo4j.run(
                `MATCH (post:Post {post_id:'${post_id}'})-[:Has]->(photo:Photo)
                RETURN post, COLLECT(photo) as photos`
            )

            console.log(recordPost)

            if(recordPost && recordPost.records.length >0)
            {
                const post  = await getList(recordPost.records,'post');
                const photos = await getList(recordPost.records,'photos',true);
    
                return {
                    type:'Success',
                    code: StatusCodes.OK,
                    message: {
                        post: post[0],
                        photos: photos[0]
                    }
                } as IResponse
            }
            else {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: "Post not found"
                } as IResponse
            }

           
       }
       catch(err){
        return {
            type: 'Error',
            code: StatusCodes.BAD_REQUEST,
            message: 'Get a post failed'
        } as IResponse
       }
    }

    static updatePost = async () =>{
        throw new Error("Method not implemented.");
    }

    static deletePost = async (post_id:String) => {
        try{
            if(post_id == "")
            {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: "Invalid post"
                } as IResponse
            }

            const recordPost = await neo4j.run(
                `MATCH (post:Post {post_id: "${post_id}"}) DETACH DELETE post RETURN post`
            )

            if(recordPost && recordPost.records.length>0)
            {
                return {
                    type:'Success',
                    code: StatusCodes.OK,
                    message: "Delete post successfully"
                } as IResponse
            }
            else {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: "Post not found"
                } as IResponse
            }

           
       }
       catch(err){
        return {
            type: 'Error',
            code: StatusCodes.BAD_REQUEST,
            message: 'Delete a post failed'
        } as IResponse
       }
    }
}


export default PostService;