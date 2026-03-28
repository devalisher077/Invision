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
        </div>
     
   
  );
};

export default PersonalInfoTab;
