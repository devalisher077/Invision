import React, { useState } from "react";
import FormInput from "../dashboard/FormInput";
import ToggleGroup from "../dashboard/ToggleGroup";
import SelectInput from "../dashboard/SelectInput";
import FileUploadDropzone from "../dashboard/FileUploadDropzone";

const PersonalInfoTab: React.FC = () => {
  const [gender, setGender] = useState("Мужской");
  const [docType, setDocType] = useState("Паспорт");

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Данные заявителя</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormInput label="Фамилия" placeholder="Введите фамилию" required />
          <FormInput label="Имя" placeholder="Введите имя" required />
          <FormInput label="Отчество" placeholder="Введите отчество" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormInput label="Дата рождения" type="date" required />
          <ToggleGroup label="Пол" options={["Мужской", "Женский"]} value={gender} onChange={setGender} required />
        </div>
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Гражданство</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectInput
            label="Страна гражданства"
            required
            placeholder="Выберите..."
            options={[
              { value: "kz", label: "🇰🇿 Казахстан" },
              { value: "us", label: "🇺🇸 США" },
              { value: "gb", label: "🇬🇧 Великобритания" },
              { value: "ru", label: "🇷🇺 Россия" },
              { value: "tr", label: "🇹🇷 Турция" },
            ]}
          />
          <FormInput label="ИИН" placeholder="Введите ИИН" required />
        </div>
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Документ, удостоверяющий личность</h3>
        <ToggleGroup label="Тип документа" options={["Паспорт", "Удостоверение личности"]} value={docType} onChange={setDocType} required />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormInput label="Номер документа" placeholder="Введите номер" required />
          <FormInput label="Орган выдачи" placeholder="Кем выдан" required />
          <FormInput label="Дата выдачи" type="date" required />
        </div>
        <FileUploadDropzone label="Загрузите скан документа" required />
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Данные родителей / опекунов</h3>
        <div className="space-y-5">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Отец</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInput label="Фамилия" placeholder="Фамилия отца" />
            <FormInput label="Имя" placeholder="Имя отца" />
            <FormInput label="Телефон" placeholder="+7 (___) ___-____" />
          </div>
        </div>
        <div className="border-t border-border pt-5 space-y-5">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Мать</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInput label="Фамилия" placeholder="Фамилия матери" />
            <FormInput label="Имя" placeholder="Имя матери" />
            <FormInput label="Телефон" placeholder="+7 (___) ___-____" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
