# InvVision Jective team KZ

Веб-приложение для цифровой приемной кампании университета. Проект объединяет личный кабинет абитуриента, загрузку документов, внутреннее тестирование, отдельный интерфейс для приемной комиссии и локальный AI-backend для анализа видеоинтервью и эссе.

## Что реализовано

- Регистрация и вход пользователей через Supabase Auth.
- Пошаговая анкета абитуриента с навигацией по разделам.
- Сохранение личных данных в Supabase.
- Загрузка образовательных документов и материалов в Supabase Storage.
- Прохождение внутреннего теста с загрузкой вопросов из базы данных.
- Отдельная страница Scoring для приемной комиссии.
- Агрегация профиля кандидата из нескольких таблиц Supabase по email.
- Запуск AI-анализа видеопрезентации и эссе через локальный FastAPI backend.
- Отображение результатов анализа, предупреждений по пороговым баллам и связанных файлов кандидата.

## Архитектура

Проект теперь построен как full-stack система из двух частей:

- frontend: Vite + React + TypeScript;
- backend: FastAPI + Whisper + Gemini + Supabase Python client.

### 1. Клиентский слой

- `src/main.tsx` монтирует React-приложение.
- `src/App.tsx` поднимает глобальные провайдеры и маршруты:
	- `/` — анкета абитуриента.
	- `/Scoring` — кабинет приемной комиссии.
	- `*` — fallback-страница `NotFound`.
- Используются `BrowserRouter`, `QueryClientProvider`, тосты и tooltip-провайдеры.

Важно: `@tanstack/react-query` уже подключен на уровне приложения, но в текущем коде данные в основном загружаются через прямые вызовы `supabase` внутри компонентов, без `useQuery` и `useMutation`.

### 2. UI-слой

Интерфейс разделен на два типа компонентов:

- Доменные компоненты в `src/components/dashboard` и `src/components/tabs`.
- Базовые UI-компоненты в `src/components/ui`, сгенерированные вокруг Radix UI и стилизованные через Tailwind.

Основные доменные блоки:

- `DashboardHeader` — авторизация, регистрация, отображение текущего пользователя.
- `DashboardBanner` — верхний banner анкеты.
- `TabsNav` — переключение между этапами заявки.
- `PersonalInfoTab` — личные данные.
- `EducationTab` — образовательные данные и загрузка файлов.
- `InternalTestTab` — внутренний тест и отправка ответов.
- `Scoring` — агрегированный профиль кандидата для приемной комиссии.

### 3. Слой данных

Точка входа в инфраструктуру данных находится в `src/lib/supabase.ts`. Клиент создается из переменных окружения:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Приложение работает напрямую с Supabase из браузера и использует три механизма:

- `Auth` — регистрация, вход, выход, отслеживание сессии.
- `Database` — чтение и запись анкетных данных.
- `Storage` — загрузка сертификатов, аттестатов, достижений и эссе.

### 4. Backend слой

Backend находится в папке `WhisperProject` и реализован в `WhisperProject/main.py`.

Что делает backend:

- поднимает FastAPI приложение;
- разрешает CORS для frontend;
- принимает запросы на анализ видео и эссе;
- скачивает исходные файлы по URL;
- извлекает аудио через `ffmpeg`;
- транскрибирует видео через `OpenAI Whisper` модель `base`;
- отправляет текст в Gemini для аналитического scoring;
- сохраняет результат анализа обратно в Supabase.

Текущие backend endpoints:

- `POST /analyze-video`
- `POST /analyze-essay`

### 5. AI / scoring слой

Страница `Scoring` выполняет две задачи:

1. Собирает карточку кандидата из Supabase.
2. Инициирует внешний AI-анализ видео и эссе.

Frontend обращается к локальному HTTP API backend:

- `POST http://127.0.0.1:8000/analyze-video`
- `POST http://127.0.0.1:8000/analyze-essay`

После успешного анализа интерфейс повторно читает данные из таблиц `video_transcripts` и `essay_results` и обновляет экран.

### 6. AI pipeline

#### Анализ видео

1. Frontend отправляет `videoUrl` и `userId` на `/analyze-video`.
2. Backend скачивает видео во временный файл.
3. Через `ffmpeg` извлекается mono-audio с частотой 16 kHz.
4. Whisper транскрибирует аудио в текст.
5. Gemini получает транскрипт и строит структурированный JSON scoring кандидата.
6. Backend сохраняет `video_url`, `transcript` и `result_llm` в `video_transcripts`.
7. Frontend перечитывает таблицу и показывает свежий результат.

#### Анализ эссе

1. Frontend отправляет `essayUrl` и `userId` на `/analyze-essay`.
2. Backend скачивает файл эссе.
3. Для `docx` текст читается через `python-docx`, для текстовых файлов читается напрямую.
4. Текст эссе отправляется в тот же LLM-пайплайн оценки.
5. Результат сохраняется в `essay_results`.
6. Frontend обновляет данные кандидата и показывает итог анализа.


## Поток работы приложения

### Сценарий абитуриента

1. Пользователь регистрируется или входит через `DashboardHeader`.
2. На странице заявки заполняет личные данные.
3. Вкладка `PersonalInfoTab` делает `upsert` в таблицу `applicants` по `user_id`.
4. Вкладка `EducationTab` загружает файлы в bucket `education` и сохраняет метаданные в таблицу `education`.
5. Вкладка `InternalTestTab` читает вопросы из таблицы `questions` и записывает ответы в `user_answers`.

### Сценарий приемной комиссии

1. Сотрудник вводит email кандидата на странице `Scoring`.
2. Приложение ищет пользователя в таблице `user_registration`.
3. По найденному `user_id` параллельно загружаются:
	 - `applicants`
	 - `education`
	 - `user_answers`
	 - `questions`
	 - `video_transcripts`
	 - `essay_results`
4. Интерфейс строит единую карточку кандидата и показывает:
	 - личные данные;
	 - документы и ссылки на материалы;
	 - баллы по тестам;
	 - результаты AI-анализа.
5. При необходимости комиссия запускает повторный анализ видео или эссе из UI.

## Структура проекта

```text
WhisperProject/        # Python backend для AI-анализа
  main.py              # FastAPI приложение и AI pipeline
src/
	components/
		dashboard/      # доменные компоненты анкеты
		tabs/           # шаги анкеты
		ui/             # базовые shadcn/radix-компоненты
	hooks/            # вспомогательные hooks
	lib/              # интеграции с Supabase и внешними сервисами
	pages/            # маршруты приложения
	test/             # Vitest тесты
```

## Ключевые модули

### Анкета абитуриента

Страница `Index` управляет локальным состоянием текущего шага, навигацией вперед/назад и выбором направления обучения. Основная бизнес-логика разнесена по вкладкам.

### Личные данные

`PersonalInfoTab` сохраняет:

- фамилию;
- имя;
- отчество;
- дату рождения;
- пол.

Сохранение выполняется через `upsert` в таблицу `applicants`.

### Образование и документы

`EducationTab` реализует:

- ввод ссылки на видеопрезентацию;
- ввод данных по языковому тесту;
- ввод балла ЕНТ;
- загрузку сертификата теста;
- загрузку аттестата или диплома;
- загрузку дополнительных достижений;
- загрузку эссе.


### Внутренний тест

`InternalTestTab`:

- читает список вопросов из таблицы `questions`;
- нормализует массив опций;
- дает пользователю выбрать ответы;
- отправляет результаты в таблицу `user_answers`.

### Модуль Scoring

Страница `Scoring` — центральный модуль для комиссии. Она:

- агрегирует данные кандидата из нескольких таблиц;
- строит ссылки на файлы через `supabase.storage.from('education').getPublicUrl(...)`;
- показывает предупреждения по порогам IELTS и ЕНТ;
- запускает AI-анализ видео и эссе;
- рендерит полученные структурированные результаты оценки.

Для видео дополнительно отображается последняя запись анализа из `video_transcripts`, а для эссе — последние записи из `essay_results`.

### Backend AI сервис

`WhisperProject/main.py` реализует всю серверную логику анализа. Внутри него находятся:

- Pydantic-модели запросов `AnalyzeRequest` и `AnalyzeEssayRequest`;
- функции `download_file`, `extract_audio`, `transcribe_video`;
- единая функция `analyze_leadership`, которая формирует prompt для Gemini;
- endpoints для видео и эссе;
- сохранение результатов в Supabase.



## Зависимости от внешней инфраструктуры

Для полной работоспособности проект ожидает наличие:

- настроенного Supabase проекта;
- таблиц базы данных, используемых в коде;
- bucket `education` в Supabase Storage;
- установленного `ffmpeg` в системе;
- Python окружения для backend;
- локального FastAPI backend на `127.0.0.1:8000` с маршрутами анализа видео и эссе.

Используемые таблицы по коду:

- `user_registration`
- `applicants`
- `education`
- `questions`
- `user_answers`
- `video_transcripts`
- `essay_results`

Для backend используется server-side ключ Supabase, потому что результаты анализа записываются напрямую из Python сервиса.


## Запуск проекта

### Frontend

```bash
npm install
npm run dev
```

Ожидаемый запуск backend после установки зависимостей:

```bash
cd WhisperProject
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Демо-данные

 email для проверки раздела комиссии:

- `jective@gmail.com`
- `test77@gmail.com`


## Назначение проекта

InvVision автоматизирует прием абитуриентов в одном интерфейсе:

- абитуриент подает заявку и загружает материалы;
- система централизованно хранит документы и ответы;
- приемная комиссия получает единый экран кандидата;
- AI помогает дополнительно анализировать эссе и видеопрезентацию, не заменяя финальное решение человека.

## Скриншоты

<img width="1920" height="1080" alt="Invision" src="https://github.com/user-attachments/assets/f14607bf-f906-46f4-86ec-203656e073a7" />
<img width="1920" height="1080" alt="1" src="https://github.com/user-attachments/assets/980d39f6-3114-47b0-a88f-e7913fcf5d75" />
<img width="1920" height="1080" alt="2" src="https://github.com/user-attachments/assets/2787cde3-be91-4886-8333-808a12db4610" />
<img width="1920" height="1080" alt="3" src="https://github.com/user-attachments/assets/d673cf93-4146-493d-b57e-d764c80e6777" />
<img width="1920" height="1080" alt="4" src="https://github.com/user-attachments/assets/91e6c0a4-eac5-4ee5-ba82-261db04edf13" />
<img width="1920" height="1080" alt="6" src="https://github.com/user-attachments/assets/c5d15d92-7fb2-4ac8-9676-5931e8f9b084" />
<img width="1920" height="1080" alt="7" src="https://github.com/user-attachments/assets/bcbfa1a1-d620-4327-9782-ac1012b6887c" />
<img width="1920" height="1080" alt="8" src="https://github.com/user-attachments/assets/1029ee08-0aa1-455b-adb6-28de1b57f1fd" />
<img width="1920" height="1080" alt="9" src="https://github.com/user-attachments/assets/13acb1c7-ba0c-4822-b371-873ce12d1422" />





