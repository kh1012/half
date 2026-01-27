export const queryKeys = {
  questions: ['questions'] as const,
  question: (id: string) => ['questions', id] as const,
  comments: (questionId: string) => ['comments', questionId] as const,
  stats: (questionId: string) => ['stats', questionId] as const,
  votes: (questionId: string) => ['votes', questionId] as const,
}
