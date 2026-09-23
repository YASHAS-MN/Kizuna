export interface Comment {
  id: string
  taskId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

export interface CommentAuthor {
  id: string
  name: string
}
