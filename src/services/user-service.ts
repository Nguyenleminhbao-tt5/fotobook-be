import neo4j from "../utils/connect-neo4j";
import IUser from "../models/user-model";
import { IResponse } from "../interfaces/response-interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import getValue from "../utils/get-value";
import brycpt from "bcrypt";
import generateUniqueId from "generate-unique-id";



class UserService {
    static createUser = async (userInfor:IUser) : Promise<IResponse>=>{
        try{
            if (userInfor.email== '' || userInfor.password== '' || userInfor.firstName==''
            || userInfor.lastName== '' )
            {
                return {
                    type: 'Error',
                    code: 400,
                    message: 'Invalid input error'
                }
            } 
            const existUser = await neo4j.run(`MATCH (n:User{email:'${userInfor.email}'}) RETURN n`);
            if (existUser && existUser.records.length> 0)
            {
                return {
                    type: 'Error',
                    code: 400,
                    message: 'Email already exists'
                }
            }

            const id :String= generateUniqueId({
                length: 32,
                useLetters: true
              });

            const recordUser= await neo4j.run(
                `CREATE (n:User{id:'${id}',lastName: $lastName,firstName: $firstName,email:$email,
                password: $password, avatar: '', dob: $dob, sex: $sex, refreshToken: ''}) RETURN n`,
                userInfor
            )
           
            const newUser = getValue(recordUser.records[0])
            
            if (newUser)
            {
                newUser.password='hidden';
                newUser.refreshToken='hidden';
                return {
                    type: 'Success',
                    code: 200,
                    message: {
                        ...newUser,
                        accessToken: UserService.generateAccessToken(id)
                    }
                }
            } 
            
            return {
                type: 'Error',
                code: 500,
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
                    code: 400,
                    message: 'Account does not exist'
                }
            }
            
            if (recordUser && recordUser.records.length ==1)
            {
                
                let user = getValue(recordUser.records[0])
                const result = await brycpt.compare(String(password), user?.password);
                if(result)
                {
                    user.password='hidden';
                    user.refreshToken='hidden';
                    return {
                        type: 'Success',
                        code: 200,
                        message: {
                            ...user,
                            accessToken: UserService.generateAccessToken(user.id)
                        }
                    }
                    

                }
                else {
                    return {
                        type: 'Error',
                        code: 400,
                        message: 'The wrong password'
                    }
                }
                
            }
            return {
                type: 'Error',
                code: 500,
                message: 'Server error'
            }


        }
        catch(error){
            throw error;
        }

    }

    static generateAccessToken = (id:String) : String => {
        try{
            return jwt.sign({ id}, `${process.env.JWT_SECRET_KEY}`, {
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
            const a= await neo4j.run(`MATCH (n:User{id: "${id}"}) SET n.refreshToken= '${refreshToken}' RETURN n`);
            console.log(refreshToken)
            console.log(getValue(a.records[0]).refreshToken);
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
                    code: 200,
                    message: {
                        accessToken: UserService.generateAccessToken(decoded.id)
                    }
                  };
            }
            
            return {
                type: 'Error',
                code: 400,
                message: "No token provided"
            }
            
        }
        catch(err){
            return {
                type: 'Error',
                code: 400,
                message: "Invalid refresh token"
            }
        }
       
    };


}

export default UserService;