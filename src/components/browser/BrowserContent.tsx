"use client";

import { useEffect, useState } from "react";
import { useBrowser } from "@/contexts/BrowserContext";
import { BROWSER_NEWTAB, BROWSER_BOOKMARKS, BROWSER_HISTORY, BROWSER_SETTINGS, BROWSER_LANDING, SPECIAL_PAGES } from "@/lib/constants";
import NewTabPage from "@/components/pages/NewTabPage";
import BookmarksPage from "@/components/pages/BookmarksPage";
import HistoryPage from "@/components/pages/HistoryPage";
import SettingsPage from "@/components/pages/SettingsPage";
import LandingPage from "@/components/pages/LandingPage";
import { Loader2 } from "lucide-react";

export default function BrowserContent() {
  const { activeTab, tabsWithLoading } = useBrowser();
  const [debugInfo, setDebugInfo] = useState("");
  
  const isLoading = activeTab ? tabsWithLoading[activeTab.id] : false;
  
  // Add debug info
  useEffect(() => {
    if (activeTab) {
      const info = `
        Tab ID: ${activeTab.id}
        URL: ${activeTab.url}
        Loading: ${isLoading ? 'Yes' : 'No'}
        Is special page: ${SPECIAL_PAGES.includes(activeTab.url) ? 'Yes' : 'No'}
        Electron available: ${typeof window !== 'undefined' && window.electron ? 'Yes' : 'No'}
      `;
      setDebugInfo(info);
    }
  }, [activeTab, isLoading]);
  
  // Handle special pages rendering
  const renderSpecialPage = () => {
    if (!activeTab) return null;
    
    switch (activeTab.url) {
      case BROWSER_NEWTAB:
        return <NewTabPage />;
      case BROWSER_BOOKMARKS:
        return <BookmarksPage />;
      case BROWSER_HISTORY:
        return <HistoryPage />;
      case BROWSER_SETTINGS:
        return <SettingsPage />;
      case BROWSER_LANDING:
        return <LandingPage />;
      default:
        return null;
    }
  };
  
  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-gray-500">No active tab</p>
      </div>
    );
  }
  
  // For special pages, render the component
  if (SPECIAL_PAGES.includes(activeTab.url)) {
    return renderSpecialPage();
  }
  
  // For regular web pages, content is managed by Electron BrowserViews
  // We just need a container and possibly a loading indicator
  return (
    <div className="h-full w-full relative bg-white">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-0 left-0 w-full flex items-center justify-center z-50">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
        </div>
      )}
      
      {/* Web content is displayed by Electron BrowserView */}
      <div className="w-full h-full flex-1" />
      
      {/* Debug info - only visible during development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 text-gray-800 p-2 text-xs rounded shadow-md border border-gray-200">
          <pre>{debugInfo}</pre>
        </div>
      )}
    </div>
  );
} 