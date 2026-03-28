import React from "react";
import FileUploadDropzone from "../dashboard/FileUploadDropzone";

const CertificateTab: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">
          Справка о социальном статусе
        </h3>
        <p className="text-sm text-muted-foreground">
          Если применимо, загрузите справку о социальном статусе. Этот документ может дать вам право на дополнительную поддержку или стипендию.
        </p>
        <FileUploadDropzone
          label="Справка о социальном статусе"
          description="Официальная справка, выданная соответствующим органом (JPG, PNG, PDF)"
        />
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">Дополнительная информация</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Комментарии или дополнительные сведения
          </label>
          <textarea
            placeholder="Укажите дополнительный контекст о вашем социальном статусе или обстоятельствах..."
            rows={5}
            className="form-input-base resize-none"
          />
        </div>
      </div>

      <div className="dashboard-card space-y-6">
        <h3 className="text-lg font-semibold font-display text-foreground">
          Справка о доходах родителей
          <span className="text-xs font-normal text-muted-foreground ml-2">(Необязательно)</span>
        </h3>
        <FileUploadDropzone
          label="Справка о доходах"
          description="Загрузите документы о доходах, если применимо"
        />
      </div>
    </div>
  );
};

export default CertificateTab;
