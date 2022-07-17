import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')
const AWSXRay = require('aws-xray-sdk')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ){}

    async getTodos(userId: String): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId= :userId',
            ExpressionAttributeValues: {':userId': userId}
        }).promise()
        return result.Items as TodoItem[]
    }

    async CreateTodo(userId: string, todoItem: CreateTodoRequest, timestamp: string, todoId: string, uploadUrl: string = ""): Promise <TodoItem> {
        const newTask = {todoId: todoId, userId: userId, done: false, attachmentUrl: uploadUrl, createdAt: timestamp, name: todoItem.name, deadline: todoItem.deadline
        }
        try {
            if (uploadUrl) {
                await this.docClient.put({ TableName: this.todosTable, Item: newTask }).promise()
            } else {
                await this.docClient.put({
                    TableName: this.todosTable,
                    Item: {"userId": userId, "todoId": todoId, "createdAt": timestamp, "name": todoItem.name, "deadline": todoItem.deadline, "done": false}
                }).promise()
            }
        } catch (e) {
            logger.error(`ERROR. ${e}`)
        }
        return newTask
    }

    async UpdateTodo(userId:string, todoId:string, todoItem: TodoUpdate) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {"userId": userId, "todoId": todoId},
            UpdateExpression: "set name=:name, deadline=:deadline, done:=done",
            ExpressionAttributeValues: {":name": todoItem.name, ":deadline": todoItem.deadline, ":done": todoItem.done
            }
        }).promise()
        return
    }

    async DeleteTodo(userId:string, todoId:string) {
        try {
            await this.docClient.delete({
                TableName: this.todosTable,
                Key: {"userId": userId, "todoId": todoId}
            }).promise()
        } catch(e) {
            logger.error(`ERROR. ${e}`)
        }
        return
    }

    async UpdateTodoAttachmentUrl(userId:string, todoId:string, attachmentUrl: string) {
        try{
            await this.docClient.update({
                TableName: this.todosTable,
                Key: {"userId": userId, "todoId": todoId},
                UpdateExpression: "set attachmentUrl=:attachmentUrl",
                ExpressionAttributeValues: {":attachmentUrl": attachmentUrl}
            }).promise()
        } catch (e) {
            logger.error(`ERROR. ${e}`)
        }
        return
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
