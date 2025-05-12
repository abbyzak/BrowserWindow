"use client";

import { useState, useRef } from "react";
import { useBrowser } from "@/contexts/BrowserContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Download, Upload, AlertCircle, Trash2 } from "lucide-react";

export default function DataManager() {
  const { exportBrowserData, importBrowserData, clearBrowserData } = useBrowser();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  
  // Export browser data
  const handleExport = () => {
    const data = exportBrowserData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and click it programmatically
    const a = document.createElement("a");
    a.href = url;
    a.download = `zen-browser-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Import browser data
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string;
        
        // Validate JSON before importing
        JSON.parse(jsonData); // This will throw if invalid
        
        importBrowserData(jsonData);
        setIsImportDialogOpen(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
      } catch (error) {
        console.error("Error importing data:", error);
        setImportError("Invalid JSON file. Please try again with a valid export.");
      }
    };
    
    reader.onerror = () => {
      setImportError("Error reading file. Please try again.");
    };
    
    reader.readAsText(file);
  };
  
  // Clear browser data
  const handleClearData = () => {
    clearBrowserData();
    setIsClearDialogOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Export & Import</h3>
        <p className="text-sm text-muted-foreground">
          Export your browser data to a JSON file or import from a previous export.
        </p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Browser Data</DialogTitle>
                <DialogDescription>
                  Upload a previously exported JSON file to restore your browser data.
                  This will replace your current tabs, bookmarks, and settings.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                />
                
                {importError && (
                  <div className="flex items-center mt-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {importError}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Clear Browser Data</h3>
        <p className="text-sm text-muted-foreground">
          Clear all browser data including bookmarks, history, and settings.
          This action cannot be undone.
        </p>
        
        <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-fit">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Browser Data</DialogTitle>
              <DialogDescription>
                This will permanently delete all your bookmarks, history, and settings.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearData}>
                Yes, Clear All Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 