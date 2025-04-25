
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, Upload, Users, AlertTriangle } from 'lucide-react';
import storageService from '../services/localStorageService';
import { toast } from '@/hooks/use-toast';

const DatabaseManager = () => {
  const [exportData, setExportData] = useState<string | null>(null);

  const handleExportData = () => {
    const data = storageService.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    setExportData(dataStr);
    
    // Create download link
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client-vault-backup.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Database Exported",
      description: "Your data has been exported successfully",
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        storageService.importData(data);
        toast({
          title: "Database Imported",
          description: "Your data has been imported successfully",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = () => {
    if (window.confirm('Are you sure you want to reset the database? This action cannot be undone.')) {
      storageService.clearDatabase();
      toast({
        title: "Database Reset",
        description: "Your database has been reset successfully",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Database Management</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportData} className="w-full">
              Export Data
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button asChild className="w-full">
                  <span>Select File to Import</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-destructive hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Resetting the database will permanently delete all your data. This action cannot be undone.
              </AlertDescription>
            </Alert>
            <Button 
              variant="destructive" 
              className="mt-4"
              onClick={handleResetDatabase}
            >
              Reset Database
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseManager;
