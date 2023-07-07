import AWS, { dynamodb } from "../config/aws";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../models/interfaces";
import { response } from "../models/response";

export const signUpController = async (name: string, userName: string, password: string, role: string, mobile: number): Promise<response> => {
    try {

        console.log(userName, password, name, mobile, role)

        if(!userName || !password || !name || !mobile || !role) {
            return {
                statusCode: 400,
                body: "All the fields are mandatory"
            }
        }

        if(typeof userName !== 'string') {
            return {
                statusCode: 400,
                body: "UserName must be a string"
            }
        }

        if(typeof password !== 'string') {
            return {
                statusCode: 400,
                body: "Password must be a string"
            }
        }

        if(typeof name !== 'string') {
            return {
                statusCode: 400,
                body: "Name must be a string"
            }
        }
        
        if(typeof mobile !== 'number') {
            return {
                statusCode: 400,
                body: "Mobile Number must be a number"
            }
        }

        const getDataParams = {
            TableName: process.env.USERS_TABLE || '',
            Key: {
                UserName: userName,
                MobileNumber: mobile
            }
        }

        const user = await dynamodb.get(getDataParams).promise();
        console.log(user)
        

        if(user.Item?.UserName !== undefined) {
            console.log("user", user)
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "UserName already exists!"
                })
            };
        }

        const passwordHash = await bcrypt.hash(password, 8);

        const params = {
            TableName: process.env.USERS_TABLE || '',
            Item: {
                id: uuidv4(),
                UserName: userName,
                Password: passwordHash,
                Name: name,
                Role: role,
                MobileNumber: mobile,
                createdAt: new Date().toISOString()
            }
        }

        await dynamodb.put(params).promise();
        
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "signup successful"
            })
        }
    } catch(error) {
        console.error('Error while signup:', error);
    
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Signup Failed' }),
        };
    }
}

export const getUserFromDb = async (userName: string): Promise<any> => {
    const params = {
        TableName: process.env.USERS_TABLE || '',
        KeyConditionExpression: 'UserName = :userName',
        ExpressionAttributeValues: {
        ':userName': userName,
        }
    };

    try {
        const data = await dynamodb.query(params).promise();
        console.log('data from query', data.Items);
        return data.Items;
    } catch (error) {
        console.log('Error occurred while scanning data from DynamoDB', error);
        return null;
    }
};

export const loginController = async (userName: string, password: string, mobile: number): Promise<response> => {
    try {
        if(!userName || !mobile) {
            return {
                statusCode: 400,
                body: "Login details are missing"
            }
        }
        
        if (!password) {
            return {
            statusCode: 500,
            body: "User password is missing",
            };
        }
    
        const user = await getUserFromDb(userName);
    
        console.log("user retrieved from db", user);
    
        if (!user || user.length === 0 || !user[0].Password) {
            return {
            statusCode: 404,
            body: "User not found",
            };
        }
    
        const userPassword = user[0].Password;
    
        const isMatch = await bcrypt.compare(password, userPassword);
    
        console.log("Comparing passwords:", isMatch);
    
        if (!isMatch) {
            return {
            statusCode: 401,
            body: "Invalid password",
            };
        } else {
            console.log("Before generating token")
            const secretKey = process.env.JWT_SECRET || ''
            const token = jwt.sign({UserName: userName}, secretKey, {
            expiresIn: 3600
            })
            console.log("Before generating token")
    
            return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Login successful', token })
            }
        }
  
    } catch(error) {
        console.error('Error while login:', error);
    
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Login Failed!' }),
        };
    }
}

export const getUserController = async (token: string): Promise<response> => {
    try {
  
        // const authToken = event.headers?.authorization || '';
  
        // const token = authToken.split(' ')[1];
  
        const secretKey = process.env.JWT_SECRET || ''
  
        const decodedToken: any = jwt.verify(token, secretKey);
  
        console.log(decodedToken)
  
        if(/*!authToken || */!decodedToken || !decodedToken.UserName) {
            console.log('decodedToken', decodedToken)
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
            };
        }
  
        const userName = decodedToken.UserName;
  
        const user = await getUserFromDb(userName)
        console.log('user in getuser',user)
  
        if(!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "User not found" })
            }
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ user })
        }
    } catch (error) {
        console.error('Error while fetching table items:', error);
    
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed fetching table items' }),
        };
    }
};
  
export const updateUserController = async (token: string, name: string, userName: string, password: string, role: string, mobile: number): Promise<response> => {
    try {
      
        const secretKey = process.env.JWT_SECRET || ''

        const decodedToken: any = jwt.verify(token, secretKey);

        console.log(decodedToken)

        if(!decodedToken || !decodedToken.UserName) {
            console.log('decodedToken',decodedToken)
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
            };
        }

        // const { userName, password, name, role, mobile } = user;

        const hashedPassword = await bcrypt.hash(password, 8);

        const updateExpression = 'SET #password = :password, #name = :name, #role = :role';
        const expressionAttributeNames = {
            '#password': 'Password',
            '#name': 'Name',
            '#role': 'Role',
        };
        const expressionAttributeValues = {
            ':password': hashedPassword,
            ':name': name,
            ':role': role,
        }

        const params = {
            TableName: process.env.USERS_TABLE || '',
            Key: {
            'UserName': userName,
            'MobileNumber': mobile
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        const data = await dynamodb.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Profile updated successfully!' })
        }

    } catch(error) {
        console.error('Error while updating user profile:', error);
    
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to update user profile' }),
        };
    }
}

export const changePasswordController = async (token: string, userName: string, mobile: number, oldPassword: string, newPassword: string): Promise<response> => {
    try {
        const secretKey = process.env.JWT_SECRET || ''

        const decodedToken: any = jwt.verify(token, secretKey);

        console.log(decodedToken)

        if(!decodedToken || !decodedToken.UserName) {
            console.log('decodedToken',decodedToken)
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Unauthorized' }),
            };
        }

        const userNameFromToken = decodedToken.UserName;

        const user = await getUserFromDb(userNameFromToken)
        console.log('user in getuser',user)

        const oldPasswordMatch = await verifyPassword(userName, oldPassword, mobile);
        console.log(oldPasswordMatch)

        if(!oldPasswordMatch) {
            return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Old password is incorrect' }),
            };
        }

        const passwordHash = await bcrypt.hash(newPassword, 8);
        const updatedUser = await updatePassword(userName, passwordHash, mobile);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Password changed successfully', updatedUser })
        }

    } catch(error) {
        console.error('Error while changing password:', error);
    
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Changing password failed' }),
        };
    }
}

const verifyPassword = async (userName: string, password: string, mobile: number) => {
    const user = await getUserFromDb(userName);
    console.log(user[0])

    const passwordFromDb: string = user[0].Password
    console.log(passwordFromDb)

    if(!passwordFromDb || passwordFromDb?.length === 0) {
        return false;
    }

    return await bcrypt.compare(password, passwordFromDb)
}

const updatePassword = async (userName: string, password: string, mobile: number) => {
    try {

        const params = {
            TableName: process.env.USERS_TABLE || '',
            Key: {
                'UserName': userName,
                'MobileNumber': mobile
            },
            UpdateExpression: 'SET Password = :password',
            ExpressionAttributeValues: {
                ':password': password
            }
        };

        const updatedUser = await dynamodb.update(params).promise();
        return updatedUser;

    } catch(error) {
        console.error('Error while updating password:', error);
        throw error;
    }
}