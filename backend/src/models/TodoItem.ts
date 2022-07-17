export interface TodoItem {
  userId: string
  todoId: string
  createdAt: string
  name: string
  deadline: string
  done: boolean
  attachmentUrl?: string
}
