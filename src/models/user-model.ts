export default interface IUser {
    user_id?: String;
    firstName?: String,
    lastName?: String,
    email: String,
    password: String,
    avatar?: String | '',
    dob?: Date,
    sex?: 'male' | 'female',
    refreshToken?: String
}