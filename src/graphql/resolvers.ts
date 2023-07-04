import { signUpController, loginController, getUserController, changePasswordController, updateUserController } from "../controllers/userControllers";
import { SignUpInput, LoginInput, GetUserInput, ChangePasswordInput, UpdateUserInput } from "../models/interfaces";

export const resolvers = {
    Query: {
        users: () => {
            return [
                {
                    id: 1,
                    name: "sam", 
                    userName: "sam123@gmail.com",
                    password: "password",
                    role: "admin",
                    mobile: 7634535,
                    createdAt: "28-06-2023"
                }
            ];
        }
    },

    Mutation: {

        signUp: async (_: any, { input }: { input: SignUpInput }) => {
            try {
                const response = await signUpController(
                    input.name,
                    input.userName,
                    input.password,
                    input.role,
                    input.mobile
                );
          
                console.log("Signup resolver response", response);
            
                if (response) {
                    return {
                    statusCode: response.statusCode,
                    body: {
                        message: response.body
                    }
                    };
                } else {
                    console.log(response);
                    return {
                    statusCode: 500,
                    body: {
                        message: "Something went wrong. Please try later"
                    }
                    };
                }
            } catch (e) {
                console.log("ERROR!", e);
                return {
                    statusCode: 500,
                    body: {
                    message: "Internal Server Error"
                    }
                };
            }
        },

        login: async (_: any, { input }: { input: LoginInput }) => {
            try {
                const response = await loginController(input.userName, input.password, input.mobile)

                console.log("login resolver response", response)

                if (response) {
                    return {
                    statusCode: response.statusCode,
                    body: {
                        message: response.body
                    }
                    };
                } else {
                    console.log(response);
                    return {
                    statusCode: 500,
                    body: {
                        message: "Something went wrong. Please try later"
                    }
                    };
                }
            } catch (e) {
                console.log("ERROR!", e);
                return {
                    statusCode: 500,
                    body: {
                    message: "Internal Server Error"
                    }
                };
            }         
        },

        getUser: async (_: any, { input }: { input: GetUserInput}) => {
            try {
                const response = await getUserController(input.token)

                console.log("getUser resolver response", response)

                if (response) {
                    return {
                    statusCode: response.statusCode,
                    body: {
                        message: response.body
                    }
                    };
                } else {
                    console.log(response);
                    return {
                    statusCode: 500,
                    body: {
                        message: "Something went wrong. Please try later"
                    }
                    };
                }
            } catch (e) {
                console.log("ERROR!", e);
                return {
                    statusCode: 500,
                    body: {
                    message: "Internal Server Error"
                    }
                };
            }
        },

        changePassword: async (_: any, { input }: { input: ChangePasswordInput}) => {
            try {
                const response = await changePasswordController(
                    input.token,
                    input.userName,
                    input.mobile,
                    input.oldPassword,
                    input.newPassword,
                )

                console.log("changePassword resolver response", response)

                if (response) {
                    return {
                    statusCode: response.statusCode,
                    body: {
                        message: response.body
                    }
                    };
                } else {
                    console.log(response);
                    return {
                    statusCode: 500,
                    body: {
                        message: "Something went wrong. Please try later"
                    }
                    };
                }
            } catch (e) {
                console.log("ERROR!", e);
                return {
                    statusCode: 500,
                    body: {
                    message: "Internal Server Error"
                    }
                };
            }
        },

        updateUser: async (_: any, { input }: { input: UpdateUserInput}) => {
            try {
                const response = await updateUserController(
                    input.token,
                    input.name,
                    input.userName,
                    input.password,
                    input.role,
                    input.mobile
                )

                console.log("updateUser resolver response", response)

                if (response) {
                    return {
                    statusCode: response.statusCode,
                    body: {
                        message: response.body
                    }
                    };
                } else {
                    console.log(response);
                    return {
                    statusCode: 500,
                    body: {
                        message: "Something went wrong. Please try later"
                    }
                    };
                }
            } catch (e) {
                console.log("ERROR!", e);
                return {
                    statusCode: 500,
                    body: {
                    message: "Internal Server Error"
                    }
                };
            }
        }
    }
};
