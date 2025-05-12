interface ElectronAPI {
    // Data Storage
    getStoreValue: (key: string) => Promise<any>;
    setStoreValue: (key: string, value: any) => Promise<boolean>;

    // Tab Management
    createTab: (tabId: string, url: string) => Promise<boolean>;
    navigateTab: (tabId: string, url: string) => Promise<string | null>;
    closeTab: (tabId: string) => Promise<boolean>;
    getTabInfo: (tabId: string) => Promise<TabInfo | null>;
    setActiveTab: (tabId: string) => Promise<boolean>;

    // Navigation Controls
    goBack: (tabId: string) => Promise<boolean>;
    goForward: (tabId: string) => Promise<boolean>;
    refreshTab: (tabId: string) => Promise<boolean>;

    // Browsing Data
    clearBrowsingData: (options: ClearBrowsingDataOptions) => Promise<boolean>;

    // External Links
    openExternal: (url: string) => Promise<boolean>;

    // Event Listeners
    onTabTitleUpdated: (callback: (tabId: string, title: string) => void) => void;
    onTabFaviconUpdated: (callback: (tabId: string, favicon: string) => void) => void;
    onTabLoading: (callback: (tabId: string, isLoading: boolean) => void) => void;
    onTabUrlUpdated: (callback: (tabId: string, url: string) => void) => void;
    onTabWillNavigate: (callback: (tabId: string, url: string) => void) => void;
    onNewTabRequested: (callback: (url: string) => void) => void;
    onDownloadStarted: (callback: (data: DownloadData) => void) => void;
    onDownloadUpdated: (callback: (data: DownloadData) => void) => void;
    onDownloadDone: (callback: (data: DownloadData) => void) => void;

    // Cleanup
    removeAllListeners: () => void;
}

interface Window {
    electron: ElectronAPI;
}

interface TabInfo {
    url: string;
    title: string;
    canGoBack: boolean;
    canGoForward: boolean;
    isLoading: boolean;
}

interface ClearBrowsingDataOptions {
    history?: boolean;
    cookies?: boolean;
    cache?: boolean;
    localStorage?: boolean;
}

interface DownloadData {
    url: string;
    filename: string;
    state: string;
    progress?: number;
    receivedBytes?: number;
    totalBytes?: number;
} 