"use client";

import { useState } from "react";
import { useBrowser } from "@/contexts/BrowserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Settings,
  Palette,
  Shield,
  Search,
  Download,
  Info,
  Save,
  Database,
} from "lucide-react";
import { BROWSER_SETTINGS_SECTIONS, BROWSER_NAME, BROWSER_VERSION } from "@/lib/constants";
import { searchEngines } from "@/lib/mock-data";
import DataManager from "@/components/browser/DataManager";

export default function SettingsPage() {
  const { currentSearchEngine, setSearchEngine, settings, updateSettings } = useBrowser();
  const [activeTab, setActiveTab] = useState("general");
  
  // Handle settings changes
  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };
  
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 bg-muted/20 h-full">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Settings
        </h1>
        
        <nav className="space-y-1">
          {BROWSER_SETTINGS_SECTIONS.map((section) => (
            <Button
              key={section.id}
              variant={activeTab === section.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab(section.id)}
            >
              {section.id === "general" ? (
                <Settings className="mr-2 h-4 w-4" />
              ) : section.id === "appearance" ? (
                <Palette className="mr-2 h-4 w-4" />
              ) : section.id === "privacy" ? (
                <Shield className="mr-2 h-4 w-4" />
              ) : section.id === "search" ? (
                <Search className="mr-2 h-4 w-4" />
              ) : section.id === "downloads" ? (
                <Download className="mr-2 h-4 w-4" />
              ) : section.id === "about" ? (
                <Info className="mr-2 h-4 w-4" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              {section.name}
            </Button>
          ))}
          
          <Button
            variant={activeTab === "data" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("data")}
          >
            <Database className="mr-2 h-4 w-4" />
            Data Management
          </Button>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="general" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">General Settings</h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="startup-page" className="text-sm font-medium">
                    On startup
                  </label>
                  <select
                    id="startup-page"
                    className="h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={settings.startupPage}
                    onChange={(e) => handleSettingChange('startupPage', e.target.value)}
                  >
                    <option value="newtab">Open the New Tab page</option>
                    <option value="continue">Continue where you left off</option>
                    <option value="specific">Open specific page or set of pages</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="home-button" className="text-sm font-medium">
                    Home button
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="home-button" 
                      className="h-4 w-4"
                      checked={settings.showHomeButton}
                      onChange={(e) => handleSettingChange('showHomeButton', e.target.checked)}
                    />
                    <span>Show Home button on toolbar</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Appearance</h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="theme" className="text-sm font-medium">
                    Theme
                  </label>
                  <select
                    id="theme"
                    className="h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="font-size" className="text-sm font-medium">
                    Font size
                  </label>
                  <select
                    id="font-size"
                    className="h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={settings.fontSize}
                    onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Privacy & Security</h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="cookies" className="text-sm font-medium">
                    Cookies
                  </label>
                  <select
                    id="cookies"
                    className="h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={settings.cookiesPolicy}
                    onChange={(e) => handleSettingChange('cookiesPolicy', e.target.value)}
                  >
                    <option value="allow-all">Allow all cookies</option>
                    <option value="block-third-party">Block third-party cookies</option>
                    <option value="block-all">Block all cookies</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Privacy Features</span>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="do-not-track" 
                        className="h-4 w-4"
                        checked={settings.doNotTrack}
                        onChange={(e) => handleSettingChange('doNotTrack', e.target.checked)}
                      />
                      <label htmlFor="do-not-track">Send "Do Not Track" request</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="block-popups" 
                        className="h-4 w-4" 
                        checked={settings.blockPopups}
                        onChange={(e) => handleSettingChange('blockPopups', e.target.checked)}
                      />
                      <label htmlFor="block-popups">Block pop-ups</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Search</h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="default-search-engine" className="text-sm font-medium">
                    Default search engine
                  </label>
                  <select
                    id="default-search-engine"
                    className="h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={currentSearchEngine.id}
                    onChange={(e) => setSearchEngine(e.target.value)}
                  >
                    {searchEngines.map((engine) => (
                      <option key={engine.id} value={engine.id}>
                        {engine.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="search-suggestions" className="text-sm font-medium">
                    Search suggestions
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="search-suggestions" 
                      className="h-4 w-4" 
                      checked={settings.showSearchSuggestions}
                      onChange={(e) => handleSettingChange('showSearchSuggestions', e.target.checked)}
                    />
                    <span>Show search suggestions</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="downloads" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Downloads</h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="download-location" className="text-sm font-medium">
                    Download location
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="download-location"
                      value={settings.downloadLocation}
                      onChange={(e) => handleSettingChange('downloadLocation', e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline">Change</Button>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <span className="text-sm font-medium">Download behavior</span>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="download-ask" 
                        name="download-behavior" 
                        className="h-4 w-4"
                        checked={settings.downloadBehavior === 'ask'}
                        onChange={() => handleSettingChange('downloadBehavior', 'ask')}
                      />
                      <label htmlFor="download-ask">Ask where to save each file before downloading</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="download-auto" 
                        name="download-behavior" 
                        className="h-4 w-4" 
                        checked={settings.downloadBehavior === 'auto'}
                        onChange={() => handleSettingChange('downloadBehavior', 'auto')}
                      />
                      <label htmlFor="download-auto">Save files to the default download location</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Data Management</h2>
              <DataManager />
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">About</h2>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <h3 className="text-lg font-bold mb-2">{BROWSER_NAME}</h3>
                  <p className="text-sm text-muted-foreground">Version {BROWSER_VERSION}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Built with Next.js, Tailwind, and shadcn/ui.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-bold mb-2">Acknowledgements</h3>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Next.js by Vercel</li>
                    <li>Tailwind CSS</li>
                    <li>shadcn/ui components</li>
                    <li>Lucide React icons</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 