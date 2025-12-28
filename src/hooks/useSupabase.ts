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
    staleTime: 1000 * 60 * 60,
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
    staleTime: 1000 * 60 * 60,
  });
}

export function useAllTopics() {
  return useQuery({
    queryKey: ['all-topics'],
    queryFn: async (): Promise<Topic[]> => {
      const { data, error } = await supabase
        .from('topics')
        .select('id, lesson_id, title_uz_cyr, order_index')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useQuestions(topicId: string | undefined) {
  return useQuery({
    queryKey: ['questions', topicId],
    queryFn: async (): Promise<Question[]> => {
      if (!topicId) return [];
      
      const { data, error } = await supabase
        .from('question_uz_cyr')
        .select('id, topic_id, question_uz_cyr, image_path, order_index')
        .eq('topic_id', topicId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!topicId,
    staleTime: 1000 * 60 * 60,
  });
}

// Fetch questions WITH answers using two separate queries
export function useQuestionsWithAnswers(topicId: string | undefined) {
  return useQuery({
    queryKey: ['questions-with-answers', topicId],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      if (!topicId) return [];
      
      // First: fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('question_uz_cyr')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_index', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      const questions = questionsData as Question[] | null;
      if (!questions || questions.length === 0) return [];
      
      // Second: fetch answers for these questions
      const questionIds = questions.map(q => q.id);
      const { data: answersData, error: answersError } = await supabase
        .from('answer_uz_cyr')
        .select('*')
        .in('question_id', questionIds);
      
      if (answersError) throw answersError;
      
      const answers = answersData as Answer[] | null;
      
      // Merge answers with questions on frontend
      const questionsWithAnswers: QuestionWithAnswers[] = questions.map(q => ({
        ...q,
        answers: (answers || []).filter(a => a.question_id === q.id)
      }));
      
      console.log('[useQuestionsWithAnswers] Loaded', questions.length, 'questions,', (answers || []).length, 'answers');
      
      return questionsWithAnswers;
    },
    enabled: !!topicId,
    staleTime: 1000 * 60 * 60,
  });
}

export function useAllQuestionsWithAnswers() {
  return useQuery({
    queryKey: ['all-questions-with-answers'],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      // First: fetch all questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('question_uz_cyr')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      const questions = questionsData as Question[] | null;
      if (!questions || questions.length === 0) return [];
      
      // Second: fetch all answers for these questions
      const questionIds = questions.map(q => q.id);
      const { data: answersData, error: answersError } = await supabase
        .from('answer_uz_cyr')
        .select('*')
        .in('question_id', questionIds);
      
      if (answersError) throw answersError;
      
      const answers = answersData as Answer[] | null;
      
      // Merge answers with questions on frontend
      const questionsWithAnswers: QuestionWithAnswers[] = questions.map(q => ({
        ...q,
        answers: (answers || []).filter(a => a.question_id === q.id)
      }));
      
      console.log('[useAllQuestionsWithAnswers] Loaded', questions.length, 'questions,', (answers || []).length, 'answers');
      
      return questionsWithAnswers;
    },
    staleTime: 1000 * 60 * 60,
  });
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
    staleTime: 1000 * 60 * 60,
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
    staleTime: 1000 * 60 * 60,
  });
}
