export default interface IUser {
    id?: string;
    firstName?: string,
    lastName?: string,
    email: string,
    password: string,
    dob?: Date,
    sex?: 'male' | 'female' ;
    refreshToken?: string
}