import React, {useCallback, useState} from "react";

export type TabItem = {
  id?: string | number;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  tabs: TabItem[];
  initialIndex?: number;
  className?: string;
  tabListClassName?: string;
};

/**
 * Reusable Tabs component
 * - Accepts an array of `tabs` where each tab provides a `label` and a `content` React node.
 * - Highlights the active tab and renders its content below the tab list.
 * - Styling uses Tailwind classes consistent with the codebase.
 */
export function Tabs({tabs, initialIndex = 0, className = "", tabListClassName = ""}: TabsProps) {
  const [activeTab, setActiveTab] = useState<number>(initialIndex ?? 0);

  const handleTabClick = useCallback((index: number, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(index);
  }, []);

  const active = tabs[activeTab];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={`flex gap-4 border-b border-border pb-2 ${tabListClassName}`}
      >
        {tabs.map((t, i) => {
          const isActive = i === activeTab;
          return (
            <button
              key={t.id ?? i}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => handleTabClick(i, t.disabled)}
              disabled={t.disabled}
              className={`-mb-0.5 inline-flex items-center gap-2 px-3 py-2 text-sm transition-colors focus:outline-none ${
                isActive
                  ? "border-b-2 border-primary font-semiBold text-primary"
                  : "text-textSecondary hover:text-primary"
              } ${t.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} `}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {active ? (
          <div role="tabpanel">{active.content}</div>
        ) : (
          <div className="text-textSecondary">No content</div>
        )}
      </div>
    </div>
  );
}

export default Tabs;
