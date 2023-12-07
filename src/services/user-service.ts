import neo4j from "../utils/connect-neo4j";
import IUser from "../models/user-model";
import { IResponse } from "../interfaces/response-interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import getValue from "../helpers/get-value";
import brycpt from "bcrypt";
import generateUniqueId from "generate-unique-id";
import {StatusCodes} from "http-status-codes";
import checkFollow from "../helpers/check-follow";
import getList from "../helpers/get-list";
import cloudinary from "../utils/connect-cloudinary";




class UserService {
    static createUser = async (userInfor:IUser) : Promise<IResponse>=>{
        try{
            if (userInfor.email== '' || userInfor.password== '' || userInfor.firstName==''
            || userInfor.lastName== '' )
            {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: 'Invalid input error'
                }
            } 
            const existUser = await neo4j.run(`MATCH (n:User{email:'${userInfor.email}'}) RETURN n`);
            if (existUser && existUser.records.length> 0)
            {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: 'Email already exists'
                }
            }

            const id :String= generateUniqueId({
                length: 32,
                useLetters: true
              });

            const recordUser= await neo4j.run(
                `CREATE (n:User{user_id:'${id}',lastName: $lastName,firstName: $firstName,email:$email,
                password: $password, avatar: '', dob: $dob, sex: $sex, refreshToken: ''}) RETURN n`,
                userInfor
            )

            const newUser = await getValue(recordUser.records[0])
            
            if (newUser)
            {
                newUser.password='hidden';
                const refreshToken= await UserService.generateRefreshToken(id)
                return {
                    type: 'Success',
                    code: StatusCodes.OK,
                    message: {
                        ...newUser,
                        refreshToken,
                        accessToken: UserService.generateAccessToken(id)
                    }
                }
            } 
            
            return {
                type: 'Error',
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Server error'
            }
        }
        catch(error)
        {
            throw error;
        }
        
    } 

    static loginUser = async ({email, password}:IUser) :Promise<IResponse>=>{
        try{
            const  recordUser = await neo4j.run(`MATCH (n:User {email:'${email}'}) RETURN n`);

            if(recordUser && recordUser.records.length ==0)
            {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: 'Account does not exist'
                }
            }
            
            if (recordUser && recordUser.records.length ==1)
            {
                
                let user = await getValue(recordUser.records[0])
                const refreshToken= await UserService.generateRefreshToken(user.user_id)
                const result = await brycpt.compare(String(password), user?.password);
                if(result)
                {
                    user.password='hidden';
                    //user.refreshToken='hidden';
                    return {
                        type: 'Success',
                        code: StatusCodes.OK,
                        message: {
                            ...user,
                            refreshToken,
                            accessToken: UserService.generateAccessToken(user.user_id)
                        }
                    }
                    

                }
                else {
                    return {
                        type: 'Error',
                        code: StatusCodes.BAD_REQUEST,
                        message: 'The wrong password'
                    }
                }
                
            }
            return {
                type: 'Error',
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Server error'
            }


        }
        catch(error){
            throw error;
        }

    }

    static generateAccessToken = (id:String) : String => {
        try{
            return jwt.sign({id}, `${process.env.JWT_SECRET_KEY}`, {
                expiresIn: "1d",
            });
        }
        catch(err)
        {
            throw err;
        }
        
    };

    static generateRefreshToken = async (id:String):Promise<String> => {
        try{
            const refreshToken = jwt.sign({ id}, `${process.env.JWT_SECRET_KEY}`, {
                expiresIn: "3d",
            });
            await neo4j.run(`MATCH (n:User{user_id: "${id}"}) SET n.refreshToken= '${refreshToken}' RETURN n`);
            return refreshToken;
        }
        catch(err){
            throw err;
        }
        
        
    }

    static verifyRefreshToken = (token: string) => {
        try{
            if(token){
                const decoded = jwt.verify(
                    token,
                    `${process.env.JWT_SECRET_KEY}`
                  ) as JwtPayload;
                  return {
                    type: "Success",
                    code: StatusCodes.OK,
                    message: {
                        accessToken: UserService.generateAccessToken(decoded.id)
                    }
                  };
            }
            
            return {
                type: 'Error',
                code: StatusCodes.BAD_REQUEST,
                message: "No token provided"
            }
            
        }
        catch(err){
            return {
                type: 'Error',
                code: StatusCodes.BAD_REQUEST,
                message: "Invalid refresh token"
            }
        }
       
    };

    static getFollower = async (user_id: string)=>{
        try{

            const recordFollowers = await neo4j.run(
                `MATCH (me:User {user_id: '${user_id}'}) 
                MATCH (user)-[:FOLLOW]->(me) 
                WHERE NOT (me)-[:FOLLOW]->(user) 
                RETURN user`
            )

            const users  = await getList(recordFollowers.records,'user');
            return {
                type: 'Success',
                code: StatusCodes.OK,
                message: {
                    follower: users
                }
            }
        }
        catch(err){
            throw err;
        }
    }

    static getFollowing = async (user_id: string)=>{
        try{

            // const recordFollowings = await neo4j.run(
            //     `MATCH (me:User {user_id: '${user_id}'}) 
            //     MATCH (me)-[:FOLLOW]->(user) 
            //     WHERE NOT (user)-[:FOLLOW]->(me) 
            //     RETURN user`
            // )

            const recordFollowings = await neo4j.run(
                `MATCH (User {user_id: '${user_id}'})-[:FOLLOW]->(user) 
                RETURN user`
            )
            

            const users  = await getList(recordFollowings.records,'user');
            return {
                type: 'Success',
                code: StatusCodes.OK,
                message: {
                    following: users
                }
            }
            
        }
        catch(err){
            throw err;
        }
    }

    static getFriend = async (user_id: string)=>{
        try{

            const recordFollowings = await neo4j.run(
                `MATCH (me:User {user_id: '${user_id}'}) 
                MATCH (user)-[:FOLLOW]->(me) 
                MATCH (me)-[:FOLLOW]->(user) 
                RETURN user`
            )
            const users  = await getList(recordFollowings.records,'user');
            return {
                type: 'Success',
                code: StatusCodes.OK,
                message: {
                    friends: users
                }
            }
            
        }
        catch(err){
            throw err;
        }
    }

    static follow = async (follower_id: String, following_id: String)=>{
        try{
            if( follower_id == "" || following_id == "" )
            {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: 'Error follow'
                } as IResponse;
            }

            const recordFollow = await neo4j.run(checkFollow(follower_id,following_id));

            console.log(recordFollow.records[0].get('action'))

            if( recordFollow && recordFollow.records.length > 0 )
            {
                if ( recordFollow.records[0].get('action'))
                {
                    return {
                        type: 'Success',
                        code: StatusCodes.OK,
                        message: "Follow user successfully"
                    } as IResponse;
                }
                else {
                    return {
                        type: 'Success',
                        code: StatusCodes.OK,
                        message: "Unfollow user successfully"
                    } as IResponse;
                }
               
            }
            else {
                return {
                    type: 'Error',
                    code: StatusCodes.BAD_REQUEST,
                    message: 'User not found'
                } as IResponse;
            }
        }
        catch(err){
            return {
                type: 'Error',
                code: StatusCodes.BAD_REQUEST,
                message: 'Follow user failed'
            } as IResponse
        }
    }

    static getUserByToken=  async (token: string)=>{
        try{
            if(token){
                const decoded = jwt.verify(
                    token,
                    `${process.env.JWT_SECRET_KEY}`
                  ) as JwtPayload;
                const userRecord = await neo4j.run(
                    `MATCH (user: User {user_id: "${decoded.id}"}) RETURN user`
                )
                
                const user = getValue(userRecord.records[0], 'user'); 

                return {
                    type: "Success",
                    code: StatusCodes.OK,
                    message: {
                        ...user
                    }
                };
            }
            
            return {
                type: 'Error',
                code: StatusCodes.BAD_REQUEST,
                message: "No token provided"
            }
            
        }
        catch(err){
            return {
                type: 'Error',
                code: StatusCodes.BAD_REQUEST,
                message: "Invalid refresh token"
            }
        }
    }

    static updateUser = async (user_id: string, avatar: string)=>{
        try{
            // update features delete avatar in cloudinary in the future
            const resultUploadAvatar = await cloudinary.uploader.upload(avatar);
            const recordUser = await neo4j.run(`
                MATCH (user: User{user_id: '${user_id}'}) SET user.avatar = '${resultUploadAvatar.secure_url}' RETURN user
            `)
            let user = await getValue(recordUser.records[0], 'user')

            return {
                type: "Success",
                code: StatusCodes.OK,
                message: {
                    user
                }
            }

        }
        catch(err){
            throw err;
        }
    }


}

export default UserService;