import React from "react";
import { Send } from "lucide-react";

interface DashboardBannerProps {
  userName: string;
  onSendApplication: () => void;
}

const DashboardBanner: React.FC<DashboardBannerProps> = ({ userName, onSendApplication }) => {
  return (
    <div
      className="rounded-2xl p-8 text-card relative overflow-hidden"
      style={{ background: "var(--banner-gradient)" }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-20 h-32 w-32 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-4 left-20 h-24 w-24 rounded-full bg-primary blur-2xl" />
      </div>
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-display text-white">
            Уважаемый(ая) {userName},
          </h1>
          <p className="text-sm text-white/70 max-w-lg">
            Пожалуйста, заполните форму, загрузите документы и отправьте вашу заявку!
          </p>
        </div>
        <button
          onClick={onSendApplication}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          <Send className="h-4 w-4" />
          Отправить заявку
        </button>
      </div>
    </div>
  );
};

export default DashboardBanner;
