"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { 
  searchEngines,
  Tab,
  Bookmark,
  HistoryItem
} from "@/lib/mock-data";
import { 
  BROWSER_DEFAULT_URL, 
  BROWSER_NEWTAB,
  SPECIAL_PAGES,
  BROWSER_BOOKMARKS,
  BROWSER_HISTORY
} from "@/lib/constants";
import { storage, BrowserSettings, DEFAULT_SETTINGS } from "@/lib/storage";
import { getFavicon, isValidUrl } from "@/lib/utils";

type BrowserContextType = {
  tabs: Tab[];
  activeTab: Tab | null;
  bookmarks: Bookmark[];
  history: HistoryItem[];
  currentSearchEngine: typeof searchEngines[0];
  settings: BrowserSettings;
  isLoadingTabs: boolean;
  tabsWithLoading: Record<string, boolean>;
  setActiveTab: (tabId: string) => void;
  addTab: (url?: string) => void;
  closeTab: (tabId: string) => void;
  updateTab: (tabId: string, data: Partial<Tab>) => void;
  navigateTo: (url: string, tabId?: string) => void;
  addBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
  removeBookmark: (bookmarkId: string) => void;
  isBookmarked: (url: string) => boolean;
  setSearchEngine: (engineId: string) => void;
  updateSettings: (newSettings: Partial<BrowserSettings>) => void;
  clearHistory: () => Promise<void>;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
  exportBrowserData: () => Promise<string>;
  importBrowserData: (jsonData: string) => Promise<void>;
  clearBrowserData: () => Promise<void>;
  removeHistoryItem: (historyId: string) => Promise<void>;
};

const BrowserContext = createContext<BrowserContextType | undefined>(undefined);

export function BrowserProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<BrowserSettings>(DEFAULT_SETTINGS);
  const [currentSearchEngineId, setCurrentSearchEngineId] = useState<string>('1');
  const [isLoadingTabs, setIsLoadingTabs] = useState(true);
  const [tabsWithLoading, setTabsWithLoading] = useState<Record<string, boolean>>({});
  
  // Initialize state from storage
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoadingTabs(true);
        
        // Load settings first, as other operations may depend on it
        const storedSettings = await storage.getSettings();
        setSettings(storedSettings);
        
        // Load tabs - don't create a default tab anymore
        const storedTabs = await storage.getTabs();
        setTabs(storedTabs);
        
        // Load bookmarks
        const storedBookmarks = await storage.getBookmarks();
        setBookmarks(storedBookmarks);
        
        // Load history
        const storedHistory = await storage.getHistory();
        setHistory(storedHistory);
        
        // Load search engine
        const storedSearchEngine = await storage.getSearchEngine();
        setCurrentSearchEngineId(storedSearchEngine);
        
        setIsLoadingTabs(false);
      } catch (error) {
        console.error("Error initializing browser data:", error);
        setIsLoadingTabs(false);
      }
    };
    
    initializeData();
  }, []);
  
  // Set up Electron event listeners
  useEffect(() => {
    // Only run in Electron environment
    if (typeof window === 'undefined' || !window.electron) return;
    
    // Listen for tab title updates
    window.electron.onTabTitleUpdated((tabId, title) => {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === tabId ? { ...tab, title } : tab
        )
      );
    });
    
    // Listen for tab favicon updates
    window.electron.onTabFaviconUpdated((tabId, favicon) => {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === tabId ? { ...tab, favicon } : tab
        )
      );
    });
    
    // Listen for tab loading status
    window.electron.onTabLoading((tabId, isLoading) => {
      setTabsWithLoading(prev => ({ ...prev, [tabId]: isLoading }));
    });
    
    // Listen for tab URL updates
    window.electron.onTabUrlUpdated((tabId, url) => {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === tabId ? { ...tab, url } : tab
        )
      );
      
      // Add to history if not a special page
      if (!SPECIAL_PAGES.includes(url)) {
        const currentTab = tabs.find(tab => tab.id === tabId);
        if (currentTab) {
          addToHistory(url, currentTab.title || url);
        }
      }
    });
    
    // Listen for new tab requests (e.g., from target="_blank" links)
    window.electron.onNewTabRequested((url) => {
      addTab(url);
    });
    
    return () => {
      // Clean up event listeners
      if (window.electron) {
        window.electron.removeAllListeners();
      }
    };
  }, [tabs]);
  
  // Save tabs when they change
  useEffect(() => {
    if (tabs.length > 0 && !isLoadingTabs) {
      const saveTabsData = async () => {
        await storage.saveTabs(tabs);
        
        // Also save active tab ID
        const activeTab = tabs.find(tab => tab.isActive);
        if (activeTab) {
          await storage.saveActiveTabId(activeTab.id);
        }
      };
      
      saveTabsData();
    }
  }, [tabs, isLoadingTabs]);
  
  // Save bookmarks when they change
  useEffect(() => {
    if (bookmarks.length > 0 && !isLoadingTabs) {
      storage.saveBookmarks(bookmarks);
    }
  }, [bookmarks, isLoadingTabs]);
  
  // Save history when it changes
  useEffect(() => {
    if (history.length > 0 && !isLoadingTabs) {
      storage.saveHistory(history);
    }
  }, [history, isLoadingTabs]);
  
  // Save settings when they change
  useEffect(() => {
    if (!isLoadingTabs) {
      storage.saveSettings(settings);
    }
  }, [settings, isLoadingTabs]);
  
  // Save search engine when it changes
  useEffect(() => {
    if (!isLoadingTabs) {
      storage.saveSearchEngine(currentSearchEngineId);
    }
  }, [currentSearchEngineId, isLoadingTabs]);
  
  // Create Electron tab windows for all tabs
  useEffect(() => {
    if (isLoadingTabs || tabs.length === 0 || typeof window === 'undefined' || !window.electron) return;
    
    const createTabWindows = async () => {
      for (const tab of tabs) {
        if (!SPECIAL_PAGES.includes(tab.url)) {
          await window.electron.createTab(tab.id, tab.url);
        }
      }
    };
    
    createTabWindows();
  }, [isLoadingTabs]);
  
  // Get current search engine object
  const currentSearchEngine = searchEngines.find(engine => engine.id === currentSearchEngineId) || searchEngines[0];
  
  // Get active tab
  const activeTab = tabs.find(tab => tab.isActive) || null;
  
  // Set active tab
  const setActiveTab = async (tabId: string) => {
    console.log(`Setting active tab to ${tabId}`);
    
    // Update tab state
    setTabs(tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId,
    })));
    
    // In Electron environment, also update the active BrowserView
    if (typeof window !== 'undefined' && window.electron) {
      try {
        await window.electron.setActiveTab(tabId);
      } catch (error) {
        console.error("Error setting active tab in Electron:", error);
      }
    }
  };
  
  // Add new tab
  const addTab = useCallback(async (url?: string) => {
    const newTabId = `tab-${Date.now()}`;
    const targetUrl = url || BROWSER_NEWTAB;
    
    // Create new tab
    const newTab: Tab = {
      id: newTabId,
      title: 'New Tab',
      url: targetUrl,
      favicon: '',
      isActive: true,
      isPinned: false,
    };
    
    // Add to tabs array and set as active
    setTabs(prevTabs => prevTabs.map(tab => ({
      ...tab,
      isActive: false
    })).concat(newTab));
    
    // Create the actual tab window if it's not a special page
    if (!SPECIAL_PAGES.includes(targetUrl) && typeof window !== 'undefined' && window.electron) {
      await window.electron.createTab(newTabId, targetUrl);
    }
    
    // Add to history if it's a real URL
    if (!SPECIAL_PAGES.includes(targetUrl)) {
      addToHistory(targetUrl, 'New Tab');
    }
  }, []);
  
  // Close tab
  const closeTab = useCallback(async (tabId: string) => {
    const tabToClose = tabs.find(tab => tab.id === tabId);
    if (!tabToClose) return;
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    let newTabs = tabs.filter(tab => tab.id !== tabId);
    
    // If we're closing the active tab, activate another tab
    if (tabToClose.isActive && newTabs.length > 0) {
      // Try to activate the tab to the left, or the first tab if none
      const newActiveIndex = Math.max(0, tabIndex - 1);
      newTabs = newTabs.map((tab, i) => ({
        ...tab,
        isActive: i === newActiveIndex
      }));
    }
    
    // If closing the last tab, create a new one
    if (newTabs.length === 0) {
      await addTab();
      
      // Also close the Electron window for the tab
      if (typeof window !== 'undefined' && window.electron) {
        await window.electron.closeTab(tabId);
      }
      
      return;
    }
    
    setTabs(newTabs);
    
    // Close the Electron window for the tab
    if (typeof window !== 'undefined' && window.electron) {
      await window.electron.closeTab(tabId);
    }
  }, [tabs, addTab]);
  
  // Update tab
  const updateTab = (tabId: string, data: Partial<Tab>) => {
    setTabs(prevTabs => prevTabs.map(tab => {
      if (tab.id === tabId) {
        return { ...tab, ...data };
      }
      return tab;
    }));
  };
  
  // Add to history
  const addToHistory = useCallback(async (url: string, title: string) => {
    try {
      const favicon = getFavicon(url);
      
      // Generate a unique ID using timestamp and random number
      const uniqueId = `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newHistoryItem: HistoryItem = {
        id: uniqueId,
        title: title || url,
        url: url,
        favicon: favicon,
        visitedAt: new Date().toISOString()
      };
      
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
    } catch (error) {
      console.error("Error adding to history:", error);
    }
  }, []);
  
  // Remove history item
  const removeHistoryItem = async (historyId: string) => {
    setHistory(prevHistory => prevHistory.filter(item => item.id !== historyId));
    await storage.saveHistory(history.filter(item => item.id !== historyId));
  };
  
  // Clear history
  const clearHistory = async () => {
    setHistory([]);
    await storage.clearHistory();
  };
  
  // Navigate to URL
  const navigateTo = async (inputUrl: string, tabId?: string) => {
    console.log(`Navigating to URL: ${inputUrl} in tab: ${tabId || activeTab?.id || 'new'}`);
    
    let url = inputUrl.trim();
    let targetTabId = tabId || (activeTab ? activeTab.id : null);
    
    try {
      // Handle home button click
      if (url === 'home') {
        url = BROWSER_DEFAULT_URL;
      }
      
      // Format URL (add http:// if needed)
      if (!url.startsWith('about:') && !url.startsWith('http')) {
        // If it looks like a domain, add https://
        if (url.includes('.') && !url.includes(' ')) {
          console.log('Formatting URL as domain:', url);
          url = `https://${url}`;
        } else {
          // Otherwise, treat as search query
          console.log('Formatting URL as search query:', url);
          url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }
      }
      
      // When in Electron, use the IPC bridge to navigate
      if (typeof window !== 'undefined' && window.electron) {
        console.log('Using Electron for navigation');
        
        if (!targetTabId) {
          // Create a new tab
          console.log('Creating new tab for navigation');
          targetTabId = `tab-${Date.now()}`;
          
          // Update local state first for immediate feedback
          const newTab: Tab = {
            id: targetTabId,
            title: url,
            url: url,
            isActive: true,
            favicon: getFavicon(url),
            isPinned: false
          };
          
          setTabs(prevTabs => {
            return prevTabs.map(tab => ({
              ...tab,
              isActive: false
            })).concat(newTab);
          });
          
          // Enable loading indicator - ensure targetTabId is treated as string
          const tabIdKey = targetTabId;
          setTabsWithLoading(prev => ({
            ...prev,
            [tabIdKey]: true
          }));
          
          try {
            // Actually create the tab in Electron
            console.log('Calling Electron createTab');
            const result = await window.electron.createTab(targetTabId, url);
            console.log('Electron createTab result:', result);
            
            // Mark as active in Electron
            await window.electron.setActiveTab(targetTabId);
          } catch (error) {
            console.error('Error creating tab in Electron:', error);
          }
        } else {
          console.log(`Navigating existing tab ${targetTabId} to ${url}`);
          
          // Enable loading indicator for the tab - ensure targetTabId is treated as string
          const tabIdKey = targetTabId;
          setTabsWithLoading(prev => ({
            ...prev,
            [tabIdKey]: true
          }));
          
          try {
            // Navigate the tab in Electron
            console.log('Calling Electron navigateTab');
            const result = await window.electron.navigateTab(targetTabId, url);
            console.log('Electron navigateTab result:', result);
            
            // Update the URL in React state
            setTabs(prevTabs => 
              prevTabs.map(tab => 
                tab.id === targetTabId
                  ? { ...tab, url: url }
                  : tab
              )
            );
          } catch (error) {
            console.error('Error navigating tab in Electron:', error);
          }
        }
      } else {
        console.log('Not in Electron, using React state for navigation');
        // Not in Electron, just update React state
        
        if (!targetTabId) {
          // Create a new tab
          targetTabId = `tab-${Date.now()}`;
          const newTab: Tab = {
            id: targetTabId,
            title: url,
            url: url,
            isActive: true,
            favicon: getFavicon(url),
            isPinned: false
          };
          
          setTabs(prevTabs => {
            return prevTabs.map(tab => ({
              ...tab,
              isActive: false
            })).concat(newTab);
          });
        } else {
          // Update existing tab
          setTabs(prevTabs => 
            prevTabs.map(tab => 
              tab.id === targetTabId
                ? { ...tab, url: url }
                : tab
            )
          );
        }
      }
      
      // Add to history unless it's a special page
      if (!SPECIAL_PAGES.includes(url)) {
        addToHistory(url, url);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      
      // Disable loading indicator in case of error
      if (targetTabId) {
        const tabIdKey = targetTabId;
        setTabsWithLoading(prev => ({
          ...prev,
          [tabIdKey]: false
        }));
      }
    }
  };
  
  // Get title for special pages
  const getSpecialPageTitle = (url: string) => {
    switch (url) {
      case BROWSER_NEWTAB:
        return 'New Tab';
      case BROWSER_DEFAULT_URL:
        return 'Zen Browser';
      case BROWSER_BOOKMARKS:
        return 'Bookmarks';
      case BROWSER_NEWTAB:
        return 'New Tab';
      case BROWSER_BOOKMARKS:
        return 'Bookmarks';
      case BROWSER_HISTORY:
        return 'History';
      default:
        return url;
    }
  };
  
  // Add bookmark
  const addBookmark = (bookmark: Omit<Bookmark, "id" | "createdAt">) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `bookmark-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setBookmarks(prevBookmarks => [...prevBookmarks, newBookmark]);
  };
  
  // Remove bookmark
  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.id !== bookmarkId));
  };
  
  // Check if URL is bookmarked
  const isBookmarked = (url: string) => {
    return bookmarks.some(bookmark => bookmark.url === url);
  };
  
  // Set search engine
  const setSearchEngine = (engineId: string) => {
    setCurrentSearchEngineId(engineId);
  };
  
  // Update settings
  const updateSettings = (newSettings: Partial<BrowserSettings>) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
      
      // Apply settings that need immediate effect
      // For example, if doNotTrack changed, update all tab sessions
      if (typeof window !== 'undefined' && window.electron && 
          prev.doNotTrack !== updatedSettings.doNotTrack) {
        // This would be handled in Electron main process
      }
      
      return updatedSettings;
    });
  };
  
  // Navigation controls
  const goBack = () => {
    if (!activeTab) return;
    
    // Special page handling
    if (SPECIAL_PAGES.includes(activeTab.url)) {
      // Handle special page navigation history later
      return;
    }
    
    // Use Electron for real page navigation
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.goBack(activeTab.id);
    }
  };
  
  const goForward = () => {
    if (!activeTab) return;
    
    // Special page handling
    if (SPECIAL_PAGES.includes(activeTab.url)) {
      // Handle special page navigation history later
      return;
    }
    
    // Use Electron for real page navigation
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.goForward(activeTab.id);
    }
  };
  
  const refresh = () => {
    if (!activeTab) return;
    
    // Special page handling
    if (SPECIAL_PAGES.includes(activeTab.url)) {
      // Just re-render for special pages
      const currentUrl = activeTab.url;
      // Force re-render by changing URL and changing back
      updateTab(activeTab.id, { url: '' });
      setTimeout(() => {
        updateTab(activeTab.id, { url: currentUrl });
      }, 50);
      return;
    }
    
    // Use Electron for real page refresh
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.refreshTab(activeTab.id);
    }
  };
  
  // Data export/import functions
  const exportBrowserData = async () => {
    return await storage.exportData();
  };
  
  const importBrowserData = async (jsonData: string) => {
    await storage.importData(jsonData);
    
    // Reload data from storage
    const [newTabs, newBookmarks, newHistory, newSettings, newSearchEngine] = await Promise.all([
      storage.getTabs(),
      storage.getBookmarks(),
      storage.getHistory(),
      storage.getSettings(),
      storage.getSearchEngine()
    ]);
    
    setTabs(newTabs);
    setBookmarks(newBookmarks);
    setHistory(newHistory);
    setSettings(newSettings);
    setCurrentSearchEngineId(newSearchEngine);
  };
  
  const clearBrowserData = async () => {
    await storage.clearAllData();
    
    // Reset to defaults
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: 'New Tab',
      url: BROWSER_NEWTAB,
      favicon: '',
      isActive: true,
      isPinned: false,
    };
    
    setTabs([newTab]);
    setBookmarks([]);
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
    setCurrentSearchEngineId('1');
  };
  
  // Make sure there's always an active tab
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some(tab => tab.isActive)) {
      setTabs(tabs.map((tab, index) => ({
        ...tab,
        isActive: index === 0
      })));
    }
  }, [tabs]);
  
  return (
    <BrowserContext.Provider
      value={{
        tabs,
        activeTab,
        bookmarks,
        history,
        currentSearchEngine,
        settings,
        isLoadingTabs,
        tabsWithLoading,
        setActiveTab,
        addTab,
        closeTab,
        updateTab,
        navigateTo,
        addBookmark,
        removeBookmark,
        isBookmarked,
        setSearchEngine,
        updateSettings,
        clearHistory,
        goBack,
        goForward,
        refresh,
        exportBrowserData,
        importBrowserData,
        clearBrowserData,
        removeHistoryItem,
      }}
    >
      {children}
    </BrowserContext.Provider>
  );
}

export function useBrowser() {
  const context = useContext(BrowserContext);
  
  if (context === undefined) {
    throw new Error("useBrowser must be used within a BrowserProvider");
  }
  
  return context;
} 