import React from "react";
import { GraduationCap, HelpCircle } from "lucide-react";

interface DashboardHeaderProps {
  activeNav: "application" | "settings";
  onNavChange: (nav: "application" | "settings") => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ activeNav, onNavChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display text-foreground">InVision U</span>
          </div>
          <nav className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => onNavChange("application")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeNav === "application" ? "tab-active" : "tab-inactive"
              }`}
            >
              Заявка
            </button>
            <button
              onClick={() => onNavChange("settings")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeNav === "settings" ? "tab-active" : "tab-inactive"
              }`}
            >
              Настройки
            </button>
          </nav>
        </div>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-4 w-4" />
          Поддержка
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
