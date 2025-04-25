
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { Order, OrderItem, Client, CustomField } from '../types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import storageService from '../services/localStorageService';

interface OrderFormProps {
  order?: Order | null;
  onClose: () => void;
  onSave: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onClose, onSave }) => {
  const isEditing = !!order;
  const [clients, setClients] = useState<Client[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(order?.items || []);
  const [total, setTotal] = useState(order?.total || 0);

  // Get clients and custom fields that apply to orders
  useEffect(() => {
    const loadedClients = storageService.getClients();
    setClients(loadedClients);
    
    const fields = storageService.getCustomFields().filter(
      field => field.entityType === 'order'
    );
    setCustomFields(fields);
  }, []);

  // Calculate order total when items change
  useEffect(() => {
    const calculatedTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
    setTotal(calculatedTotal);
  }, [orderItems]);

  // Initialize form with existing order data or default values
  const form = useForm<Omit<Order, 'items'> & { clientId: string }>({
    defaultValues: order ? {
      ...order,
      clientId: order.clientId
    } : {
      id: '',
      clientId: '',
      orderNumber: `ORD-${new Date().getTime().toString().slice(-6)}`,
      status: 'pending' as const,
      total: 0,
      notes: '',
      createdAt: '',
      updatedAt: '',
      customFields: {}
    }
  });

  const clientId = form.watch('clientId');

  // Add new item to order
  const addItem = () => {
    const newItem: OrderItem = {
      id: new Date().getTime().toString(),
      name: '',
      quantity: 1,
      price: 0,
      description: ''
    };
    setOrderItems([...orderItems, newItem]);
  };

  // Update an order item
  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setOrderItems(updatedItems);
  };

  // Remove an order item
  const removeItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  const handleSubmit = (data: Omit<Order, 'items'>) => {
    try {
      // Validate if client is selected
      if (!data.clientId) {
        toast({
          title: "Validation Error",
          description: "Please select a client",
          variant: "destructive",
        });
        return;
      }

      // Validate if at least one item exists
      if (orderItems.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one item to the order",
          variant: "destructive",
        });
        return;
      }

      // Validate items
      for (const item of orderItems) {
        if (!item.name.trim()) {
          toast({
            title: "Validation Error",
            description: "Item name cannot be empty",
            variant: "destructive",
          });
          return;
        }
      }

      const now = new Date().toISOString();
      
      if (isEditing) {
        // Update existing order
        const updatedOrder: Order = {
          ...data,
          items: orderItems,
          total: total,
          updatedAt: now
        };
        
        const success = storageService.updateOrder(updatedOrder);
        
        if (success) {
          toast({
            title: "Order updated",
            description: "The order has been successfully updated",
          });
          onSave();
        } else {
          toast({
            title: "Error",
            description: "Failed to update order",
            variant: "destructive",
          });
        }
      } else {
        // Create new order
        const newOrder: Order = {
          ...data,
          id: new Date().getTime().toString(),
          items: orderItems,
          total: total,
          createdAt: now,
          updatedAt: now,
          customFields: data.customFields || {}
        };
        
        storageService.addOrder(newOrder);
        toast({
          title: "Order added",
          description: "The order has been successfully added",
        });
        onSave();
      }
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error",
        description: "Failed to save order",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{isEditing ? 'Edit Order' : 'Add Order'}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Number*</FormLabel>
                  <FormControl>
                    <Input placeholder="Order number" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client*</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status*</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col space-y-2">
              <label className="font-medium text-sm">Order Total</label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                ${total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border rounded-md p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Order Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No items added to this order yet
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={item.id} className="border rounded-md p-3 bg-muted/20">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm">Item #{index + 1}</h4>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Name*</label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Item name"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm font-medium">Quantity*</label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            placeholder="Qty"
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Price*</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div className="mt-2 text-right font-medium text-sm">
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Notes</FormLabel>
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

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OrderForm;
