/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateTodoRequest {
  name: string
  deadline: string
  done: boolean
}