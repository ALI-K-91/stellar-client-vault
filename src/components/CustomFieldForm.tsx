
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { CustomField, FieldType } from '../types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import storageService from '../services/localStorageService';

interface CustomFieldFormProps {
  customField?: CustomField | null;
  onClose: () => void;
  onSave: () => void;
}

const CustomFieldForm: React.FC<CustomFieldFormProps> = ({ customField, onClose, onSave }) => {
  const isEditing = !!customField;
  const [options, setOptions] = useState<string[]>(customField?.options || []);
  const [newOption, setNewOption] = useState('');
  
  // Initialize form with existing custom field data or default values
  const form = useForm<Omit<CustomField, 'options'>>({
    defaultValues: customField ? {
      id: customField.id,
      name: customField.name,
      type: customField.type,
      entityType: customField.entityType,
      required: customField.required,
      description: customField.description,
      createdAt: customField.createdAt
    } : {
      id: '',
      name: '',
      type: 'text' as FieldType,
      entityType: 'client',
      required: false,
      description: '',
      createdAt: ''
    }
  });

  const fieldType = form.watch('type');

  const addOption = () => {
    if (newOption.trim() !== '') {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
  };

  const handleSubmit = (data: Omit<CustomField, 'options'>) => {
    try {
      // Validate that select type has options
      if (data.type === 'select' && options.length === 0) {
        toast({
          title: "Validation Error",
          description: "Select fields must have at least one option",
          variant: "destructive",
        });
        return;
      }

      const now = new Date().toISOString();
      
      if (isEditing) {
        // Update existing custom field
        const updatedField: CustomField = {
          ...data,
          options: data.type === 'select' ? options : undefined,
          createdAt: customField!.createdAt
        };
        
        const success = storageService.updateCustomField(updatedField);
        
        if (success) {
          toast({
            title: "Custom field updated",
            description: "The custom field has been successfully updated",
          });
          onSave();
        } else {
          toast({
            title: "Error",
            description: "Failed to update custom field",
            variant: "destructive",
          });
        }
      } else {
        // Create new custom field
        const newField: CustomField = {
          ...data,
          id: new Date().getTime().toString(),
          options: data.type === 'select' ? options : undefined,
          createdAt: now
        };
        
        storageService.addCustomField(newField);
        toast({
          title: "Custom field added",
          description: "The custom field has been successfully added",
        });
        onSave();
      }
    } catch (error) {
      console.error('Error saving custom field:', error);
      toast({
        title: "Error",
        description: "Failed to save custom field",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{isEditing ? 'Edit Custom Field' : 'Add Custom Field'}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Field name" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field Type*</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value as FieldType)}
                    required
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="select">Select (Dropdown)</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apply To*</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value as 'client' | 'order')}
                    required
                  >
                    <option value="client">Clients</option>
                    <option value="order">Orders</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="required"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel className="font-normal">Required Field</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Description or help text for this field" 
                    {...field} 
                    className="resize-none"
                  />
                </FormControl>
                <FormDescription>
                  This will be displayed as a hint to users when filling out this field
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Option list for select fields */}
          {fieldType === 'select' && (
            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Options</h3>
              
              <div className="flex items-center space-x-2">
                <Input 
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Enter an option"
                  className="flex-1"
                />
                <Button type="button" onClick={addOption}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {options.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <span>{option}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeOption(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-muted-foreground">
                  No options added yet
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Field' : 'Add Field'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CustomFieldForm;
