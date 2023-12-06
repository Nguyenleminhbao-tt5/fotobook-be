import { StatusCodes } from "http-status-codes";
import { IResponse } from "../interfaces/response-interface";
import type { UploadFile} from "antd/es/upload/interface";
import cloudinary from "../utils/connect-cloudinary";
import { IImageUpload } from "../interfaces/image-upload-interface";
import IPhoto from "../models/photo-model";

class UploadService {
    static uploadImages = async (fileList:UploadFile[])=>{
        try{
            const images: string[] = fileList.map(file=>file.thumbUrl as string);
            let uploadImages : IImageUpload[]=[];
            for (let image of images)
            {
                const result = await cloudinary.uploader.upload(image); 
                console.log('result',{
                    url: result.secure_url,
                    photo_id: result.public_id
                });
                uploadImages.push({
                    url: result.secure_url,
                    photo_id: result.public_id
                })
            }
            return  uploadImages ;
        }
        catch(err){
            return {
                type: 'Error',
                code: StatusCodes.BAD_REQUEST,
                message: 'Uploading images failed'
            } as IResponse
        }
    }

    static removeImages = async(listPhotoId: IPhoto[])=>{
        try{
            listPhotoId.forEach( async (photo:IPhoto)=>{
                await cloudinary.uploader.destroy(photo.photo_id);
            })
        }
        catch(err){
            return {
                type: 'Error',
                code: StatusCodes.BAD_REQUEST,
                message: 'Remove images failed'
            } as IResponse
        }
    }
}



export default UploadService;