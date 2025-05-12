"use client";

import { useState, useRef, useEffect } from "react";
import { useBrowser } from "@/contexts/BrowserContext";
import { Button } from "@/components/ui/button";
import { Plus, X, Home, Globe, ShieldAlert } from "lucide-react";
import { BROWSER_NEWTAB, SPECIAL_PAGES } from "@/lib/constants";

export default function TabBar() {
  const { tabs, activeTab, setActiveTab, addTab, closeTab } = useBrowser();
  const [isOverflowing, setIsOverflowing] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
  // Check if tabs container is overflowing
  useEffect(() => {
    const checkOverflow = () => {
      if (tabsContainerRef.current) {
        const { scrollWidth, clientWidth } = tabsContainerRef.current;
        setIsOverflowing(scrollWidth > clientWidth);
      }
    };
    
    // Check initially and on resize
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    
    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [tabs]);
  
  // Scroll active tab into view
  useEffect(() => {
    if (tabsContainerRef.current && activeTab) {
      const activeTabElement = tabsContainerRef.current.querySelector(`[data-tab-id="${activeTab.id}"]`);
      if (activeTabElement) {
        activeTabElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [activeTab]);
  
  // Get tab icon
  const getTabIcon = (tab: typeof tabs[0]) => {
    if (SPECIAL_PAGES.includes(tab.url)) {
      if (tab.url === BROWSER_NEWTAB) {
        return <Home className="h-4 w-4" />;
      }
      return <Home className="h-4 w-4" />;
    }
    
    return tab.favicon ? (
      <img 
        src={tab.favicon} 
        alt="" 
        className="h-4 w-4" 
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    ) : (
      <Globe className="h-4 w-4" />
    );
  };
  
  // Get tab title
  const getTabTitle = (tab: typeof tabs[0]) => {
    if (tab.url === BROWSER_NEWTAB) {
      return "New Tab";
    }
    return tab.title || tab.url;
  };
  
  return (
    <div className="flex items-center w-full h-9 bg-white border-b border-gray-200">
      <div 
        ref={tabsContainerRef}
        className="flex-1 flex items-center overflow-x-auto scrollbar-hide"
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            data-tab-id={tab.id}
            className={`
              flex items-center min-w-[180px] max-w-[240px] h-8 px-2
              border-r border-gray-200 relative group
              ${tab.isActive 
                ? "bg-white text-gray-900 font-medium border-b-2 border-b-blue-500" 
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
            `}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="flex items-center space-x-2 overflow-hidden w-full">
              <div className="flex-shrink-0">
                {getTabIcon(tab)}
              </div>
              <span className="truncate text-sm">
                {getTabTitle(tab)}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 absolute right-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      
      {isOverflowing && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => {
            if (tabsContainerRef.current) {
              tabsContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
            }
          }}
        >
          <div className="h-4 w-4 rotate-90">...</div>
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        onClick={() => addTab()}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
} 