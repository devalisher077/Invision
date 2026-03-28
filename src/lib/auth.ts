// Регистрация пользователя и запись в applicants
export async function registerApplicant(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const user = data.user;
  if (!user) {
    throw new Error('Пользователь создан, но требуется подтверждение email.');
  }
  // Вставка user_id в user_registration теперь происходит автоматически через SQL-триггер
  return user;
}
import { supabase } from './supabase'

// Регистрация пользователя с email и паролем
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  console.log('Supabase signUp result:', data, error)
  if (error) throw error
  return data.user
}
