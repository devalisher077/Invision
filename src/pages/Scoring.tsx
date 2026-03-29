import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const Scoring: React.FC = () => {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Вспомогательная функция для получения публичной ссылки на файл из bucket education
  function getEducationFileUrl(key?: string | null): string | null {
    if (!key) return null;
    const { data } = supabase.storage.from('education').getPublicUrl(key);
    return data?.publicUrl || null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUserInfo(null);
    try {
      // 1. Найти пользователя по email в user_registration
      const { data: registration, error: regError } = await supabase
        .from('user_registration')
        .select('*')
        .eq('email', email)
        .single();
      if (regError || !registration) {
        setError('Пользователь с таким email не найден');
        setLoading(false);
        return;
      }
      setUserId(registration.user_id);

      // 2. Получить информацию из таблиц
      const [
        { data: applicants },
        { data: education },
        { data: answers },
        { data: questions }
      ] = await Promise.all([
        supabase.from('applicants').select('*').eq('user_id', registration.user_id).single(),
        supabase.from('education').select('*').eq('user_id', registration.user_id).single(),
        supabase.from('user_answers').select('*').eq('user_id', registration.user_id),
        supabase.from('questions').select('*'),
      ]);

      setUserInfo({ registration, applicants, education, answers, questions });
    } catch (err: any) {
      setError('Ошибка при получении данных: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4 font-display text-foreground">AI Scoring для приёмной комиссии</h1>
        <form onSubmit={handleSubmit} className="mb-6 bg-card rounded-xl shadow p-6 flex flex-col gap-4 max-w-lg">
          <label className="block mb-2 font-medium text-muted-foreground">Email кандидата</label>
          <input
            type="email"
            className="border border-border rounded-xl px-3 py-2 w-full mb-2 focus:ring-2 focus:ring-primary/40 focus:outline-none bg-background"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-4 py-2 font-semibold shadow hover:brightness-110 transition-all">Получить информацию</button>
        </form>
        {loading && <div className="text-muted-foreground">Загрузка...</div>}
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        {userInfo && userInfo.applicants && (
          <div className="mt-4 space-y-4">
            <h2 className="text-xl font-bold font-display mb-2 text-foreground">Информация о кандидате</h2>
            <div className="bg-card p-6 rounded-xl shadow flex flex-col gap-4 border border-border">
            <div className="flex gap-4">
              <div className="w-1/2">
                <div className="text-gray-500 text-xs mb-1">Фамилия</div>
                <div className="font-semibold text-base">{userInfo.applicants.last_name}</div>
              </div>
              <div className="w-1/2">
                <div className="text-gray-500 text-xs mb-1">Имя</div>
                <div className="font-semibold text-base">{userInfo.applicants.first_name}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <div className="text-gray-500 text-xs mb-1">Отчество</div>
                <div className="font-semibold text-base">{userInfo.applicants.middle_name}</div>
              </div>
              <div className="w-1/2">
                <div className="text-gray-500 text-xs mb-1">Дата рождения</div>
                <div className="font-semibold text-base">{userInfo.applicants.birth_date}</div>
              </div>
            </div>
          </div>

            {userInfo.education && (
              <div className="bg-card p-6 rounded-xl shadow flex flex-col gap-4 border border-border">
                <h3 className="font-semibold mb-2 text-lg text-foreground">Образование</h3>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <div className="text-gray-500 text-xs mb-1">Видео-презентация</div>
                  {userInfo.education.video_url ? (
                    userInfo.education.video_url.startsWith('http') ? (
                      <a href={userInfo.education.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Смотреть на YouTube</a>
                    ) : (
                      <a href={getEducationFileUrl(userInfo.education.video_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Смотреть видео</a>
                    )
                  ) : <span className="text-gray-400">Нет ссылки</span>}
                </div>
                <div className="w-1/2">
                  <div className="text-gray-500 text-xs mb-1">Тип теста</div>
                  <div className="font-semibold text-base">{userInfo.education.test_type || '—'}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <div className="text-gray-500 text-xs mb-1">Баллы за тест</div>
                  <div className="font-semibold text-base">{userInfo.education.test_score || '—'}</div>
                </div>
                <div className="w-1/2">
                  <div className="text-gray-500 text-xs mb-1">Дата теста</div>
                  <div className="font-semibold text-base">{userInfo.education.test_date || '—'}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <div className="text-gray-500 text-xs mb-1">Сертификат теста</div>
                  {userInfo.education.test_certificate_url ? (
                    <a href={getEducationFileUrl(userInfo.education.test_certificate_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Скачать сертификат</a>
                  ) : <span className="text-gray-400">Нет файла</span>}
                </div>
                <div className="w-1/2">
                  <div className="text-gray-500 text-xs mb-1">Аттестат</div>
                  {userInfo.education.attestat_url ? (
                    <a href={getEducationFileUrl(userInfo.education.attestat_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Скачать аттестат</a>
                  ) : <span className="text-gray-400">Нет файла</span>}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-full">
                  <div className="text-gray-500 text-xs mb-1">Достижения</div>
                  {(() => {
                    const ach = userInfo.education.achievements_urls;
                    if (Array.isArray(ach) && ach.length > 0) {
                      // Если массив массивов (двойной)
                      if (Array.isArray(ach[0])) {
                        return (
                          <ul className="list-disc ml-5">
                            {ach[0].map((a: string, idx: number) => (
                              <li key={a}>
                                <a href={getEducationFileUrl(a)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">
                                  Достижение {idx + 1}
                                </a>
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      // Обычный массив
                      return (
                        <ul className="list-disc ml-5">
                          {ach.map((a: string, idx: number) => (
                            <li key={a}>
                              <a href={getEducationFileUrl(a)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">
                                Достижение {idx + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      );
                    } else if (typeof ach === 'string' && ach.includes(',')) {
                      // Если строка с запятыми (например, "a.jpg,b.jpg")
                      const arr = ach.split(',').map(s => s.trim()).filter(Boolean);
                      return (
                        <ul className="list-disc ml-5">
                          {arr.map((a: string, idx: number) => (
                            <li key={a}>
                              <a href={getEducationFileUrl(a)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">
                                Достижение {idx + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      );
                    } else if (typeof ach === 'string' && ach.length > 0) {
                      // Одиночная строка
                      return (
                        <a href={getEducationFileUrl(ach)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Скачать достижения</a>
                      );
                    } else {
                      return <span className="text-gray-400">Нет файла</span>;
                    }
                  })()}
                </div>
              </div>
            </div>
          )}
            {/* Вопросы и ответы пользователя */}
            {userInfo && userInfo.questions && userInfo.answers && userInfo.answers.length > 0 && (
              <div className="bg-card p-6 rounded-xl shadow flex flex-col gap-4 mt-4 border border-border">
                <h3 className="font-semibold mb-2 text-lg text-foreground">Ответы на вопросы</h3>
              <ul className="list-decimal ml-5">
                {userInfo.questions.map((q: any) => {
                  const answer = userInfo.answers.find((a: any) => a.question_id === q.id);
                  let answerText = '';
                  if (answer) {
                    // Если ответ — число и есть варианты
                    if ((typeof answer.answer === 'number' || (typeof answer.answer === 'string' && !isNaN(Number(answer.answer)))) && (q.options || q.choices)) {
                      const idx = Number(answer.answer);
                      const opts = q.options || q.choices;
                      answerText = Array.isArray(opts) && opts[idx] ? opts[idx] : answer.answer;
                    } else {
                      answerText = answer.answer;
                    }
                  }
                  return (
                    <li key={q.id} className="mb-2">
                      <div className="font-bold">{q.text}</div>
                      <div className="mt-1">
                        {answer ? <span className="text-green-700">{answerText}</span> : <span className="text-gray-400">Нет ответа</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default Scoring;
