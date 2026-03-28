import React from "react";

interface SidebarCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const SidebarCard: React.FC<SidebarCardProps> = ({ title, children, icon }) => {
  return (
    <div className="dashboard-card space-y-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default SidebarCard;
