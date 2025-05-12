/**
 * Electron IPC Bridge
 * A utility service that provides a cleaner API for interacting with Electron's IPC system
 */

// Check if we're in an Electron environment
export const isElectron = (): boolean => {
    return typeof window !== 'undefined' && window.electron !== undefined;
};

// Tab Management
export const electronTabs = {
    create: async (tabId: string, url?: string): Promise<void> => {
        if (!isElectron()) return;
        return await window.electron.createTab(tabId, url);
    },

    navigate: async (tabId: string, url: string): Promise<string | null> => {
        if (!isElectron()) return null;
        return await window.electron.navigateTab(tabId, url);
    },

    close: async (tabId: string): Promise<void> => {
        if (!isElectron()) return;
        return await window.electron.closeTab(tabId);
    },

    getInfo: async (tabId: string): Promise<any> => {
        if (!isElectron()) return null;
        return await window.electron.getTabInfo(tabId);
    }
};

// Navigation Controls
export const electronNavigation = {
    goBack: async (tabId: string): Promise<boolean> => {
        if (!isElectron()) return false;
        return await window.electron.goBack(tabId);
    },

    goForward: async (tabId: string): Promise<boolean> => {
        if (!isElectron()) return false;
        return await window.electron.goForward(tabId);
    },

    refresh: async (tabId: string): Promise<boolean> => {
        if (!isElectron()) return false;
        return await window.electron.refreshTab(tabId);
    }
};

// Browsing Data
export const electronData = {
    clearBrowsingData: async (options: {
        history?: boolean;
        cookies?: boolean;
        cache?: boolean;
        localStorage?: boolean;
    }): Promise<boolean> => {
        if (!isElectron()) return false;
        return await window.electron.clearBrowsingData(options);
    }
};

// Event Listeners
export const electronEvents = {
    onTabTitleUpdated: (callback: (tabId: string, title: string) => void): void => {
        if (!isElectron()) return;
        window.electron.onTabTitleUpdated(callback);
    },

    onTabFaviconUpdated: (callback: (tabId: string, favicon: string) => void): void => {
        if (!isElectron()) return;
        window.electron.onTabFaviconUpdated(callback);
    },

    onTabLoading: (callback: (tabId: string, isLoading: boolean) => void): void => {
        if (!isElectron()) return;
        window.electron.onTabLoading(callback);
    },

    onTabUrlUpdated: (callback: (tabId: string, url: string) => void): void => {
        if (!isElectron()) return;
        window.electron.onTabUrlUpdated(callback);
    },

    onNewTabRequested: (callback: (url: string) => void): void => {
        if (!isElectron()) return;
        window.electron.onNewTabRequested(callback);
    },

    removeAllListeners: (): void => {
        if (!isElectron()) return;
        window.electron.removeAllListeners();
    }
};

// Downloads
export const electronDownloads = {
    onDownloadStarted: (callback: (data: any) => void): void => {
        if (!isElectron()) return;
        window.electron.onDownloadStarted(callback);
    },

    onDownloadUpdated: (callback: (data: any) => void): void => {
        if (!isElectron()) return;
        window.electron.onDownloadUpdated(callback);
    },

    onDownloadDone: (callback: (data: any) => void): void => {
        if (!isElectron()) return;
        window.electron.onDownloadDone(callback);
    }
};

// External Links
export const electronSystem = {
    openExternal: async (url: string): Promise<boolean> => {
        if (!isElectron()) return false;
        return await window.electron.openExternal(url);
    }
};

// Store data
export const electronStore = {
    get: async (key: string): Promise<any> => {
        if (!isElectron()) return null;
        return await window.electron.getStoreValue(key);
    },

    set: async (key: string, value: any): Promise<boolean> => {
        if (!isElectron()) return false;
        return await window.electron.setStoreValue(key, value);
    }
}; 