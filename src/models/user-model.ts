export default interface IUser {
    id?: String;
    firstName?: String,
    lastName?: String,
    email: String,
    password: String,
    avatar?: String | '',
    dob?: Date,
    sex?: 'male' | 'female',
    refreshToken?: String
}