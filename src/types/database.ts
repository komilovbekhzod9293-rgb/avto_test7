export interface Lesson {
  id: string;
  title: string;
  order_index: number;
}

export interface Topic {
  id: string;
  lesson_id: string;
  title_uz_cyr: string;
  order_index: number;
}

export interface Question {
  id: string;
  topic_id: string;
  question_uz_cyr: string;
  image_path: string | null;
  order_index: number;
}

export interface Answer {
  id: string;
  question_id: string;
  answer_uz_cyr: string;
  is_correct: boolean;
}

export interface Database {
  public: {
    Tables: {
      lessons: {
        Row: Lesson;
      };
      topics: {
        Row: Topic;
      };
      questions: {
        Row: Question;
      };
      answers: {
        Row: Answer;
      };
    };
  };
}

export interface TopicProgress {
  topicId: string;
  bestScore: number;
  completed: boolean;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}
