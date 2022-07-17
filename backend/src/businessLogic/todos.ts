import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { APIGatewayProxyEvent} from 'aws-lambda'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { getUserId } from '../lambda/utils';
import * as uuid from 'uuid'

const todoAccess = new TodosAccess()
const attachmentUtils= new AttachmentUtils()

export async function getTodos (event: APIGatewayProxyEvent): Promise<TodoItem[]> {
  const userId = getUserId(event)
  return await todoAccess.getTodos(userId)
}

export async function createTodo (
  userId: string,
  todoItem: CreateTodoRequest,
  uploadUrl: string = ""
): Promise<TodoItem> {
  const timestamp = new Date().toISOString()
  const todoId = uuid.v4()
  const newItem = await todoAccess.CreateTodo(userId, todoItem, timestamp, todoId, uploadUrl)
  return newItem
}

export async function updateTodo(
  userId: string,
  todoId: string,
  todoItem: UpdateTodoRequest
) {
  return todoAccess.UpdateTodo(userId, todoId, todoItem)
}

export async function deleteTodo(userId: string, todoId: string) {
  return todoAccess.DeleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(todoId: string) {
   const uploadUrl = await attachmentUtils.getUploadUrl(todoId)
   return uploadUrl
}

export async function updateTodoAttachmentUrl(
  userId: string,
  todoId: string,
) {
  const attachmentUrl = attachmentUtils.getImageS3Url(todoId)
  return await todoAccess.UpdateTodoAttachmentUrl(userId, todoId, attachmentUrl)
}
