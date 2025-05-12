"use client";

import { useState } from "react";
import { useBrowser } from "@/contexts/BrowserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Shield, Lock, Monitor, ExternalLink, Search } from "lucide-react";
import { BROWSER_BOOKMARKS } from "@/lib/constants";

export default function LandingPage() {
  const { navigateTo, addTab } = useBrowser();
  const [searchInput, setSearchInput] = useState("");
  
  // Handle search input submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigateTo(searchInput.trim());
    }
  };
  
  return (
    <div className="flex flex-col min-h-full bg-gradient-to-br from-white via-blue-50 to-purple-50 text-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700">
              Xfinity Browser
            </span>
          </h1>
          <p className="text-2xl text-gray-700 mb-10">
            The secure browser designed for streamers. Protect your privacy while sharing your screen.
          </p>
          
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
                  placeholder="Search the web securely..."
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
          
          <div className="flex gap-4 justify-center mt-6">
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={() => addTab()}
            >
              New Tab
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigateTo(BROWSER_BOOKMARKS)}
            >
              Bookmarks
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-20 bg-white bg-opacity-90">
        <h2 className="text-4xl font-bold text-center mb-16">
          Designed for <span className="text-blue-600">Streamers</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Privacy Protection</h3>
            <p className="text-gray-600">
              Hide sensitive information from your streams. Keep personal data private even when screen sharing.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6 text-white">
              <Monitor className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Stream-Friendly</h3>
            <p className="text-gray-600">
              Specially designed UI that helps you browse safely during live streams without accidentally revealing sensitive content.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-6 text-white">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Content Blocking</h3>
            <p className="text-gray-600">
              Automatically hide personal recommendations, account details, and other private information from viewers.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Stream Safely?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Start browsing with peace of mind knowing your personal information stays private.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg h-14 px-8 text-white"
            onClick={() => addTab()}
          >
            Start Browsing Now
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto bg-gray-100 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">© {new Date().getFullYear()} Xfinity Browser. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 