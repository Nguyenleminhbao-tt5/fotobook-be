import neo4j from "../utils/connect-neo4j";
import IPost from "../models/post-model";
import generateUniqueId from "generate-unique-id";
import getValue from "../utils/get-value";
import getList from "../utils/get-list";
import { IResponse } from "../interfaces/response-interface";


class PostService {

    static getAllPost = async ()=> {
        throw new Error("Method not implemented.");
    }

    static createPost = async ({user_id, description, images}:IPost)=>{
        try{
            if (user_id === "" || description== "" || images==null)
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
                    strPhoto += `(p${index}:Photo {id:'${photo_id}', source: '${image}', status: 'public'}),
                    (n)-[:Has]->(p${index}),`;
                })
                const recordPost = await neo4j.run(
                    `MATCH (u:User {id:'${user_id}'})
                    CREATE (n:Post {id:'${post_id}', description:'${description}', countLikes:0, status: 'public'}), 
                    ${strPhoto}
                    (u)-[:Contain]->(n) 
                    RETURN n AS post, u AS user
                    `
                )
                const recordPhoto = await neo4j.run(`  
                MATCH (n:Post{id:'${post_id}'})-[:Has]->(p:Photo) RETURN p AS photos`);

                let user = getValue(recordPost.records[0],'user');
                let post = getValue(recordPost.records[0],'post');
                let photos= getList(recordPhoto.records,'photos');
                console.log(user, post, photos);
                return {
                    type: 'Success',
                    code: 200,
                    message: {
                        user_id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        avatar: user.avatar,
                        post_id: post.id,
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

    static getPost = async () =>{
        throw new Error("Method not implemented.");
    }

    static updatePost = async () =>{
        throw new Error("Method not implemented.");
    }

    static deletePost = async () => {
        throw new Error("Method not implemented.");
    }
}


export default PostService;