"use client";

import { useState, useMemo } from "react";
import { useBrowser } from "@/contexts/BrowserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Search, 
  ChevronRight, 
  Trash2, 
  History as HistoryIcon,
  AlertCircle
} from "lucide-react";
import { HistoryItem } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type GroupedHistory = {
  [date: string]: HistoryItem[];
};

export default function HistoryPage() {
  const { history, navigateTo, clearHistory, removeHistoryItem } = useBrowser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  
  // Filter history by search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;
    
    return history.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);
  
  // Group history by date
  const groupedHistory = useMemo(() => {
    const grouped: GroupedHistory = {};
    
    filteredHistory.forEach((item) => {
      const date = new Date(item.visitedAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    
    return grouped;
  }, [filteredHistory]);
  
  // Get dates in descending order
  const dates = useMemo(() => {
    return Object.keys(groupedHistory).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedHistory]);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };
  
  // Add this function to handle history item removal
  const handleRemoveHistoryItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeHistoryItem(itemId);
  };
  
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 bg-muted/20 h-full">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <HistoryIcon className="mr-2 h-5 w-5" />
          History
        </h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search history"
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
            <Clock className="mr-2 h-4 w-4" />
            All History
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setSearchQuery("today")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Today
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setSearchQuery("yesterday")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Yesterday
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setSearchQuery("last 7 days")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Last 7 days
          </Button>
          
          <Separator className="my-2" />
          
          <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear Browsing History</DialogTitle>
                <DialogDescription>
                  This will permanently delete all of your browsing history. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 flex items-center text-amber-500">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p className="text-sm">
                  Your bookmarks and saved tabs will not be affected.
                </p>
              </div>
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    clearHistory();
                    setIsClearDialogOpen(false);
                  }}
                >
                  Yes, Clear History
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {searchQuery ? `Search Results: ${searchQuery}` : "History"}
          </h2>
          {filteredHistory.length > 0 && (
            <Button 
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:border-red-300"
              onClick={() => setIsClearDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          )}
        </div>
        
        {dates.map((date) => (
          <div key={date} className="mb-8">
            <h3 className="text-lg font-medium mb-2">{formatDate(date)}</h3>
            <Separator className="mb-4" />
            
            <div className="space-y-2">
              {groupedHistory[date].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group cursor-pointer"
                  onClick={() => navigateTo(item.url)}
                >
                  <div className="flex items-center flex-1">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center mr-3">
                      {item.favicon ? (
                        <img 
                          src={item.favicon} 
                          alt="" 
                          className="h-4 w-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.url}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.visitedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHistoryItem(item.id, e);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {filteredHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <HistoryIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No history found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try a different search term"
                : "Your browsing history will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 