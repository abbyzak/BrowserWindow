"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { useBrowser } from "@/contexts/BrowserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Home,
  Plus,
  X,
  Star,
  MoreVertical,
  Settings,
  History,
  Bookmark,
  Download,
  ShieldAlert,
  Globe,
  Lock,
  Loader2
} from "lucide-react";
import { BROWSER_HOMEPAGE, BROWSER_BOOKMARKS, BROWSER_HISTORY, BROWSER_SETTINGS, SPECIAL_PAGES } from "@/lib/constants";
import { getFavicon, isValidUrl } from "@/lib/utils";

export default function Navbar() {
  const {
    tabs,
    activeTab,
    goBack,
    goForward,
    refresh,
    navigateTo,
    addTab,
    addBookmark,
    removeBookmark,
    isBookmarked,
    bookmarks,
    settings,
    tabsWithLoading
  } = useBrowser();
  
  const [urlInput, setUrlInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update URL input when active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
      
      // Check if we can go back/forward using Electron
      if (typeof window !== 'undefined' && window.electron && !SPECIAL_PAGES.includes(activeTab.url)) {
        window.electron.getTabInfo(activeTab.id).then(info => {
          if (info) {
            setCanGoBack(info.canGoBack);
            setCanGoForward(info.canGoForward);
          }
        }).catch(err => {
          console.error("Error getting tab info:", err);
        });
      } else {
        // For special pages, always disable navigation
        setCanGoBack(false);
        setCanGoForward(false);
      }
    }
  }, [activeTab]);
  
  // Handle URL input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };
  
  // Handle URL input submission
  const handleInputSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && urlInput.trim()) {
      console.log("Submitting URL/search:", urlInput.trim());
      
      // If already loading, don't navigate again
      if (activeTab && tabsWithLoading[activeTab.id]) {
        console.log("Already loading, ignoring new navigation");
        return;
      }
      
      // Navigate to the URL
      navigateTo(urlInput.trim());
      
      // Blur input to remove focus
      inputRef.current?.blur();
    }
  };
  
  // Handle bookmark toggle
  const handleBookmarkToggle = () => {
    if (!activeTab) return;
    
    const isCurrentBookmarked = isBookmarked(activeTab.url);
    
    if (isCurrentBookmarked) {
      // Find bookmark ID to remove
      const bookmarkToRemove = bookmarks.find(bookmark => bookmark.url === activeTab.url);
      if (bookmarkToRemove) {
        removeBookmark(bookmarkToRemove.id);
      }
    } else {
      addBookmark({
        title: activeTab.title,
        url: activeTab.url,
        favicon: activeTab.favicon || getFavicon(activeTab.url),
      });
    }
  };
  
  // Focus handling
  const handleInputFocus = () => {
    setIsEditing(true);
    inputRef.current?.select();
  };
  
  const handleInputBlur = () => {
    setIsEditing(false);
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  };
  
  // Get security status
  const getSecurityIcon = () => {
    if (!activeTab) return <Globe className="h-4 w-4 text-muted-foreground" />;
    
    // Show loading indicator if tab is loading
    if (tabsWithLoading[activeTab.id]) {
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    }
    
    if (SPECIAL_PAGES.includes(activeTab.url)) {
      if (activeTab.url === BROWSER_BOOKMARKS) {
        return <Bookmark className="h-4 w-4 text-primary" />;
      } else if (activeTab.url === BROWSER_HISTORY) {
        return <History className="h-4 w-4 text-primary" />;
      } else if (activeTab.url === BROWSER_SETTINGS) {
        return <Settings className="h-4 w-4 text-primary" />;
      } else {
        return <Home className="h-4 w-4 text-primary" />;
      }
    }
    
    if (!isValidUrl(activeTab.url)) {
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    }
    
    try {
      const url = new URL(activeTab.url);
      if (url.protocol === 'https:') {
        return <Lock className="h-4 w-4 text-green-500" />;
      } else {
        return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      }
    } catch (error) {
      return <Globe className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Determine if special page
  const isSpecialPage = activeTab ? SPECIAL_PAGES.includes(activeTab.url) : false;
  
  // Is bookmarked
  const bookmarked = activeTab ? isBookmarked(activeTab.url) : false;
  
  // Is loading
  const isLoading = activeTab ? tabsWithLoading[activeTab.id] : false;
  
  return (
    <div className="flex items-center px-2 py-1 gap-2 w-full bg-white border-b border-gray-200">
      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              disabled={!canGoBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={goForward}
              className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              disabled={!canGoForward}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={refresh}
              className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              disabled={isSpecialPage || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reload</TooltipContent>
        </Tooltip>
        
        {settings.showHomeButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo(BROWSER_HOMEPAGE)}
                className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Home</TooltipContent>
          </Tooltip>
        )}
      </div>
      
      {/* URL input */}
      <div className="flex-1 mx-2 flex items-center relative rounded-md overflow-hidden bg-white border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-150">
        <div className="flex items-center justify-center h-full pl-2 pr-1">
          {getSecurityIcon()}
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search or enter website name"
          value={urlInput}
          onChange={handleInputChange}
          onKeyDown={handleInputSubmit}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="flex-1 h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 text-gray-900"
        />
        
        {isLoading && (
          <div className="flex items-center justify-center h-full pr-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          </div>
        )}
      </div>
      
      {/* Right buttons */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={bookmarked ? "secondary" : "ghost"}
              size="icon"
              onClick={handleBookmarkToggle}
              className={`h-8 w-8 ${bookmarked ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <Star className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{bookmarked ? "Remove bookmark" : "Add bookmark"}</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => addTab()}
              className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New tab</TooltipContent>
        </Tooltip>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigateTo(BROWSER_SETTINGS)}>
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigateTo(BROWSER_BOOKMARKS)}>
              <Bookmark className="h-4 w-4 mr-2" />
              <span>Bookmarks</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigateTo(BROWSER_HISTORY)}>
              <History className="h-4 w-4 mr-2" />
              <span>History</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              <span>Downloads</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 