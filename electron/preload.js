const { contextBridge, ipcRenderer } = require('electron');

// Log that preload script is running
console.log('Preload script is running');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    // Data Storage
    getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
    setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),

    // Tab Management
    createTab: (tabId, url) => ipcRenderer.invoke('create-tab', tabId, url),
    navigateTab: (tabId, url) => ipcRenderer.invoke('navigate-tab', tabId, url),
    closeTab: (tabId) => ipcRenderer.invoke('close-tab', tabId),
    getTabInfo: (tabId) => ipcRenderer.invoke('get-tab-info', tabId),
    setActiveTab: (tabId) => ipcRenderer.invoke('set-active-tab', tabId),

    // Navigation Controls
    goBack: (tabId) => ipcRenderer.invoke('go-back', tabId),
    goForward: (tabId) => ipcRenderer.invoke('go-forward', tabId),
    refreshTab: (tabId) => ipcRenderer.invoke('refresh-tab', tabId),

    // Browsing Data
    clearBrowsingData: (options) => ipcRenderer.invoke('clear-browsing-data', options),

    // External Links
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // Event Listeners
    onTabTitleUpdated: (callback) => ipcRenderer.on('tab-title-updated', (_, tabId, title) => callback(tabId, title)),
    onTabFaviconUpdated: (callback) => ipcRenderer.on('tab-favicon-updated', (_, tabId, favicon) => callback(tabId, favicon)),
    onTabLoading: (callback) => ipcRenderer.on('tab-loading', (_, tabId, isLoading) => callback(tabId, isLoading)),
    onTabUrlUpdated: (callback) => ipcRenderer.on('tab-url-updated', (_, tabId, url) => callback(tabId, url)),
    onTabWillNavigate: (callback) => ipcRenderer.on('tab-will-navigate', (_, tabId, url) => callback(tabId, url)),
    onNewTabRequested: (callback) => ipcRenderer.on('new-tab-requested', (_, url) => callback(url)),
    onDownloadStarted: (callback) => ipcRenderer.on('download-started', (_, data) => callback(data)),
    onDownloadUpdated: (callback) => ipcRenderer.on('download-updated', (_, data) => callback(data)),
    onDownloadDone: (callback) => ipcRenderer.on('download-done', (_, data) => callback(data)),

    // Cleanup
    removeAllListeners: () => {
        ipcRenderer.removeAllListeners('tab-title-updated');
        ipcRenderer.removeAllListeners('tab-favicon-updated');
        ipcRenderer.removeAllListeners('tab-loading');
        ipcRenderer.removeAllListeners('tab-url-updated');
        ipcRenderer.removeAllListeners('tab-will-navigate');
        ipcRenderer.removeAllListeners('new-tab-requested');
        ipcRenderer.removeAllListeners('download-started');
        ipcRenderer.removeAllListeners('download-updated');
        ipcRenderer.removeAllListeners('download-done');
    }
}); 