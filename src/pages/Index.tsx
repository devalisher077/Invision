import React, { useState, useRef } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardBanner from "@/components/dashboard/DashboardBanner";
import TabsNav, { TAB_LIST, TabKey } from "@/components/dashboard/TabsNav";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import ProgressSteps from "@/components/dashboard/ProgressSteps";
import SidebarCard from "@/components/dashboard/SidebarCard";
import PersonalInfoTab from "@/components/tabs/PersonalInfoTab";
import ContactInfoTab from "@/components/tabs/ContactInfoTab";
import EducationTab from "@/components/tabs/EducationTab";
import InternalTestTab from "@/components/tabs/InternalTestTab";
import CertificateTab from "@/components/tabs/CertificateTab";
import { CalendarDays, FileText, Layers, ChevronRight } from "lucide-react";

const deadline = new Date();
deadline.setDate(deadline.getDate() + 23);

const stages = [
  { label: "Подача заявки", status: "active" as const },
  { label: "Первичная проверка", status: "pending" as const },
  { label: "Рассмотрение заявки", status: "pending" as const },
  { label: "Собеседование", status: "pending" as const },
  { label: "Комиссия", status: "pending" as const },
  { label: "Решение", status: "pending" as const },
];

const documents = [
  "Скан паспорта",
  "Сертификат IELTS",
  "Аттестат",
  "Видеопрезентация",
  "Справка о соц. статусе",
];

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("personal");
  const [activeNav, setActiveNav] = useState<"application" | "settings">("application");
  const contentRef = useRef<HTMLDivElement>(null);

  const currentTabIndex = TAB_LIST.findIndex((t) => t.key === activeTab);
  const isLastTab = currentTabIndex === TAB_LIST.length - 1;

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (isLastTab) {
      alert("Заявка отправлена!");
    } else {
      handleTabChange(TAB_LIST[currentTabIndex + 1].key);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal": return <PersonalInfoTab />;
      case "contact": return <ContactInfoTab />;
      case "education": return <EducationTab />;
      case "test": return <InternalTestTab />;
      case "certificate": return <CertificateTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        <DashboardBanner userName="Абитуриент" onSendApplication={() => alert("Заявка отправлена!")} />

        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold font-display text-foreground">Заявка</h2>
          <span className="rounded-full bg-primary/15 text-primary-foreground px-3 py-1 text-xs font-semibold border border-primary/30" style={{ color: "hsl(72, 80%, 30%)" }}>
            Компьютерные науки (бакалавриат)
          </span>
        </div>

        <TabsNav activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex gap-6 items-start">
          <div ref={contentRef} className="flex-1 min-w-0 space-y-0">
            {renderTabContent()}
          </div>

          <aside className="hidden lg:block w-80 shrink-0 sticky top-24 space-y-5">
            <CountdownTimer deadline={deadline} />

            <SidebarCard title="Этапы заявки" icon={<Layers className="h-4 w-4" />}>
              <ProgressSteps steps={stages} />
            </SidebarCard>

            <SidebarCard title="Необходимые документы" icon={<FileText className="h-4 w-4" />}>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc) => (
                  <span
                    key={doc}
                    className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {doc}
                  </span>
                ))}
              </div>
            </SidebarCard>

            <SidebarCard title="Важные даты" icon={<CalendarDays className="h-4 w-4" />}>
              <div className="rounded-xl bg-muted p-4 text-center space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Крайний срок подачи</p>
                <p className="text-lg font-bold font-display text-foreground">
                  {deadline.toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </SidebarCard>
          </aside>
        </div>
      </div>

      <div className="sticky bottom-0 bg-card/80 backdrop-blur-xl border-t border-border z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Шаг {currentTabIndex + 1} из {TAB_LIST.length} —{" "}
            <span className="font-medium text-foreground">{TAB_LIST[currentTabIndex].label}</span>
          </p>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            {isLastTab ? "Отправить заявку" : "Следующий шаг"}
            {!isLastTab && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
