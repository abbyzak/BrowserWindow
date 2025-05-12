const { app, BrowserWindow, BrowserView, ipcMain, session, shell, dialog } = require('electron');
// Import electron-serve using dynamic import
const path = require('path');
// Import electron-is-dev dynamically
// const isDev = require('electron-is-dev');
// Initialize variables
let isDev = false;
let serveURL;
let mainWindow;
let windows = {};
let store;

// Near the top, add debug logging
console.log('Starting Zen Browser...');

async function init() {
    try {
        // Import electron-is-dev dynamically
        const isDevModule = await import('electron-is-dev');
        isDev = isDevModule.default;
        console.log('Environment:', isDev ? 'Development' : 'Production');

        // Initialize store
        await initializeStore();

        // Create main window
        await createMainWindow();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Initialize store
async function initializeStore() {
    try {
        // Import electron-store dynamically
        const electronStoreModule = await import('electron-store');
        const StoreClass = electronStoreModule.default;

        console.log('StoreClass type:', typeof StoreClass);
        if (typeof StoreClass === 'function') {
            store = new StoreClass({
                name: 'zen-browser-data',
                defaults: {
                    tabs: [],
                    activeTabId: null,
                    bookmarks: [],
                    history: [],
                    settings: {
                        theme: 'system',
                        fontSize: 'medium',
                        startupPage: 'newtab',
                        showHomeButton: true,
                        cookiesPolicy: 'allow-all',
                        doNotTrack: false,
                        blockPopups: true,
                        showSearchSuggestions: true,
                        downloadLocation: app.getPath('downloads'),
                        downloadBehavior: 'auto',
                    },
                    searchEngine: '1',
                }
            });
            console.log('Store initialized successfully');
        } else {
            // Create mock implementation if Store isn't a constructor
            console.warn('StoreClass is not a constructor, falling back to mock store');
            store = createMockStore();
        }
    } catch (error) {
        console.error('Error initializing store:', error);
        // Create mock implementation
        console.warn('Falling back to mock store');
        store = createMockStore();
    }
}

function createMockStore() {
    return {
        _data: {
            tabs: [],
            activeTabId: null,
            bookmarks: [],
            history: [],
            settings: {
                theme: 'system',
                fontSize: 'medium',
                startupPage: 'newtab',
                showHomeButton: true,
                cookiesPolicy: 'allow-all',
                doNotTrack: false,
                blockPopups: true,
                showSearchSuggestions: true,
                downloadLocation: app.getPath('downloads'),
                downloadBehavior: 'auto',
            },
            searchEngine: '1',
        },
        get: function (key) {
            return key ? this._data[key] : this._data;
        },
        set: function (key, value) {
            this._data[key] = value;
            return true;
        }
    };
}

async function createMainWindow() {
    // Load electron-serve using dynamic import
    if (!isDev) {
        try {
            const electronServe = await import('electron-serve');
            serveURL = electronServe.default({ directory: path.join(__dirname, '../out') });
            console.log('Electron serve initialized for production');
        } catch (error) {
            console.error('Error loading electron-serve:', error);
        }
    }

    // Create browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
            javascript: true,
            webviewTag: false,
            sandbox: true,
            enableRemoteModule: false,
            spellcheck: true,
            plugins: true,
            nativeWindowOpen: true
        },
        show: false,
        title: 'Zen Browser',
    });

    // Remove default menu in production
    if (!isDev) {
        mainWindow.removeMenu();
    }

    // Load app
    if (isDev) {
        const loadApp = () => {
            console.log('Attempting to load Next.js app...');
            mainWindow.loadURL('http://localhost:3000')
                .catch(err => {
                    console.error('Failed to load app, retrying in 3 seconds...', err);
                    setTimeout(loadApp, 3000);
                });
        };
        loadApp();
        mainWindow.webContents.openDevTools();
    } else {
        serveURL(mainWindow);
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
        // Close all tab windows
        Object.values(windows).forEach(win => {
            if (!win.isDestroyed()) win.close();
        });
        windows = {};
    });

    // After creating the main window
    console.log('Created main window');

    return mainWindow;
}

// Create app
app.whenReady().then(init);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await createMainWindow();
    }
});

// IPC handlers

// Get data from store
ipcMain.handle('get-store-value', (event, key) => {
    return store.get(key);
});

// Set data in store
ipcMain.handle('set-store-value', (event, key, value) => {
    store.set(key, value);
    return true;
});

// Create a new browser tab window
async function createTab(tabId, url) {
    console.log(`[Main] Creating tab ${tabId} with URL: ${url}`);

    // If this tab already exists, just focus it
    if (windows[tabId]) {
        console.log(`[Main] Tab ${tabId} already exists, focusing`);
        await setActiveTabView(tabId);
        return true;
    }

    try {
        // Create a BrowserView for the tab content
        const tabView = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                partition: `persist:tab-${tabId}`,
                webSecurity: true,
                allowRunningInsecureContent: false,
                javascript: true,
                webviewTag: false,
                sandbox: true,
                enableRemoteModule: false,
                spellcheck: true,
                plugins: true,
                nativeWindowOpen: true
            }
        });

        // Add the BrowserView to the main window
        mainWindow.addBrowserView(tabView);

        // Set bounds to fill the content area
        const contentBounds = {
            x: 0,
            y: 90, // Adjust based on your navbar/tab bar height
            width: mainWindow.getBounds().width,
            height: mainWindow.getBounds().height - 90
        };

        tabView.setBounds(contentBounds);
        tabView.setAutoResize({ width: true, height: true });

        // Store view reference before loading URL so we have it even if loading fails
        windows[tabId] = tabView;

        // Add handlers for window events
        tabView.webContents.on('page-title-updated', (e, title) => {
            mainWindow.webContents.send('tab-title-updated', tabId, title);
        });

        tabView.webContents.on('page-favicon-updated', (e, favicons) => {
            if (favicons && favicons.length > 0) {
                mainWindow.webContents.send('tab-favicon-updated', tabId, favicons[0]);
            }
        });

        tabView.webContents.on('did-start-loading', () => {
            mainWindow.webContents.send('tab-loading', tabId, true);
        });

        tabView.webContents.on('did-stop-loading', () => {
            mainWindow.webContents.send('tab-loading', tabId, false);
            mainWindow.webContents.send('tab-url-updated', tabId, tabView.webContents.getURL());
        });

        // Handle navigation within the tab
        tabView.webContents.on('will-navigate', (e, url) => {
            mainWindow.webContents.send('tab-will-navigate', tabId, url);
        });

        // Handle new windows
        tabView.webContents.setWindowOpenHandler(({ url }) => {
            mainWindow.webContents.send('new-tab-requested', url);
            return { action: 'deny' };
        });

        // Handle navigation errors
        tabView.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error(`[Main] Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
            mainWindow.webContents.send('tab-loading', tabId, false);
        });

        // Add proper error handling for navigation
        tabView.webContents.on('did-fail-provisional-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error(`[Main] Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
            mainWindow.webContents.send('tab-loading', tabId, false);
        });

        // Handle navigation state changes
        tabView.webContents.on('did-start-navigation', (event, url, isInPlace, isMainFrame) => {
            if (isMainFrame) {
                mainWindow.webContents.send('tab-loading', tabId, true);
            }
        });

        tabView.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('tab-loading', tabId, false);
            mainWindow.webContents.send('tab-url-updated', tabId, tabView.webContents.getURL());
        });

        // Hide this view if it's not the active tab
        const activeTabId = store.get('activeTabId');
        if (activeTabId !== tabId) {
            mainWindow.removeBrowserView(tabView);
        }

        // Try to load the URL, but don't fail tab creation if URL load fails
        if (url) {
            try {
                console.log(`[Main] Loading URL in tab: ${url}`);
                await tabView.webContents.loadURL(url, {
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    extraHeaders: 'pragma: no-cache\n'
                });
            } catch (loadError) {
                console.error('[Main] Error loading URL:', loadError);
                // Load a blank page with error message if URL loading fails
                const errorHtml = `
                <html>
                <head>
                    <title>Error loading page</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; text-align: center; }
                        .error-code { color: #888; font-size: 0.9rem; margin-top: 1rem; }
                        h1 { color: #555; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Error loading page</h1>
                        <p>The page could not be loaded. This might be due to network issues or content filtering.</p>
                        <p class="error-code">Error: ${loadError.code || 'Unknown error'}</p>
                    </div>
                </body>
                </html>`;

                await tabView.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
                mainWindow.webContents.send('tab-title-updated', tabId, 'Error loading page');
            }
        }

        return true;
    } catch (error) {
        console.error('[Main] Error creating tab:', error);
        return false;
    }
}

// Create a new browser tab window IPC handler
ipcMain.handle('create-tab', async (event, tabId, url) => {
    return await createTab(tabId, url);
});

// Helper function to set the active tab view
const setActiveTabView = async (tabId) => {
    try {
        // Remove all browser views first
        const allViews = mainWindow.getBrowserViews();
        allViews.forEach(view => {
            mainWindow.removeBrowserView(view);
        });

        // Add only the active tab's view
        const activeView = windows[tabId];
        if (activeView) {
            mainWindow.addBrowserView(activeView);

            // Make sure the view fills the content area
            const bounds = mainWindow.getBounds();
            activeView.setBounds({
                x: 0,
                y: 90, // Adjust based on your navbar/tab bar height
                width: bounds.width,
                height: bounds.height - 90
            });

            // Save the active tab ID
            store.set('activeTabId', tabId);

            return true;
        } else {
            console.warn(`[Main] No view found for tab ${tabId}`);
            return false;
        }
    } catch (error) {
        console.error('[Main] Error setting active tab:', error);
        return false;
    }
};

// Set active tab IPC handler
ipcMain.handle('set-active-tab', async (event, tabId) => {
    console.log(`[Main] Setting active tab to ${tabId}`);

    // If the tab doesn't exist yet, we may need to create it
    if (!windows[tabId]) {
        console.warn(`[Main] Tab ${tabId} doesn't exist yet, cannot set active`);
        return false;
    }

    return await setActiveTabView(tabId);
});

// Navigate a tab to a URL
ipcMain.handle('navigate-tab', async (event, tabId, url) => {
    console.log(`[Main] Navigating tab ${tabId} to URL: ${url}`);
    const tabView = windows[tabId];

    if (!tabView) {
        console.log(`[Main] Tab ${tabId} doesn't exist, creating new one`);
        // Create a new tab with this URL
        return await createTab(tabId, url);
    } else {
        try {
            console.log(`[Main] Loading URL in existing tab: ${url}`);
            await tabView.webContents.loadURL(url, {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                extraHeaders: 'pragma: no-cache\n'
            });
            return tabView.webContents.getURL();
        } catch (error) {
            console.error('[Main] Error navigating tab:', error);
            return null;
        }
    }
});

// Close a tab
ipcMain.handle('close-tab', (event, tabId) => {
    const tabView = windows[tabId];
    if (tabView) {
        // Remove from main window if it's currently displayed
        mainWindow.removeBrowserView(tabView);

        // Destroy the BrowserView
        tabView.webContents.destroy();

        // Remove from our tracking object
        delete windows[tabId];

        return true;
    }
    return false;
});

// Go back in tab history
ipcMain.handle('go-back', (event, tabId) => {
    const tabView = windows[tabId];
    if (tabView && tabView.webContents && tabView.webContents.canGoBack()) {
        tabView.webContents.goBack();
        return true;
    }
    return false;
});

// Go forward in tab history
ipcMain.handle('go-forward', (event, tabId) => {
    const tabView = windows[tabId];
    if (tabView && tabView.webContents && tabView.webContents.canGoForward()) {
        tabView.webContents.goForward();
        return true;
    }
    return false;
});

// Refresh tab
ipcMain.handle('refresh-tab', (event, tabId) => {
    const tabView = windows[tabId];
    if (tabView && tabView.webContents) {
        tabView.webContents.reload();
        return true;
    }
    return false;
});

// Get tab info
ipcMain.handle('get-tab-info', (event, tabId) => {
    const tabView = windows[tabId];
    if (tabView && tabView.webContents) {
        return {
            url: tabView.webContents.getURL(),
            title: tabView.webContents.getTitle(),
            canGoBack: tabView.webContents.canGoBack(),
            canGoForward: tabView.webContents.canGoForward(),
            isLoading: tabView.webContents.isLoading(),
        };
    }
    return null;
});

// Clear browsing data
ipcMain.handle('clear-browsing-data', async (event, options) => {
    // Clear session data for all tab partitions
    try {
        const promises = Object.keys(windows).map(tabId => {
            const win = windows[tabId];
            if (win && !win.isDestroyed()) {
                const sess = win.webContents.session;

                const clearPromises = [];

                if (options.history) {
                    clearPromises.push(sess.clearHistory());
                }

                if (options.cookies) {
                    clearPromises.push(sess.clearStorageData({ storages: ['cookies'] }));
                }

                if (options.cache) {
                    clearPromises.push(sess.clearCache());
                }

                if (options.localStorage) {
                    clearPromises.push(sess.clearStorageData({ storages: ['localstorage'] }));
                }

                return Promise.all(clearPromises);
            }
        });

        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('Error clearing browsing data:', error);
        return false;
    }
});

// Open external URL in default browser
ipcMain.handle('open-external', async (event, url) => {
    try {
        await shell.openExternal(url);
        return true;
    } catch (error) {
        console.error('Error opening external URL:', error);
        return false;
    }
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 