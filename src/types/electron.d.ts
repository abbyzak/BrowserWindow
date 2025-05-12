interface ElectronAPI {
    // Data Storage
    getStoreValue: (key: string) => Promise<any>;
    setStoreValue: (key: string, value: any) => Promise<boolean>;

    // Tab Management
    createTab: (tabId: string, url?: string) => Promise<void>;
    navigateTab: (tabId: string, url: string) => Promise<string | null>;
    closeTab: (tabId: string) => Promise<void>;
    getTabInfo: (tabId: string) => Promise<{
        url: string;
        title: string;
        canGoBack: boolean;
        canGoForward: boolean;
        isLoading: boolean;
    } | null>;

    // Navigation Controls
    goBack: (tabId: string) => Promise<boolean>;
    goForward: (tabId: string) => Promise<boolean>;
    refreshTab: (tabId: string) => Promise<boolean>;

    // Browsing Data
    clearBrowsingData: (options: {
        history?: boolean;
        cookies?: boolean;
        cache?: boolean;
        localStorage?: boolean;
    }) => Promise<boolean>;

    // External Links
    openExternal: (url: string) => Promise<boolean>;

    // Event Listeners
    onTabTitleUpdated: (callback: (tabId: string, title: string) => void) => void;
    onTabFaviconUpdated: (callback: (tabId: string, favicon: string) => void) => void;
    onTabLoading: (callback: (tabId: string, isLoading: boolean) => void) => void;
    onTabUrlUpdated: (callback: (tabId: string, url: string) => void) => void;
    onTabWillNavigate: (callback: (tabId: string, url: string) => void) => void;
    onNewTabRequested: (callback: (url: string) => void) => void;
    onDownloadStarted: (callback: (data: {
        url: string;
        filename: string;
        state: string;
    }) => void) => void;
    onDownloadUpdated: (callback: (data: {
        url: string;
        filename: string;
        state: string;
        progress: number;
        receivedBytes: number;
        totalBytes: number;
    }) => void) => void;
    onDownloadDone: (callback: (data: {
        url: string;
        filename: string;
        state: string;
    }) => void) => void;

    // Cleanup
    removeAllListeners: () => void;
}

interface Window {
    electron: ElectronAPI;
} 