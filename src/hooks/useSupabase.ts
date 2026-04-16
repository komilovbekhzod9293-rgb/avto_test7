import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Lesson, Topic, Question, Answer, QuestionWithAnswers } from '@/types/database';

async function fetchData(action: string, params: Record<string, string> = {}) {
  const { data, error } = await supabase.functions.invoke('get-data', {
    body: { action, ...params },
  });
  if (error) throw error;
  return data?.data ?? data;
}

export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async (): Promise<Lesson[]> => {
      return (await fetchData('lessons')) || [];
    },
  });
}

export function useTopics(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['topics', lessonId],
    queryFn: async (): Promise<Topic[]> => {
      if (!lessonId) return [];
      return (await fetchData('topics', { lesson_id: lessonId })) || [];
    },
    enabled: !!lessonId,
  });
}

export function useAllTopics() {
  return useQuery({
    queryKey: ['all-topics'],
    queryFn: async (): Promise<Topic[]> => {
      return (await fetchData('all-topics')) || [];
    },
  });
}

export function useQuestions(topicId: string | undefined) {
  return useQuery({
    queryKey: ['questions', topicId],
    queryFn: async (): Promise<Question[]> => {
      if (!topicId) return [];
      return (await fetchData('questions', { topic_id: topicId })) || [];
    },
    enabled: !!topicId,
  });
}

export function useQuestionsWithAnswers(topicId: string | undefined) {
  return useQuery({
    queryKey: ['questions-with-answers', topicId],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      if (!topicId) return [];
      return (await fetchData('questions-with-answers', { topic_id: topicId })) || [];
    },
    enabled: !!topicId,
  });
}

export function useAllQuestionsWithAnswers() {
  return useQuery({
    queryKey: ['all-questions-with-answers'],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      return (await fetchData('all-questions-with-answers')) || [];
    },
  });
}

export function useLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async (): Promise<Lesson | null> => {
      if (!lessonId) return null;
      return (await fetchData('lesson', { lesson_id: lessonId })) || null;
    },
    enabled: !!lessonId,
  });
}

export function useTopic(topicId: string | undefined) {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: async (): Promise<Topic | null> => {
      if (!topicId) return null;
      return (await fetchData('topic', { topic_id: topicId })) || null;
    },
    enabled: !!topicId,
  });
}
