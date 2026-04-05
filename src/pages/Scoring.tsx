import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'admin@gmail.com';
const FILE_URL_TTL_SECONDS = 60 * 60;

function collectEducationFileKeys(education: any): string[] {
  if (!education) return [];

  const keys: string[] = [];
  const baseKeys = [
    education.video_url,
    education.test_certificate_url,
    education.attestat_url,
    education.essay,
  ];

  for (const key of baseKeys) {
    if (typeof key === 'string' && key.length > 0 && !key.startsWith('http')) {
      keys.push(key);
    }
  }

  const achievements = education.achievements_urls;
  if (Array.isArray(achievements)) {
    const flat = Array.isArray(achievements[0]) ? achievements[0] : achievements;
    for (const key of flat) {
      if (typeof key === 'string' && key.length > 0 && !key.startsWith('http')) {
        keys.push(key);
      }
    }
  } else if (typeof achievements === 'string' && achievements.length > 0) {
    const values = achievements.includes(',')
      ? achievements.split(',').map(item => item.trim()).filter(Boolean)
      : [achievements];

    for (const key of values) {
      if (!key.startsWith('http')) {
        keys.push(key);
      }
    }
  }

  return Array.from(new Set(keys));
}

const Scoring: React.FC = () => {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [isAnalyzingEssay, setIsAnalyzingEssay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const isAdmin = currentUserEmail === ADMIN_EMAIL;

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setCurrentUserEmail(data.user?.email ?? null);
      setAuthChecked(true);
    };

    syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserEmail(session?.user?.email ?? null);
      setAuthChecked(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadSignedUrls = async () => {
      const keys = collectEducationFileKeys(userInfo?.education);
      if (keys.length === 0) {
        setSignedUrls({});
        return;
      }

      const urlEntries = await Promise.all(
        keys.map(async key => {
          const { data, error } = await supabase.storage
            .from('education')
            .createSignedUrl(key, FILE_URL_TTL_SECONDS);

          if (error || !data?.signedUrl) {
            return [key, ''] as const;
          }

          return [key, data.signedUrl] as const;
        })
      );

      setSignedUrls(Object.fromEntries(urlEntries.filter(([, url]) => Boolean(url))));
    };

    loadSignedUrls();
  }, [userInfo?.education]);

  function getEducationFileUrl(key?: string | null): string | null {
    if (!key) return null;
    if (String(key).startsWith('http')) return key;
    return signedUrls[key] || null;
  }

  function parseResultLLM(result: any): string {
    try {
      if (typeof result === 'string') {
        let cleaned = result.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(cleaned);
        return JSON.stringify(parsed, null, 2);
      } else {
        return JSON.stringify(result, null, 2);
      }
    } catch (e) {
      return String(result);
    }
  }

  function renderValue(value: any): React.ReactNode {
    if (value === null || value === undefined) {
      return '—';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map((item, i) => <div key={i}>{renderValue(item)}</div>);
      }
      if (value.score !== undefined && value.reason !== undefined) {
        return (
          <div>
            <div className="font-semibold">{value.score}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{value.reason}</div>
          </div>
        );
      }
      return JSON.stringify(value);
    }
    return String(value);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      setError('Доступ к Scoring разрешен только для admin@gmail.com');
      return;
    }

    setLoading(true);
    setError(null);
    setUserInfo(null);
      setIsSearching(true);
    try {
      
      const { data: registration, error: regError } = await supabase
        .from('user_registration')
        .select('*')
        .eq('email', email)
        .single();
      if (regError || !registration) {
        setError('Пользователь с таким email не найден');
        setLoading(false);
          setIsSearching(false);
        return;
      }
      setUserId(registration.user_id);

      
      const [
        { data: applicants },
        { data: education },
        { data: answers },
        { data: questions },
        { data: videoTranscripts },
        { data: essayResults }
      ] = await Promise.all([
        supabase.from('applicants').select('*').eq('user_id', registration.user_id).single(),
        supabase.from('education').select('*').eq('user_id', registration.user_id).single(),
        supabase.from('user_answers').select('*').eq('user_id', registration.user_id),
        supabase.from('questions').select('*'),
        supabase.from('video_transcripts').select('*').eq('user_id', registration.user_id),
        supabase
          .from('essay_results')
          .select('*')
          .eq('user_id', registration.user_id)
          .order('created_at', { ascending: false }),
      ]);

      setUserInfo({ registration, applicants, education, answers, questions, videoTranscripts, essayResults });
    } catch (err: any) {
      setError('Ошибка при получении данных: ' + (err.message || err));
    } finally {
        setIsSearching(false);
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold font-display text-foreground">Scoring для приёмной комиссии</h1>
          <p className="mt-3 text-sm text-muted-foreground">Проверяем учетную запись и права доступа.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm space-y-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Доступ запрещен</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Страница Scoring доступна только для учетной записи {ADMIN_EMAIL}.
            </p>
          </div>
          <div className="rounded-xl bg-muted p-4 text-sm text-foreground">
            {currentUserEmail
              ? `Сейчас выполнен вход под: ${currentUserEmail}`
              : 'Сейчас пользователь не авторизован.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4 font-display text-foreground">Scoring для приёмной комиссии</h1>
        <form onSubmit={handleSubmit} className="mb-6 bg-card rounded-xl shadow p-6 flex flex-col gap-4 max-w-lg">
          <label className="block mb-2 font-medium text-muted-foreground">Email кандидата</label>
          <input
            type="email"
            className="border border-border rounded-xl px-3 py-2 w-full mb-2 focus:ring-2 focus:ring-primary/40 focus:outline-none bg-background"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-xl bg-primary text-primary-foreground px-4 py-2 font-semibold shadow hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Получить информацию
          </button>
        </form>
                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-16 gap-6">
                    <div className="relative flex items-center justify-center w-20 h-20">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-20 animate-ping" />
                      <span className="absolute inline-flex h-14 w-14 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                      <svg className="relative z-10 h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl font-bold text-foreground tracking-wide">Поиск кандидата</span>
                      <span className="text-sm text-muted-foreground">Загружаем данные, пожалуйста подождите…</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
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
              <div className="flex flex-col md:flex-row md:items-start gap-0">
                <div className="w-full md:w-1/3 self-start">
                  <div className="text-gray-500 text-xs mb-1">Видео-презентация</div>
                  {userInfo.education.video_url ? (
                    String(userInfo.education.video_url).startsWith('http') ? (
                      <a href={userInfo.education.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Смотреть видео</a>
                    ) : (
                      <a href={getEducationFileUrl(userInfo.education.video_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Смотреть видео</a>
                    )
                  ) : <span className="text-gray-400">Нет ссылки</span>}
                  <button
                    className="mt-2 block w-fit rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isAnalyzingVideo}
                    onClick={async () => {
                      if (!userInfo.education.video_url) return alert('Нет видео для анализа');
                      setLoading(true);
                      setIsAnalyzingVideo(true);
                      setError(null);
                      try {
                        const res = await fetch('http://localhost:8000/analyze-video', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            videoUrl: userInfo.education.video_url,
                            userId: userId,
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Ошибка анализа');

                        if (userId) {
                          const { data: refreshedTranscripts, error: refreshError } = await supabase
                            .from('video_transcripts')
                            .select('*')
                            .eq('user_id', userId);

                          if (refreshError) {
                            throw new Error(refreshError.message || 'Ошибка обновления результатов анализа');
                          }

                          setUserInfo((prev: any) => ({
                            ...prev,
                            videoTranscripts: refreshedTranscripts || [],
                          }));
                        }
                      } catch (err: any) {
                        setError('Ошибка анализа видео: ' + (err.message || err));
                      } finally {
                        setIsAnalyzingVideo(false);
                        setLoading(false);
                      }
                    }}
                  >
                    Анализ видеоданных с использованием LLM
                  </button>
                  {isAnalyzingVideo && (
                    <div className="mt-2 inline-flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                      <span className="text-sm font-medium animate-pulse">Идет анализ кандидата, AI анализирует...</span>
                    </div>
                  )}
                  <div className="text-gray-500 text-xs mb-1">Эссе</div>
                  {userInfo.education.essay ? (() => {
                    const url = getEducationFileUrl(userInfo.education.essay);
                    return (
                      <div className="flex flex-col gap-1">
                        <a
                          href={url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline font-medium"
                        >
                          Открыть эссе
                        </a>
                        <button
                          className="mt-2 w-fit rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={isAnalyzingEssay}
                          onClick={async () => {
                            if (!url) {
                              setError('Нет файла эссе для анализа');
                              return;
                            }

                            setLoading(true);
                            setIsAnalyzingEssay(true);
                            setError(null);
                            try {
                              const res = await fetch('http://localhost:8000/analyze-essay', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  essayUrl: url,
                                  userId,
                                }),
                              });

                              const data = await res.json();
                              if (!res.ok) throw new Error(data.error || 'Ошибка анализа эссе');

                              if (userId) {
                                const { data: refreshedTranscripts, error: refreshError } = await supabase
                                  .from('video_transcripts')
                                  .select('*')
                                  .eq('user_id', userId);

                                const { data: refreshedEssayResults, error: essayRefreshError } = await supabase
                                  .from('essay_results')
                                  .select('*')
                                  .eq('user_id', userId)
                                  .order('created_at', { ascending: false });

                                if (refreshError) {
                                  throw new Error(refreshError.message || 'Ошибка обновления результатов анализа');
                                }

                                if (essayRefreshError) {
                                  throw new Error(essayRefreshError.message || 'Ошибка обновления результатов анализа эссе');
                                }

                                setUserInfo((prev: any) => ({
                                  ...prev,
                                  videoTranscripts: refreshedTranscripts || [],
                                  essayResults: refreshedEssayResults || [],
                                }));
                              }
                            } catch (err: any) {
                              setError('Ошибка анализа эссе: ' + (err.message || err));
                            } finally {
                              setIsAnalyzingEssay(false);
                              setLoading(false);
                            }
                          }}
                        >
                          Анализ эссе с использованием LLM
                        </button>
                        {isAnalyzingEssay && (
                          <div className="mt-1 inline-flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-sm font-medium animate-pulse">Идет анализ эссе, AI анализирует...</span>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <span className="text-gray-400">Нет файла</span>
                  )}
                </div>
                <div className="w-full md:w-1/3 self-start">
                  <div className="text-gray-500 text-xs mb-1">Тип теста</div>
                  <div className="font-semibold text-base">{userInfo.education.test_type || '—'}</div>
                  <div className="text-gray-500 text-xs mt-3 mb-1">Баллы за тест</div>
                  <div className="font-semibold text-base flex items-center gap-2">
                    <span>{userInfo.education.test_score || '—'}</span>
                    {(() => {
                      const testType = String(userInfo.education.test_type || '').toLowerCase();
                      const score = Number(userInfo.education.test_score);
                      const isLowIelts = testType.includes('ielts') && !Number.isNaN(score) && score < 6.0;
                      const isPassIelts = testType.includes('ielts') && !Number.isNaN(score) && score > 6.0;

                      if (isLowIelts) {
                        return (
                          <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-medium border border-rose-200">
                            Предупреждение: не подходит по требованиям
                          </span>
                        );
                      }

                      if (isPassIelts) {
                        return (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium border border-emerald-200">
                            Проходит требования
                          </span>
                        );
                      }

                      return null;
                    })()}
                  </div>
                  <div className="text-gray-500 text-xs mt-3 mb-1">Сертификат теста</div>
                  {userInfo.education.test_certificate_url ? (
                    <a href={getEducationFileUrl(userInfo.education.test_certificate_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Скачать сертификат</a>
                  ) : <span className="text-gray-400">Нет файла</span>}
                  <div className="text-gray-500 text-xs mb-1">Дата теста</div>
                  <div className="font-semibold text-base">{userInfo.education.test_date || '—'}</div>
                </div>
                <div className="w-full md:w-1/3 self-start">
                  <div className="text-gray-500 text-xs mb-1">Аттестат</div>
                  {userInfo.education.attestat_url ? (
                    <a href={getEducationFileUrl(userInfo.education.attestat_url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Скачать аттестат</a>
                  ) : <span className="text-gray-400">Нет файла</span>}
                  <div className="text-gray-500 text-xs mt-3 mb-1">Баллы ЕНТ</div>
                  <div className="font-semibold text-base flex items-center gap-2">
                    <span>{userInfo.education.score_ent ?? '—'}</span>
                    {(() => {
                      const entScore = Number(userInfo.education.score_ent);
                      const isLowEnt = !Number.isNaN(entScore) && entScore < 80;
                      const isPassEnt = !Number.isNaN(entScore) && entScore > 80;

                      if (isLowEnt) {
                        return (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-medium border border-amber-200">
                            Предупреждение: не подходит по требованиям
                          </span>
                        );
                      }

                      if (isPassEnt) {
                        return (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium border border-emerald-200">
                            Проходит требования
                          </span>
                        );
                      }

                      return null;
                    })()}
                  </div>
                  <div className="text-gray-500 text-xs mt-3 mb-1">Достижения</div>
                  {(() => {
                    const ach = userInfo.education.achievements_urls;
                    if (Array.isArray(ach) && ach.length > 0) {
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

            <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50 p-5 shadow-sm">
              <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-sky-200/40 blur-2xl" />
              <div className="flex items-start gap-3 relative">
                <div className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white text-sm font-bold">
                  i
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-sky-900">
                    Важно: окончательное решение принимает приемная комиссия
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-sky-900/90">
                    AI выполняет только вспомогательный анализ данных кандидата и помогает выявлять качества,
                    которые могли быть не замечены при первичном рассмотрении человеком.
                  </p>
                </div>
              </div>
            </div>

            {userInfo && userInfo.videoTranscripts && userInfo.videoTranscripts.length > 0 && (
              <div className="bg-card p-6 rounded-xl shadow flex flex-col gap-4 mt-4 border border-border">
                <h3 className="font-semibold mb-2 text-lg text-foreground">Оценивание видео с использованием методов искусственного интеллекта</h3>
                <div className="space-y-4">
                  {(() => {
                    const latestTranscript = userInfo.videoTranscripts.sort((a: any, b: any) => {
                      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    })[0];

                    return (
                      <div key={latestTranscript.id} className="bg-muted p-4 rounded-lg border border-border/50">
                        
                        
                        {(() => {
                          try {
                            if (typeof latestTranscript.result_llm === 'string') {
                              let cleaned = latestTranscript.result_llm.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
                              return JSON.parse(cleaned);
                            }
                            return latestTranscript.result_llm;
                          } catch {
                            return null;
                          }
                        })() ? (
                          <div className="space-y-3">
                            {(() => {
                              const resultData = (() => {
                                try {
                                  if (typeof latestTranscript.result_llm === 'string') {
                                    let cleaned = latestTranscript.result_llm.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
                                    return JSON.parse(cleaned);
                                  }
                                  return latestTranscript.result_llm;
                                } catch {
                                  return null;
                                }
                              })();

                              return (
                                <>
                                  {resultData?.overall_score !== undefined && (
                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                      <div className="text-xs text-gray-500 mb-1">Общая оценка видео кандидата</div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{resultData.overall_score}/10</div>
                                      </div>
                                    </div>
                                  )}

                                  {resultData?.scores && typeof resultData.scores === 'object' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                      {Object.entries(resultData.scores).map(([key, value]: [string, any]) => (
                                        <div key={key} className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                          <div className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</div>
                                          <div className="text-lg font-semibold text-amber-700 dark:text-amber-300">{renderValue(value)}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {resultData?.professionalism && (
                                    <div className="bg-background p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 mb-1 font-semibold">Профессионализм</div>
                                      <div className="text-sm text-foreground">{renderValue(resultData.professionalism)}</div>
                                    </div>
                                  )}

                                  {resultData?.communication && (
                                    <div className="bg-background p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 mb-1 font-semibold">Коммуникация</div>
                                      <div className="text-sm text-foreground">{renderValue(resultData.communication)}</div>
                                    </div>
                                  )}

                                  {resultData?.content_quality && (
                                    <div className="bg-background p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 mb-1 font-semibold">Качество содержания</div>
                                      <div className="text-sm text-foreground">{renderValue(resultData.content_quality)}</div>
                                    </div>
                                  )}

                                  {resultData?.strengths && Array.isArray(resultData.strengths) && resultData.strengths.length > 0 && (
                                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                      <div className="text-xs text-green-700 dark:text-green-400 font-semibold mb-2">✓ Сильные стороны</div>
                                      <ul className="space-y-1">
                                        {resultData.strengths.map((strength: any, i: number) => (
                                          <li key={i} className="text-sm text-green-700 dark:text-green-300">• {renderValue(strength)}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {resultData?.improvements && Array.isArray(resultData.improvements) && resultData.improvements.length > 0 && (
                                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                      <div className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold mb-2">⚠ Области для улучшения</div>
                                      <ul className="space-y-1">
                                        {resultData.improvements.map((improvement: any, i: number) => (
                                          <li key={i} className="text-sm text-yellow-700 dark:text-yellow-300">• {renderValue(improvement)}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {resultData?.summary && (
                                    <div className="bg-background p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 mb-1 font-semibold">Заключение</div>
                                      <div className="text-sm text-foreground leading-relaxed">{renderValue(resultData.summary)}</div>
                                    </div>
                                  )}

                                  {resultData?.recommendation && (
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">ℹ Рекомендация</div>
                                      <div className="text-sm text-blue-700 dark:text-blue-300">{renderValue(resultData.recommendation)}</div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">Нет данных анализа</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {userInfo && userInfo.essayResults && userInfo.essayResults.length > 0 && (
              <div className="bg-card p-6 rounded-xl shadow flex flex-col gap-4 mt-4 border border-border">
                <h3 className="font-semibold mb-2 text-lg text-foreground">Оценивание эссе с использованием методов искусственного интеллекта</h3>
                <div className="space-y-4">
                  {(() => {
                    const latestEssayResult = userInfo.essayResults.sort((a: any, b: any) => {
                      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    })[0];

                    const resultEssay = (() => {
                      try {
                        if (typeof latestEssayResult.result_essay === 'string') {
                          let cleaned = latestEssayResult.result_essay.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
                          return JSON.parse(cleaned);
                        }
                        return latestEssayResult.result_essay;
                      } catch {
                        return latestEssayResult.result_essay;
                      }
                    })();

                    return (
                      <div className="bg-muted p-4 rounded-lg border border-border/50">
                        {resultEssay ? (
                          <div className="space-y-3">
                            {resultEssay?.overall_score !== undefined && (
                              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div className="text-xs text-gray-500 mb-1">Общая оценка эссе кандидата</div>
                                <div className="flex items-center gap-2">
                                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{resultEssay.overall_score}/10</div>
                                </div>
                              </div>
                            )}

                            {resultEssay?.scores && typeof resultEssay.scores === 'object' && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {Object.entries(resultEssay.scores).map(([key, value]: [string, any]) => (
                                  <div key={key} className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <div className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</div>
                                    <div className="text-lg font-semibold text-amber-700 dark:text-amber-300">{renderValue(value)}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {resultEssay?.professionalism && (
                              <div className="bg-background p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1 font-semibold">Профессионализм</div>
                                <div className="text-sm text-foreground">{renderValue(resultEssay.professionalism)}</div>
                              </div>
                            )}

                            {resultEssay?.communication && (
                              <div className="bg-background p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1 font-semibold">Коммуникация</div>
                                <div className="text-sm text-foreground">{renderValue(resultEssay.communication)}</div>
                              </div>
                            )}

                            {resultEssay?.content_quality && (
                              <div className="bg-background p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1 font-semibold">Качество содержания</div>
                                <div className="text-sm text-foreground">{renderValue(resultEssay.content_quality)}</div>
                              </div>
                            )}

                            {resultEssay?.strengths && Array.isArray(resultEssay.strengths) && resultEssay.strengths.length > 0 && (
                              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="text-xs text-green-700 dark:text-green-400 font-semibold mb-2">✓ Сильные стороны</div>
                                <ul className="space-y-1">
                                  {resultEssay.strengths.map((strength: any, i: number) => (
                                    <li key={i} className="text-sm text-green-700 dark:text-green-300">• {renderValue(strength)}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {resultEssay?.improvements && Array.isArray(resultEssay.improvements) && resultEssay.improvements.length > 0 && (
                              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold mb-2">⚠ Области для улучшения</div>
                                <ul className="space-y-1">
                                  {resultEssay.improvements.map((improvement: any, i: number) => (
                                    <li key={i} className="text-sm text-yellow-700 dark:text-yellow-300">• {renderValue(improvement)}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {resultEssay?.summary && (
                              <div className="bg-background p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1 font-semibold">Заключение</div>
                                <div className="text-sm text-foreground leading-relaxed">{renderValue(resultEssay.summary)}</div>
                              </div>
                            )}

                            {resultEssay?.recommendation && (
                              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">ℹ Рекомендация</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">{renderValue(resultEssay.recommendation)}</div>
                              </div>
                            )}

                            {typeof resultEssay === 'object' &&
                              resultEssay?.overall_score === undefined &&
                              !resultEssay?.scores &&
                              !resultEssay?.professionalism &&
                              !resultEssay?.communication &&
                              !resultEssay?.content_quality &&
                              !resultEssay?.strengths &&
                              !resultEssay?.improvements &&
                              !resultEssay?.summary &&
                              !resultEssay?.recommendation && (
                                <div className="bg-background p-3 rounded-lg">
                                  <div className="text-xs text-gray-500 mb-1 font-semibold">Результат анализа эссе</div>
                                  <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words overflow-auto">
                                    {JSON.stringify(resultEssay, null, 2)}
                                  </pre>
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">Нет данных анализа</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {userInfo && userInfo.questions && userInfo.answers && userInfo.answers.length > 0 && (
              <div className="bg-card p-6 rounded-xl shadow flex flex-col gap-4 mt-4 border border-border">
                <h3 className="font-semibold mb-2 text-lg text-foreground">Ответы на вопросы кандидата</h3>
              <ul className="list-decimal ml-5">
                {userInfo.questions.map((q: any) => {
                  const answer = userInfo.answers.find((a: any) => a.question_id === q.id);
                  let answerText = '';
                  if (answer) {
                    
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
