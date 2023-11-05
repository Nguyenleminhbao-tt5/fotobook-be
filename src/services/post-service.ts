import neo4j from "../utils/connect-neo4j";
import IPost from "../models/post-model";
import generateUniqueId from "generate-unique-id";
import getValue from "../helpers/get-value";
import getList from "../helpers/get-list";
import { IResponse } from "../interfaces/response-interface";
import {StatusCodes} from "http-status-codes"
import checkLike from "../helpers/check-like";



class PostService {

    static getAllPost = async (user_id: string)=> {
       try{
            const recordPosts= await neo4j.run(
                `MATCH (user:User)-[:CONTAIN]->(post:Post)-[:HAS]->(photo:Photo)
                RETURN user, post, COLLECT(photo) as photos`
            )
            const recordLike = await neo4j.run(
                `MATCH (user:User{user_id:"${user_id}"})-[:LIKE]->(post:Post)
                RETURN COLLECT(DISTINCT post.post_id) AS liked_post_ids`
            )
            const users  = await getList(recordPosts.records,'user');
            const posts  = await getList(recordPosts.records,'post');
            const photos = await getList(recordPosts.records,'photos',true);
            const listPostLike = recordLike.records[0].get('liked_post_ids');
 
            return {
                type: 'Success',
                code: StatusCodes.OK,
                message: {
                    users,
                    posts,
                    photos,
                    listPostLike
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
                 // generate string Post-[:HAS]-Photo
                let strPhoto: String= "";
                images.forEach((image,index)=>{
                    const photo_id :String= generateUniqueId({
                        length: 32,
                        useLetters: true
                    });
                    strPhoto += `(p${index}:Photo {photo_id:'${photo_id}', source: '${image}', status: 'public'}),
                    (n)-[:HAS]->(p${index}),`;
                })
                const recordPost = await neo4j.run(
                    `MATCH (u:User {user_id:'${user_id}'})
                    CREATE (n:Post {post_id:'${post_id}', description:'${description}', countLikes:0, status: 'public'}), 
                    ${strPhoto}
                    (u)-[:CONTAIN]->(n) 
                    RETURN n AS post, u AS user
                    `
                )
                const recordPhoto = await neo4j.run(`  
                MATCH (n:Post{post_id:'${post_id}'})-[:HAS]->(p:Photo) RETURN p AS photos`);

                let user = await getValue(recordPost.records[0],'user');
                let post = await getValue(recordPost.records[0],'post');
                let photos= await getList(recordPhoto.records,'photos');
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
                `MATCH (user:User)-[:CONTAIN]->(post:Post {post_id:'${post_id}'})-[:HAS]->(photo:Photo)
                RETURN user, post, COLLECT(photo) as photos`
            )


            if(recordPost && recordPost.records.length >0)
            {
                const user  = await getList(recordPost.records,'user');
                const post  = await getList(recordPost.records,'post');
                const photos = await getList(recordPost.records,'photos',true);
    
                return {
                    type:'Success',
                    code: StatusCodes.OK,
                    message: {
                        user: user[0],
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

    static likePost = async (user_id: String, post_id: String)=>{
        try{
            if( user_id == "" || post_id == "" )
            {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: 'Error like'
                } as IResponse;
            }

            const recordLike = await neo4j.run(checkLike(user_id,post_id));

            if( recordLike && recordLike.records.length > 0 )
            {
                if ( recordLike.records[0].get('action'))
                {
                    return {
                        type: 'Success',
                        code: StatusCodes.OK,
                        message: "Like post successfully"
                    } as IResponse;
                }
                else {
                    return {
                        type: 'Success',
                        code: StatusCodes.OK,
                        message: "UnLike post successfully"
                    } as IResponse;
                }
               
            }
            else {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: 'User or Post not found'
                } as IResponse;
            }
          
            

        }
        catch(err){
            return {
                type: 'Error',
                code: StatusCodes.BAD_REQUEST,
                message: 'Like a post failed'
            } as IResponse
        }
    }

  
}


export default PostService;