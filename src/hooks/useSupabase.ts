import { useQuery } from '@tanstack/react-query';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { clearSession } from '@/hooks/useAuth';
import type { Lesson, Topic, Question, Answer, QuestionWithAnswers, TrafficSign } from '@/types/database';
import { safeStorage } from '@/lib/safeStorage';
import { getTestLang } from '@/lib/testLang';
import { useTestLang } from '@/hooks/useTestLang';

async function fetchData(action: string, params: Record<string, string> = {}) {
  const session_token = safeStorage.getItem('session_token');
  const device_id = getDeviceId();
  if (!session_token) {
    clearSession();
    if (typeof window !== 'undefined' && !window.location.hash.includes('/auth')) {
      window.location.hash = '#/auth';
    }
    throw new Error('Unauthorized: missing session');
  }
  const { data, error } = await invokeFunction('get-data', { action, ...params, session_token, device_id, lang: getTestLang() });
  if (error) throw new Error(error);
  return data;
}

export function useLessons() {
  const [testLang] = useTestLang();
  return useQuery({
    queryKey: ['lessons', testLang],
    queryFn: async (): Promise<Lesson[]> => {
      return (await fetchData('lessons')) || [];
    },
  });
}

export function useTopics(lessonId: string | undefined) {
  const [testLang] = useTestLang();
  return useQuery({
    queryKey: ['topics', lessonId, testLang],
    queryFn: async (): Promise<Topic[]> => {
      if (!lessonId) return [];
      return (await fetchData('topics', { lesson_id: lessonId })) || [];
    },
    enabled: !!lessonId,
  });
}

export function useAllTopics() {
  const [testLang] = useTestLang();
  return useQuery({
    queryKey: ['all-topics', testLang],
    queryFn: async (): Promise<Topic[]> => {
      return (await fetchData('all-topics')) || [];
    },
  });
}

export function useQuestions(topicId: string | undefined) {
  const [testLang] = useTestLang();
  return useQuery({
    queryKey: ['questions', topicId, testLang],
    queryFn: async (): Promise<Question[]> => {
      if (!topicId) return [];
      return (await fetchData('questions', { topic_id: topicId })) || [];
    },
    enabled: !!topicId,
  });
}

export function useQuestionsWithAnswers(topicId: string | undefined) {
  const [testLang] = useTestLang();
  return useQuery({
    queryKey: ['questions-with-answers', topicId, testLang],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      if (!topicId) return [];
      return (await fetchData('questions-with-answers', { topic_id: topicId })) || [];
    },
    enabled: !!topicId,
  });
}

export function useLesson(lessonId: string | undefined) {
  const [testLang] = useTestLang();
  return useQuery({
    queryKey: ['lesson', lessonId, testLang],
    queryFn: async (): Promise<Lesson | null> => {
      if (!lessonId) return null;
      return (await fetchData('lesson', { lesson_id: lessonId })) || null;
    },
    enabled: !!lessonId,
  });
}

export function useTopic(topicId: string | undefined) {
  const [testLang] = useTestLang();
  return useQuery({
    queryKey: ['topic', topicId, testLang],
    queryFn: async (): Promise<Topic | null> => {
      if (!topicId) return null;
      return (await fetchData('topic', { topic_id: topicId })) || null;
    },
    enabled: !!topicId,
  });
}

export function useTrafficSigns() {
  const [testLang] = useTestLang();
  return useQuery({
    queryKey: ['traffic-signs', testLang],
    queryFn: async (): Promise<TrafficSign[]> => {
      return (await fetchData('traffic-signs')) || [];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}
