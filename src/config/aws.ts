import * as AWS from "aws-sdk";
import * as dotenv from "dotenv";
// dotenv.config();

export const dynamodb = new AWS.DynamoDB.DocumentClient();

export default AWS;