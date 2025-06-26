'use client';

import { UserNav } from '@/components/UserNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { Package, Upload, Users, Settings, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SoftwareStats } from './components/SoftwareStats';
import { RecentActivities } from './components/RecentActivities';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      
      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 gap-4">
        <SoftwareStats />
      </div>

      {/* Aktivitäten */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivities />
      </div>
    </div>
  );
}
