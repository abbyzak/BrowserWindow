"use client";

import { useState } from "react";
import { useBrowser } from "@/contexts/BrowserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Search, Compass } from "lucide-react";

export default function NewTabPage() {
  const { navigateTo, history } = useBrowser();
  const [searchInput, setSearchInput] = useState("");
  
  // Handle search input submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigateTo(searchInput.trim());
    }
  };
  
  // Get top sites from history
  const topSites = history
    .slice(0, 8)
    .filter((item, index, self) => 
      // Remove duplicates by URL
      index === self.findIndex(t => t.url === item.url)
    );
  
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-gradient-to-b from-blue-50 to-white text-gray-800">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700">
          New Tab
        </h1>
        
        {/* Search form */}
        <form 
          onSubmit={handleSearch}
          className="relative mb-12 w-full max-w-2xl mx-auto"
        >
          <div className="flex">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Search securely..."
                className="h-12 pl-12 pr-4 rounded-l-xl bg-white border-gray-300 text-gray-800 focus-visible:ring-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="h-12 px-6 rounded-r-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Search
            </Button>
          </div>
        </form>
        
        {/* Top sites */}
        <div className="mb-12">
          <h2 className="text-xl font-medium mb-6 flex items-center text-gray-800">
            <Compass className="mr-2 h-5 w-5 text-blue-600" />
            <span>Top Sites</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topSites.map((site) => (
              <Card
                key={site.id}
                className="overflow-hidden cursor-pointer bg-white border-gray-200 hover:bg-gray-100 transition-colors shadow-sm"
                onClick={() => navigateTo(site.url)}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {site.favicon ? (
                      <img 
                        src={site.favicon} 
                        alt="" 
                        className="h-6 w-6"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {site.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium truncate text-gray-900">{site.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {new URL(site.url).hostname}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Recent activity */}
        <div>
          <h2 className="text-xl font-medium mb-6 flex items-center text-gray-800">
            <Clock className="mr-2 h-5 w-5 text-blue-600" />
            <span>Recent Activity</span>
          </h2>
          <div className="space-y-2 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => navigateTo(item.url)}
              >
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
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
                    <Clock className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div className="truncate flex-1">
                  <p className="text-sm truncate text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {item.url}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(item.visitedAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 