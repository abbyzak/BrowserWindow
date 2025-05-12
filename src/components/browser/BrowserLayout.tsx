"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";
import TabBar from "./TabBar";
import { BrowserProvider } from "@/contexts/BrowserContext";

export default function BrowserLayout({ children }: { children: ReactNode }) {
  return (
    <BrowserProvider>
      <div className="flex flex-col h-screen bg-white">
        <div className="flex flex-col">
          <TabBar />
          <Navbar />
        </div>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </BrowserProvider>
  );
} 