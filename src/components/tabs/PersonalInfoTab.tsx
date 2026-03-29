import React, { useState } from "react";
import FormInput from "../dashboard/FormInput";
import ToggleGroup from "../dashboard/ToggleGroup";
import SelectInput from "../dashboard/SelectInput";
import FileUploadDropzone from "../dashboard/FileUploadDropzone";


import { supabase } from "../../lib/supabase";

const PersonalInfoTab: React.FC = () => {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("Мужской");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      const { error } = await supabase.from("applicants").upsert([
        {
          user_id,
          last_name: lastName,
          first_name: firstName,
          middle_name: middleName,
          birth_date: birthDate,
          gender,
        },
      ], { onConflict: "user_id" });
      if (error) throw error;
      setMessage("Данные успешно сохранены!");
    } catch (e) {
      setMessage("Ошибка при сохранении данных.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Данные заявителя</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormInput label="Фамилия" placeholder="Введите фамилию" required value={lastName} onChange={setLastName} />
          <FormInput label="Имя" placeholder="Введите имя" required value={firstName} onChange={setFirstName} />
          <FormInput label="Отчество" placeholder="Введите отчество" value={middleName} onChange={setMiddleName} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormInput label="Дата рождения" type="date" required value={birthDate} onChange={setBirthDate} />
          <ToggleGroup label="Пол" options={["Мужской", "Женский"]} value={gender} onChange={setGender} required />
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button
            className="px-6 py-2 rounded bg-primary text-primary-foreground font-semibold disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || !lastName || !firstName || !birthDate}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
