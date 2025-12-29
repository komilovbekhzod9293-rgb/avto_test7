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
      return (data as Lesson[]) || [];
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
        .select('id, lesson_id, title_uz_cyr, order_index, youtube_url')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return (data as Topic[]) || [];
    },
    enabled: !!lessonId,
  });
}

export function useAllTopics() {
  return useQuery({
    queryKey: ['all-topics'],
    queryFn: async (): Promise<Topic[]> => {
      const { data, error } = await supabase
        .from('topics')
        .select('id, lesson_id, title_uz_cyr, order_index, youtube_url')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return (data as Topic[]) || [];
    },
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
      return (data as Question[]) || [];
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
      return (data as Answer[]) || [];
    },
    enabled: questionIds.length > 0,
  });
}

export function useQuestionsWithAnswers(topicId: string | undefined) {
  return useQuery({
    queryKey: ['questions-with-answers', topicId],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      if (!topicId) return [];
      
      // Загружаем вопросы
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, topic_id, question_uz_cyr, image_path, order_index')
        .eq('topic_id', topicId)
        .order('order_index', { ascending: true });
      
      if (questionsError) throw questionsError;
      const questions = questionsData as Question[];
      if (!questions || questions.length === 0) return [];
      
      // Загружаем ответы
      const questionIds = questions.map(q => q.id);
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('id, question_id, answer_uz_cyr, is_correct')
        .in('question_id', questionIds);
      
      if (answersError) throw answersError;
      const answers = (answersData as Answer[]) || [];
      
      // Объединяем вопросы с ответами
      const questionsWithAnswers: QuestionWithAnswers[] = questions.map(question => ({
        ...question,
        answers: answers.filter(a => a.question_id === question.id),
      }));
      
      return questionsWithAnswers;
    },
    enabled: !!topicId,
  });
}

// 🔥 ИСПРАВЛЕННЫЙ ХУК - загружает все вопросы с ответами
export function useAllQuestionsWithAnswers() {
  return useQuery({
    queryKey: ['all-questions-with-answers'],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      // Загружаем все вопросы
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, topic_id, question_uz_cyr, image_path, order_index');
      
      if (questionsError) throw questionsError;
      const questions = questionsData as Question[];
      if (!questions || questions.length === 0) return [];
      
      // Загружаем все ответы
      const questionIds = questions.map(q => q.id);
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('id, question_id, answer_uz_cyr, is_correct')
        .in('question_id', questionIds);
      
      if (answersError) throw answersError;
      const answers = (answersData as Answer[]) || [];
      
      // Объединяем вопросы с ответами
      const questionsWithAnswers: QuestionWithAnswers[] = questions.map(question => ({
        ...question,
        answers: answers.filter(a => a.question_id === question.id),
      }));
      
      return questionsWithAnswers;
    },
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
      return data as Lesson | null;
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
        .select('id, lesson_id, title_uz_cyr, order_index, youtube_url')
        .eq('id', topicId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Topic | null;
    },
    enabled: !!topicId,
  });
}
