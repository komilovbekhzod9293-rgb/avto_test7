import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Lesson, Topic, Question, Answer, QuestionWithAnswers } from '@/types/database';

export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async (): Promise<Lesson[]> => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useTopics(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['topics', lessonId],
    queryFn: async (): Promise<Topic[]> => {
      if (!lessonId) return [];
      
      const { data, error } = await supabase
        .from('topics')
        .select('id, lesson_id, title_uz_cyr, order_index')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!lessonId,
  });
}

export function useQuestions(topicId: string | undefined) {
  return useQuery({
    queryKey: ['questions', topicId],
    queryFn: async (): Promise<Question[]> => {
      if (!topicId) return [];
      
      const { data, error } = await supabase
        .from('questions')
        .select('id, topic_id, question_uz_cyr, image_path, order_index')
        .eq('topic_id', topicId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!topicId,
  });
}

export function useAnswers(questionIds: string[]) {
  return useQuery({
    queryKey: ['answers', questionIds],
    queryFn: async (): Promise<Answer[]> => {
      if (questionIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('answers')
        .select('id, question_id, answer_uz_cyr, is_correct')
        .in('question_id', questionIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: questionIds.length > 0,
  });
}

export function useQuestionsWithAnswers(topicId: string | undefined) {
  const questionsQuery = useQuestions(topicId);
  const questionIds = questionsQuery.data?.map(q => q.id) || [];
  const answersQuery = useAnswers(questionIds);

  const questionsWithAnswers: QuestionWithAnswers[] = (questionsQuery.data || []).map(question => ({
    ...question,
    answers: (answersQuery.data || []).filter(a => a.question_id === question.id),
  }));

  return {
    data: questionsWithAnswers,
    isLoading: questionsQuery.isLoading || answersQuery.isLoading,
    error: questionsQuery.error || answersQuery.error,
  };
}

export function useLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async (): Promise<Lesson | null> => {
      if (!lessonId) return null;
      
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('id', lessonId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
}

export function useTopic(topicId: string | undefined) {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: async (): Promise<Topic | null> => {
      if (!topicId) return null;
      
      const { data, error } = await supabase
        .from('topics')
        .select('id, lesson_id, title_uz_cyr, order_index')
        .eq('id', topicId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!topicId,
  });
}
