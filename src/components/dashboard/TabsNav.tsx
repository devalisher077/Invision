import React from "react";
import { User, Phone, BookOpen, ClipboardList, FileCheck } from "lucide-react";

export const TAB_LIST = [
  { key: "personal", label: "Личная информация", icon: User },
  { key: "education", label: "Образование", icon: BookOpen },
  { key: "test", label: "Внутренний тест", icon: ClipboardList },
] as const;

export type TabKey = (typeof TAB_LIST)[number]["key"];

interface TabsNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {TAB_LIST.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive ? "tab-active shadow-sm" : "tab-inactive border border-border"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabsNav;
