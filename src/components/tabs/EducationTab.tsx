import React, { useState } from "react";
import FormInput from "../dashboard/FormInput";
import ToggleGroup from "../dashboard/ToggleGroup";
import FileUploadDropzone from "../dashboard/FileUploadDropzone";

const EducationTab: React.FC = () => {
  const [testType, setTestType] = useState("IELTS");

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Видеопрезентация</h3>
        <FormInput
          label="Ссылка на видео"
          placeholder="https://youtube.com/watch?v=..."
          required
        />
        <p className="text-xs text-muted-foreground">
          Загрузите видеопрезентацию на YouTube или Vimeo и вставьте ссылку выше.
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
          <FormInput label="Общий балл" placeholder="напр. 7.0" required />
          <FormInput label="Дата сдачи" type="date" required />
        </div>
        <FileUploadDropzone label="Загрузите сертификат теста" required />
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Дополнительные документы</h3>
        <FileUploadDropzone
          label="Аттестат / Диплом"
          required
          description="Загрузите последний документ об образовании (JPG, PNG, PDF)"
        />
        <FileUploadDropzone
          label="Дополнительные документы"
          description="Любые дополнительные подтверждающие документы (необязательно)"
        />
      </div>
    </div>
  );
};

export default EducationTab;
