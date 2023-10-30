import IComment from "./comment-model";
import IUser from "./user-model";

export default interface IPost {
    post_id?: String;
    user_id?: String,
    description: String,
    images: String [],
    // comments: IComment[]|[],
    countLikes?: Number,
    status? : 'public'| 'private'
}