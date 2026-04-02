
import React, { useState, useRef } from "react";
 
function sanitizeFileName(name: string): string {
  const cyrillicToLatinMap: Record<string, string> = {
    А: "A", Б: "B", В: "V", Г: "G", Д: "D", Е: "E", Ё: "E", Ж: "Zh", З: "Z", И: "I", Й: "Y", К: "K", Л: "L", М: "M", Н: "N", О: "O", П: "P", Р: "R", С: "S", Т: "T", У: "U", Ф: "F", Х: "Kh", Ц: "Ts", Ч: "Ch", Ш: "Sh", Щ: "Shch", Ы: "Y", Э: "E", Ю: "Yu", Я: "Ya",
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ы: "y", э: "e", ю: "yu", я: "ya"
  };
  return name
    .split("")
    .map(char => cyrillicToLatinMap[char] || char)
    .join("")
    .replace(/[^a-zA-Z0-9_.-]/g, "_"); 
}
import FormInput from "../dashboard/FormInput";
import ToggleGroup from "../dashboard/ToggleGroup";
import FileUploadDropzone from "../dashboard/FileUploadDropzone";
import { supabase } from "../../lib/supabase";

const EducationTab: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [testType, setTestType] = useState("IELTS");
  const [testScore, setTestScore] = useState("");
  const [scoreEnt, setScoreEnt] = useState("");
  const [testDate, setTestDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);


  
  const certRef = useRef<any>(null);
  const attestatRef = useRef<any>(null);
  const achievementsRef = useRef<any>(null);
  const essayRef = useRef<any>(null);

  
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [attestatFiles, setAttestatFiles] = useState<File[]>([]);
  const [achievementFiles, setAchievementFiles] = useState<File[]>([]);
  const [essayFiles, setEssayFiles] = useState<File[]>([]);

  
  const handleCertFiles = (files: File[]) => setCertFiles(files);
  const handleAttestatFiles = (files: File[]) => setAttestatFiles(files);
  const handleAchievementFiles = (files: File[]) => setAchievementFiles(files);
  const handleEssayFiles = (files: File[]) => setEssayFiles(files);


  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("Пользователь не авторизован.");
        setSaving(false);
        return;
      }
      const user_id = user.id;

      
      let test_certificate_url = null;
      if (certFiles.length > 0) {
        const safeCertName = sanitizeFileName(certFiles[0].name);
        const { data, error } = await supabase.storage.from('education').upload(`${user_id}/certificate_${Date.now()}_${safeCertName}`, certFiles[0]);
        if (error) throw error;
        test_certificate_url = data.path;
      }

      
      let attestat_url = null;
      if (attestatFiles.length > 0) {
        const safeAttestatName = sanitizeFileName(attestatFiles[0].name);
        const { data, error } = await supabase.storage.from('education').upload(`${user_id}/attestat_${Date.now()}_${safeAttestatName}`, attestatFiles[0]);
        if (error) throw error;
        attestat_url = data.path;
      }

      
      let achievements_urls: string[] = [];
      for (let i = 0; i < achievementFiles.length; i++) {
        const file = achievementFiles[i];
        const safeAchieveName = sanitizeFileName(file.name);
        const { data, error } = await supabase.storage.from('education').upload(`${user_id}/achievement_${Date.now()}_${safeAchieveName}`, file);
        if (error) throw error;
        achievements_urls.push(data.path);
      }

      
      let essay = null;
      if (essayFiles.length > 0) {
        const safeEssayName = sanitizeFileName(essayFiles[0].name);
        const { data, error } = await supabase.storage.from('education').upload(`${user_id}/essay_${Date.now()}_${safeEssayName}`, essayFiles[0]);
        if (error) throw error;
        essay = data.path;
      }

      
      const upsertData: any = {
        user_id,
        video_url: videoUrl,
        test_type: testType,
        test_score: testScore,
        test_date: testDate,
        test_certificate_url,
        attestat_url,
        achievements_urls,
        essay,
        score_ent: scoreEnt,
      };
      const { error } = await supabase.from('education').upsert([
        upsertData
      ], { onConflict: "user_id" });
      if (error) throw error;
      setMessage("Данные успешно сохранены!");
    } catch (e: any) {
      setMessage("Ошибка при сохранении данных.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Видеопрезентация</h3>
        <FormInput
          label="Ссылка на видео"
          placeholder="https://youtube.com/watch?v=..."
          required
          value={videoUrl}
          onChange={setVideoUrl}
        />
        <p className="text-xs text-muted-foreground">
          Загрузите видеопрезентацию на YouTube вставьте ссылку выше.
        </p>
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Тест по английскому языку</h3>
        <ToggleGroup
          label="Тип теста"
          options={["IELTS", "TOEFL"]}
          value={testType}
          onChange={setTestType}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormInput label="Общий балл" placeholder="6.0" required value={testScore} onChange={setTestScore} />
          <FormInput label="Дата сдачи" type="date" required value={testDate} onChange={setTestDate} />
        </div>
        <FileUploadDropzone label="Загрузите сертификат теста" required onFilesChange={handleCertFiles} />
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Дополнительные документы</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FileUploadDropzone
            label="Аттестат / Диплом"
            required
            description="Загрузите последний документ об образовании (JPG, PNG, PDF)"
            onFilesChange={handleAttestatFiles}
          />
          <FormInput label="Общий балл ЕНТ" placeholder="100" value={scoreEnt} onChange={setScoreEnt} />
        </div>
        <FileUploadDropzone
          label="Дополнительные документы"
          description="Если у вас есть дополнительная информация о вашем образовании, вы можете загрузить её здесь."
          onFilesChange={handleAchievementFiles}
        />
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Эссе</h3>
        <FileUploadDropzone
          label="Загрузите эссе 450 слов (Word или PDF)"
          required={false}
          accept=".doc,.docx,.pdf"
          description="Файл эссе в формате DOC, DOCX или PDF. Максимум 10 МБ."
          onFilesChange={handleEssayFiles}
        />
        <div className="flex items-center gap-4 mt-6">
          <button
            className="px-6 py-2 rounded bg-primary text-primary-foreground font-semibold disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || !videoUrl || !testScore || !testDate || certFiles.length === 0 || attestatFiles.length === 0}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
      </div>
    </div>
  );
};

export default EducationTab;
