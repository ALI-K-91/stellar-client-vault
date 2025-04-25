
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import storageService from '../services/localStorageService';
import { Order, Client } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import OrderForm from '@/components/OrderForm';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Fetch orders from local storage
  const { data: orders = [], refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => storageService.getOrders(),
  });

  // Fetch clients for displaying client names
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => storageService.getClients(),
  });

  // Get client name by id
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(order.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const success = storageService.deleteOrder(id);
      if (success) {
        toast({
          title: "Order deleted",
          description: "The order has been successfully deleted",
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete order",
          variant: "destructive",
        });
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <Button onClick={() => setIsAddingOrder(true)} className="flex items-center hover:scale-105 transition-transform">
          <Plus className="mr-2 h-4 w-4" />
          Add Order
        </Button>
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle>Search Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 hover:border-primary transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{getClientName(order.clientId)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>PKR {order.total.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setEditingOrder(order)} className="hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)} className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {searchTerm ? "No orders match your search" : "No orders added yet"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Form Modal */}
      {(isAddingOrder || editingOrder) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto animate-scale-in">
            <OrderForm 
              order={editingOrder}
              onClose={() => {
                setIsAddingOrder(false);
                setEditingOrder(null);
              }}
              onSave={() => {
                refetch();
                setIsAddingOrder(false);
                setEditingOrder(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
