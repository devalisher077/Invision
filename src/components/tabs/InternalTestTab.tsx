import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";


type Question = {
  id: number;
  question: string;
  options: string[];
};

const InternalTestTab: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('questions').select('*');
      if (error) {
        setQuestions([]);
        setLoading(false);
        return;
      }
      
      const formatted = data.map((q: any) => ({
        id: q.id,
        question: q.text, 
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
      }));
      setQuestions(formatted);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubmitMessage('Пользователь не авторизован.');
        setSubmitting(false);
        return;
      }
      const user_id = user.id;
      
      const answersArray = Object.entries(answers).map(([question_id, option_index]) => ({
        user_id,
        question_id: Number(question_id),
        answer: Number(option_index),
      }));
      const { error } = await supabase.from('user_answers').insert(answersArray);
      if (error) throw error;
      setSubmitMessage('Ответы успешно отправлены!');
    } catch (e: any) {
      setSubmitMessage('Ошибка при отправке ответов.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="dashboard-card space-y-2">
        <h3 className="text-lg font-semibold font-display text-foreground">Внутренняя оценка</h3>
        <p className="text-sm text-muted-foreground">
          Пожалуйста, ответьте на все вопросы ниже. Выберите вариант, который лучше всего отражает ваше мнение.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Загрузка...</div>
      ) : questions.length === 0 ? (
        <div className="text-center text-muted-foreground">Вопросы не найдены.</div>
      ) : (
        <>
          {questions.map((q, qIndex) => (
            <div key={q.id} className="dashboard-card space-y-4">
              <p className="text-sm font-semibold text-foreground">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mr-2">
                  {qIndex + 1}
                </span>
                {q.question}
              </p>
              <div className="space-y-2 pl-8">
                {q.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-200 ${
                      answers[q.id] === oIndex
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        answers[q.id] === oIndex ? "border-primary" : "border-muted-foreground/40"
                      }`}
                    >
                      {answers[q.id] === oIndex && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{option}</span>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      className="sr-only"
                      checked={answers[q.id] === oIndex}
                      onChange={() => setAnswers({ ...answers, [q.id]: oIndex })}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-col items-center mt-6">
            <button
              className="px-6 py-2 rounded bg-primary text-primary-foreground font-semibold disabled:opacity-50"
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length !== questions.length}
            >
              {submitting ? 'Отправка...' : 'Сдать тест'}
            </button>
            {submitMessage && (
              <div className="mt-2 text-sm text-muted-foreground">{submitMessage}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default InternalTestTab;
