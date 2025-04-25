
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Client, CustomField } from '../types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import storageService from '../services/localStorageService';

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
  onSave: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onClose, onSave }) => {
  const isEditing = !!client;
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  
  // Get custom fields that apply to clients
  useEffect(() => {
    const fields = storageService.getCustomFields().filter(
      field => field.entityType === 'client'
    );
    setCustomFields(fields);
  }, []);

  const form = useForm<Client>({
    defaultValues: client || {
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
      createdAt: '',
      updatedAt: '',
      customFields: {}
    }
  });

  const handleSubmit = (data: Client) => {
    try {
      const now = new Date().toISOString();
      
      if (isEditing) {
        // Update existing client
        const updatedClient = {
          ...data,
          updatedAt: now
        };
        
        const success = storageService.updateClient(updatedClient);
        
        if (success) {
          toast({
            title: "Client updated",
            description: "The client has been successfully updated",
          });
          onSave();
        } else {
          toast({
            title: "Error",
            description: "Failed to update client",
            variant: "destructive",
          });
        }
      } else {
        // Create new client
        const newClient = {
          ...data,
          id: new Date().getTime().toString(),
          createdAt: now,
          updatedAt: now,
          customFields: data.customFields || {}
        };
        
        storageService.addClient(newClient);
        toast({
          title: "Client added",
          description: "The client has been successfully added",
        });
        onSave();
      }
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Error",
        description: "Failed to save client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{isEditing ? 'Edit Client' : 'Add Client'}</h2>
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
                <FormLabel>Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Client name" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email address" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone*</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Zip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="font-medium mb-3">Custom Fields</h3>
              <div className="space-y-3">
                {customFields.map((customField) => (
                  <FormField
                    key={customField.id}
                    control={form.control}
                    name={`customFields.${customField.id}` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{customField.name}</FormLabel>
                        <FormControl>
                          {customField.type === 'text' || customField.type === 'email' || 
                           customField.type === 'number' || customField.type === 'phone' || 
                           customField.type === 'date' ? (
                            <Input 
                              type={customField.type} 
                              placeholder={customField.description || customField.name}
                              {...field}
                              required={customField.required}
                            />
                          ) : customField.type === 'checkbox' ? (
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-input"
                                checked={!!field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                required={customField.required}
                              />
                              <span className="ml-2 text-sm text-muted-foreground">
                                {customField.description || ''}
                              </span>
                            </div>
                          ) : customField.type === 'select' ? (
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              {...field}
                              required={customField.required}
                            >
                              <option value="">Select an option</option>
                              {customField.options?.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <Input {...field} required={customField.required} />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Client' : 'Add Client'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ClientForm;
