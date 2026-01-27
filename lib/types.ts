export interface AnonymousProfile {
  browser_id: string
  last_nickname: string
  created_at: string
}

export interface Question {
  id: string
  created_at: string
  title: string
  option_a: string
  option_b: string
  category: string | null
  status: string
  controversy_score: number
}

export interface Vote {
  id: string
  created_at: string
  question_id: string
  browser_id: string
  chosen_option: 'a' | 'b'
}

export interface Comment {
  id: string
  created_at: string
  question_id: string
  browser_id: string
  author_name: string
  content: string
  chosen_option: 'a' | 'b'
}

export interface QuestionStats {
  question_id: string
  count_a: number
  count_b: number
  total_votes: number
}
