import IComment from "./comment-model";
import IUser from "./user-model";

export default interface IPost {
    user_id?: String,
    description: String,
    images: String [],
    // comments: IComment[]|[],
    countLikes?: Number,
    status? : 'public'| 'private'
}