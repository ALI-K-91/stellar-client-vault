
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Download, Upload, Database } from 'lucide-react';
import storageService from '../services/localStorageService';
import { CustomField } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import CustomFieldForm from '@/components/CustomFieldForm';

const Settings = () => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [exportedData, setExportedData] = useState<string>('');
  
  // Fetch custom fields
  const { data: customFields = [], refetch } = useQuery({
    queryKey: ['customFields'],
    queryFn: () => storageService.getCustomFields(),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom field?')) {
      const success = storageService.deleteCustomField(id);
      if (success) {
        toast({
          title: "Custom field deleted",
          description: "The custom field has been successfully deleted",
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete custom field",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportData = () => {
    try {
      const data = storageService.exportData();
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `clientvault-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (!data.clients || !data.orders || !data.customFields) {
            toast({
              title: "Invalid data format",
              description: "The imported file does not contain valid data",
              variant: "destructive",
            });
            return;
          }
          
          if (window.confirm('Importing data will replace all your existing data. Are you sure you want to continue?')) {
            storageService.importData(data);
            
            toast({
              title: "Data imported",
              description: "Your data has been imported successfully",
            });
            
            refetch();
          }
        } catch (error) {
          console.error('Error importing data:', error);
          toast({
            title: "Import failed",
            description: "Failed to import data",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleClearDatabase = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      storageService.clearDatabase();
      toast({
        title: "Database cleared",
        description: "All data has been cleared successfully",
      });
      refetch();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Custom Fields</CardTitle>
            <CardDescription>
              Configure custom fields for clients and orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button onClick={() => setIsAddingField(true)} className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Field
              </Button>
            </div>
            
            {customFields.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customFields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">{field.name}</TableCell>
                        <TableCell>{field.type}</TableCell>
                        <TableCell>{field.entityType}</TableCell>
                        <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setEditingField(field)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(field.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No custom fields have been created yet
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Import, export, or reset your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="flex items-center justify-start" 
                onClick={handleExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-start" 
                onClick={handleImportData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
              <Button 
                variant="destructive" 
                className="flex items-center justify-start mt-6" 
                onClick={handleClearDatabase}
              >
                <Database className="mr-2 h-4 w-4" />
                Clear Database
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Field Form Modal */}
      {(isAddingField || editingField) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
            <CustomFieldForm 
              customField={editingField}
              onClose={() => {
                setIsAddingField(false);
                setEditingField(null);
              }}
              onSave={() => {
                refetch();
                setIsAddingField(false);
                setEditingField(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
