import { Tab, Bookmark, HistoryItem } from "@/lib/mock-data";

// Storage keys
const STORAGE_KEYS = {
    TABS: 'tabs',
    BOOKMARKS: 'bookmarks',
    HISTORY: 'history',
    SETTINGS: 'settings',
    ACTIVE_TAB_ID: 'activeTabId',
    SEARCH_ENGINE: 'searchEngine',
};

// Settings interface
export interface BrowserSettings {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    startupPage: 'newtab' | 'continue' | 'specific';
    showHomeButton: boolean;
    cookiesPolicy: 'allow-all' | 'block-third-party' | 'block-all';
    doNotTrack: boolean;
    blockPopups: boolean;
    showSearchSuggestions: boolean;
    downloadLocation: string;
    downloadBehavior: 'ask' | 'auto';
}

// Default settings
export const DEFAULT_SETTINGS: BrowserSettings = {
    theme: 'system',
    fontSize: 'medium',
    startupPage: 'newtab',
    showHomeButton: true,
    cookiesPolicy: 'allow-all',
    doNotTrack: false,
    blockPopups: true,
    showSearchSuggestions: true,
    downloadLocation: '/Users/username/Downloads',
    downloadBehavior: 'auto',
};

// Check if we're in an Electron environment
const isElectron = () => {
    return typeof window !== 'undefined' && window.electron !== undefined;
};

// Get data from store
export const getData = async <T>(key: string, defaultValue: T): Promise<T> => {
    if (isElectron()) {
        // Use Electron store
        try {
            const data = await window.electron.getStoreValue(key);
            return data !== undefined ? data : defaultValue;
        } catch (error) {
            console.error(`Error retrieving ${key} from Electron store:`, error);
            return defaultValue;
        }
    } else {
        // Fallback to localStorage for development without Electron
        if (typeof window === 'undefined') return defaultValue;

        try {
            const item = localStorage.getItem(`zen-browser-${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error retrieving ${key} from localStorage:`, error);
            return defaultValue;
        }
    }
};

// Save data to store
export const saveData = async <T>(key: string, value: T): Promise<void> => {
    if (isElectron()) {
        // Use Electron store
        try {
            await window.electron.setStoreValue(key, value);
        } catch (error) {
            console.error(`Error saving ${key} to Electron store:`, error);
        }
    } else {
        // Fallback to localStorage for development without Electron
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(`zen-browser-${key}`, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }
};

// Storage service
export const storage = {
    // Tabs
    getTabs: async (): Promise<Tab[]> => getData(STORAGE_KEYS.TABS, []),
    saveTabs: async (tabs: Tab[]): Promise<void> => saveData(STORAGE_KEYS.TABS, tabs),

    // Active tab
    getActiveTabId: async (): Promise<string | null> => getData(STORAGE_KEYS.ACTIVE_TAB_ID, null),
    saveActiveTabId: async (tabId: string | null): Promise<void> => saveData(STORAGE_KEYS.ACTIVE_TAB_ID, tabId),

    // Bookmarks
    getBookmarks: async (): Promise<Bookmark[]> => getData(STORAGE_KEYS.BOOKMARKS, []),
    saveBookmarks: async (bookmarks: Bookmark[]): Promise<void> => saveData(STORAGE_KEYS.BOOKMARKS, bookmarks),

    // History
    getHistory: async (): Promise<HistoryItem[]> => getData(STORAGE_KEYS.HISTORY, []),
    saveHistory: async (history: HistoryItem[]): Promise<void> => saveData(STORAGE_KEYS.HISTORY, history),

    // Settings
    getSettings: async (): Promise<BrowserSettings> => getData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    saveSettings: async (settings: BrowserSettings): Promise<void> => saveData(STORAGE_KEYS.SETTINGS, settings),

    // Search Engine
    getSearchEngine: async (): Promise<string> => getData(STORAGE_KEYS.SEARCH_ENGINE, '1'), // Default to Google (id: 1)
    saveSearchEngine: async (engineId: string): Promise<void> => saveData(STORAGE_KEYS.SEARCH_ENGINE, engineId),

    // Export all data as JSON
    exportData: async (): Promise<string> => {
        const [tabs, activeTabId, bookmarks, history, settings, searchEngine] = await Promise.all([
            getData(STORAGE_KEYS.TABS, []),
            getData(STORAGE_KEYS.ACTIVE_TAB_ID, null),
            getData(STORAGE_KEYS.BOOKMARKS, []),
            getData(STORAGE_KEYS.HISTORY, []),
            getData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
            getData(STORAGE_KEYS.SEARCH_ENGINE, '1')
        ]);

        const data = {
            tabs,
            activeTabId,
            bookmarks,
            history,
            settings,
            searchEngine,
        };

        return JSON.stringify(data, null, 2);
    },

    // Import data from JSON
    importData: async (jsonData: string): Promise<void> => {
        try {
            const data = JSON.parse(jsonData);

            const promises = [];
            if (data.tabs) promises.push(saveData(STORAGE_KEYS.TABS, data.tabs));
            if (data.activeTabId !== undefined) promises.push(saveData(STORAGE_KEYS.ACTIVE_TAB_ID, data.activeTabId));
            if (data.bookmarks) promises.push(saveData(STORAGE_KEYS.BOOKMARKS, data.bookmarks));
            if (data.history) promises.push(saveData(STORAGE_KEYS.HISTORY, data.history));
            if (data.settings) promises.push(saveData(STORAGE_KEYS.SETTINGS, data.settings));
            if (data.searchEngine) promises.push(saveData(STORAGE_KEYS.SEARCH_ENGINE, data.searchEngine));

            await Promise.all(promises);
        } catch (error) {
            console.error('Error importing data:', error);
        }
    },

    // Clear all browser data
    clearAllData: async (): Promise<void> => {
        const promises = Object.values(STORAGE_KEYS).map(key => saveData(key, null));
        await Promise.all(promises);

        // Also clear actual browsing data if in Electron
        if (isElectron()) {
            await window.electron.clearBrowsingData({
                history: true,
                cookies: true,
                cache: true,
                localStorage: true
            });
        }
    },

    // Clear specific browser data
    clearHistory: async (): Promise<void> => {
        await saveData(STORAGE_KEYS.HISTORY, []);
        if (isElectron()) {
            await window.electron.clearBrowsingData({ history: true });
        }
    },

    clearCookies: async (): Promise<void> => {
        if (isElectron()) {
            await window.electron.clearBrowsingData({ cookies: true });
        }
    },

    clearCache: async (): Promise<void> => {
        if (isElectron()) {
            await window.electron.clearBrowsingData({ cache: true });
        }
    },
}; 