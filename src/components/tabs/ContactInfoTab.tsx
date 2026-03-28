import React, { useState } from "react";
import FormInput from "../dashboard/FormInput";
import SelectInput from "../dashboard/SelectInput";

const ContactInfoTab: React.FC = () => {
  const [consents, setConsents] = useState({ data: false, communications: false });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Адрес</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <SelectInput
            label="Страна"
            required
            placeholder="Выберите..."
            options={[
              { value: "kz", label: "🇰🇿 Казахстан" },
              { value: "us", label: "🇺🇸 США" },
              { value: "gb", label: "🇬🇧 Великобритания" },
            ]}
          />
          <FormInput label="Область" placeholder="Введите область" required />
          <FormInput label="Город" placeholder="Введите город" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormInput label="Улица" placeholder="Название улицы" required />
          <FormInput label="Дом" placeholder="Номер дома" required />
          <FormInput label="Квартира" placeholder="Номер квартиры" />
        </div>
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Контакты</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormInput label="Телефон" placeholder="+7 (___) ___-____" prefix="+7" required />
          <FormInput label="Эл. почта" placeholder="ваш@email.com" type="email" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormInput label="Instagram" placeholder="@имя_пользователя" />
          <FormInput label="Telegram" placeholder="@имя_пользователя" />
          <FormInput label="WhatsApp" placeholder="+7..." />
        </div>
      </div>

      <div className="dashboard-card space-y-4">
        <h3 className="text-lg font-semibold font-display text-foreground">Согласие</h3>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consents.data}
            onChange={(e) => setConsents({ ...consents, data: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-border text-primary accent-primary"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Я даю согласие на обработку персональных данных в соответствии с политикой конфиденциальности.
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consents.communications}
            onChange={(e) => setConsents({ ...consents, communications: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-border text-primary accent-primary"
          />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Я согласен(а) получать уведомления о статусе моей заявки.
          </span>
        </label>
      </div>
    </div>
  );
};

export default ContactInfoTab;
