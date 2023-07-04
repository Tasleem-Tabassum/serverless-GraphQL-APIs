export interface User {
    id?: string;
    name?: string;
    userName: string;
    mobile: number;
    password: string;
    role?: string;
    createdAt?: string; 
}

export interface SignUpInput {
    name: string;
    userName: string;
    password: string;
    role: string;
    mobile: number;
}

export interface LoginInput {
    userName: string;
    password: string;
    mobile: number;
}

export interface GetUserInput {
    token: string;
}

export interface ChangePasswordInput {
    token: string;
    userName: string;
    mobile: number;
    oldPassword: string;
    newPassword: string;
}

export interface UpdateUserInput {
    token: string;
    name: string;
    userName: string;
    password: string;
    role: string;
    mobile: number;
}

