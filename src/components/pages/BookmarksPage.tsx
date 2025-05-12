"use client";

import { useState } from "react";
import { useBrowser } from "@/contexts/BrowserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bookmark, 
  ChevronRight, 
  FolderOpen, 
  Search, 
  Star, 
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BookmarksPage() {
  const { bookmarks, navigateTo, removeBookmark } = useBrowser();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get unique folders
  const folders = Array.from(
    new Set(bookmarks.map((bookmark) => bookmark.folder).filter(Boolean))
  ) as string[];
  
  // Filter bookmarks by search query
  const filteredBookmarks = searchQuery
    ? bookmarks.filter(
        (bookmark) =>
          bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : bookmarks;
  
  // Group bookmarks by folder
  const bookmarksByFolder: Record<string, typeof bookmarks> = {
    "": [], // For bookmarks without folder
  };
  
  folders.forEach((folder) => {
    bookmarksByFolder[folder] = [];
  });
  
  filteredBookmarks.forEach((bookmark) => {
    const folder = bookmark.folder || "";
    if (!bookmarksByFolder[folder]) {
      bookmarksByFolder[folder] = [];
    }
    bookmarksByFolder[folder].push(bookmark);
  });
  
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 bg-muted/20 h-full">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <Bookmark className="mr-2 h-5 w-5" />
          Bookmarks
        </h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search bookmarks"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <nav className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setSearchQuery("")}
          >
            <Star className="mr-2 h-4 w-4" />
            All Bookmarks
          </Button>
          
          {folders.map((folder) => (
            <Button
              key={folder}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setSearchQuery(`folder:${folder}`)}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              {folder}
            </Button>
          ))}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <h2 className="text-xl font-bold mb-4">
          {searchQuery ? `Search Results: ${searchQuery}` : "All Bookmarks"}
        </h2>
        
        {Object.entries(bookmarksByFolder).map(([folder, folderBookmarks]) => {
          if (folderBookmarks.length === 0) return null;
          
          return (
            <div key={folder || "no-folder"} className="mb-6">
              {folder && (
                <>
                  <h3 className="text-lg font-medium flex items-center mb-2">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {folder}
                  </h3>
                  <Separator className="mb-2" />
                </>
              )}
              
              <div className="space-y-2">
                {folderBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
                  >
                    <div 
                      className="flex items-center flex-1 cursor-pointer"
                      onClick={() => navigateTo(bookmark.url)}
                    >
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center mr-3">
                        {bookmark.favicon ? (
                          <img 
                            src={bookmark.favicon} 
                            alt="" 
                            className="h-4 w-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Star className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-medium truncate">{bookmark.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {bookmark.url}
                        </p>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigateTo(bookmark.url)}>
                            <ChevronRight className="h-4 w-4 mr-2" />
                            <span>Open</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => removeBookmark(bookmark.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {filteredBookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No bookmarks found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try a different search term"
                : "Add some bookmarks to see them here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 