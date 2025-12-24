import React, { useState, createContext, useContext } from "react";
import clsx from "clsx";

interface TabsContextValue {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const Tabs: React.FC<{ 
  children: React.ReactNode; 
  defaultIndex?: number;
  value?: number;
  onChange?: (index: number) => void;
}> = ({
  children,
  defaultIndex = 0,
  value,
  onChange,
}) => {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const selectedIndex = value !== undefined ? value : internalIndex;
  const setSelectedIndex = onChange || setInternalIndex;

  return (
    <TabsContext.Provider value={{ selectedIndex, setSelectedIndex }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const { selectedIndex, setSelectedIndex } = useContext(TabsContext)!;
  const tabs = React.Children.toArray(children) as React.ReactElement[];

  return (
    <div className={clsx("flex gap-1", className)}>
      {tabs.map((tab, index) =>
        React.cloneElement(tab, {
          key: index,
          isSelected: index === selectedIndex,
          onClick: () => setSelectedIndex(index),
        })
      )}
    </div>
  );
};

export const Tab: React.FC<{
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ children, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-4 py-2 text-sm font-medium transition-colors",
        isSelected
          ? "text-slate-50 border-b-2 border-sky-500"
          : "text-slate-400 hover:text-slate-300"
      )}
    >
      {children}
    </button>
  );
};

export const TabPanels: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedIndex } = useContext(TabsContext)!;
  const panels = React.Children.toArray(children) as React.ReactElement[];
  const currentPanel = panels[selectedIndex];

  return <div>{currentPanel ? React.cloneElement(currentPanel, { key: selectedIndex }) : null}</div>;
};

export const TabPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

