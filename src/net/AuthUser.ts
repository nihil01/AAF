export interface AuthUser {
    type: string,
    email: string,
    username?: string,
    password: string,

    //OTP & OAuth optional fields
    idToken?: string,
    code?: string
}