import IUser from "./user-model";


export default interface IComment {
    user: IUser,
    message: String,
    created_at: Date
}