import React, { useState } from "react";

const questions = [
  {
    id: 1,
    question: "Какова основная цель высшего образования?",
    options: [
      "Получить диплом",
      "Развить критическое мышление и практические навыки",
      "Соответствовать ожиданиям общества",
      "Отложить выход на рынок труда",
    ],
  },
  {
    id: 2,
    question: "Какое качество наиболее важно для академического успеха?",
    options: [
      "Природный талант",
      "Самодисциплина и последовательность",
      "Финансовые ресурсы",
      "Социальные связи",
    ],
  },
  {
    id: 3,
    question: "Как вы предпочитаете изучать новые концепции?",
    options: [
      "Через лекции и чтение",
      "Через практические проекты и эксперименты",
      "Через групповые обсуждения",
      "Через самостоятельные исследования",
    ],
  },
  {
    id: 4,
    question: "Что мотивирует вас поступить на эту программу?",
    options: [
      "Возможности карьерного роста",
      "Интерес к предмету",
      "Рекомендации других людей",
      "Наличие стипендий",
    ],
  },
  {
    id: 5,
    question: "Как вы справляетесь с академическими трудностями?",
    options: [
      "Сразу обращаюсь к преподавателям",
      "Сначала пытаюсь разобраться самостоятельно",
      "Работаю вместе с однокурсниками",
      "Беру паузу и возвращаюсь позже",
    ],
  },
];

const InternalTestTab: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="dashboard-card space-y-2">
        <h3 className="text-lg font-semibold font-display text-foreground">Внутренняя оценка</h3>
        <p className="text-sm text-muted-foreground">
          Пожалуйста, ответьте на все вопросы ниже. Выберите вариант, который лучше всего отражает ваше мнение.
        </p>
      </div>

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
    </div>
  );
};

export default InternalTestTab;
