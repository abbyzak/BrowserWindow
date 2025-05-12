export type Bookmark = {
    id: string;
    title: string;
    url: string;
    favicon: string;
    folder?: string;
    createdAt: string;
};

export type HistoryItem = {
    id: string;
    title: string;
    url: string;
    favicon: string;
    visitedAt: string;
};

export type Tab = {
    id: string;
    title: string;
    url: string;
    favicon: string;
    isActive: boolean;
    isPinned: boolean;
};

export const bookmarks: Bookmark[] = [
    {
        id: '1',
        title: 'GitHub',
        url: 'https://github.com',
        favicon: 'https://github.com/favicon.ico',
        folder: 'Development',
        createdAt: '2023-01-10T10:30:00Z',
    },
    {
        id: '2',
        title: 'Stack Overflow',
        url: 'https://stackoverflow.com',
        favicon: 'https://stackoverflow.com/favicon.ico',
        folder: 'Development',
        createdAt: '2023-01-15T14:20:00Z',
    },
    {
        id: '3',
        title: 'YouTube',
        url: 'https://youtube.com',
        favicon: 'https://youtube.com/favicon.ico',
        folder: 'Entertainment',
        createdAt: '2023-02-05T19:45:00Z',
    },
    {
        id: '4',
        title: 'Netflix',
        url: 'https://netflix.com',
        favicon: 'https://netflix.com/favicon.ico',
        folder: 'Entertainment',
        createdAt: '2023-02-10T20:15:00Z',
    },
    {
        id: '5',
        title: 'Gmail',
        url: 'https://mail.google.com',
        favicon: 'https://mail.google.com/favicon.ico',
        folder: 'Productivity',
        createdAt: '2023-01-05T08:10:00Z',
    },
];

export const history: HistoryItem[] = [
    {
        id: '1',
        title: 'GitHub - Home',
        url: 'https://github.com',
        favicon: 'https://github.com/favicon.ico',
        visitedAt: '2023-05-01T10:30:00Z',
    },
    {
        id: '2',
        title: 'Stack Overflow - Where Developers Learn, Share, & Build Careers',
        url: 'https://stackoverflow.com',
        favicon: 'https://stackoverflow.com/favicon.ico',
        visitedAt: '2023-05-01T11:45:00Z',
    },
    {
        id: '3',
        title: 'YouTube',
        url: 'https://youtube.com',
        favicon: 'https://youtube.com/favicon.ico',
        visitedAt: '2023-05-01T14:20:00Z',
    },
    {
        id: '4',
        title: 'Netflix - Watch TV Shows Online, Watch Movies Online',
        url: 'https://netflix.com',
        favicon: 'https://netflix.com/favicon.ico',
        visitedAt: '2023-05-01T20:15:00Z',
    },
    {
        id: '5',
        title: 'Gmail',
        url: 'https://mail.google.com',
        favicon: 'https://mail.google.com/favicon.ico',
        visitedAt: '2023-05-02T08:10:00Z',
    },
    {
        id: '6',
        title: 'React – A JavaScript library for building user interfaces',
        url: 'https://reactjs.org',
        favicon: 'https://reactjs.org/favicon.ico',
        visitedAt: '2023-05-02T09:30:00Z',
    },
    {
        id: '7',
        title: 'Next.js by Vercel - The React Framework',
        url: 'https://nextjs.org',
        favicon: 'https://nextjs.org/favicon.ico',
        visitedAt: '2023-05-02T10:45:00Z',
    },
];

export const tabs: Tab[] = [
    {
        id: '1',
        title: 'GitHub - Home',
        url: 'https://github.com',
        favicon: 'https://github.com/favicon.ico',
        isActive: false,
        isPinned: true,
    },
    {
        id: '2',
        title: 'Stack Overflow - Where Developers Learn, Share, & Build Careers',
        url: 'https://stackoverflow.com',
        favicon: 'https://stackoverflow.com/favicon.ico',
        isActive: false,
        isPinned: false,
    },
    {
        id: '3',
        title: 'YouTube',
        url: 'https://youtube.com',
        favicon: 'https://youtube.com/favicon.ico',
        isActive: true,
        isPinned: false,
    },
    {
        id: '4',
        title: 'Netflix - Watch TV Shows Online, Watch Movies Online',
        url: 'https://netflix.com',
        favicon: 'https://netflix.com/favicon.ico',
        isActive: false,
        isPinned: false,
    },
];

// Mock search engines
export const searchEngines = [
    { id: '1', name: 'Google', url: 'https://www.google.com/search?q=' },
    { id: '2', name: 'Bing', url: 'https://www.bing.com/search?q=' },
    { id: '3', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
];

// Default search engine
export const defaultSearchEngine = searchEngines[0]; 