import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from '../types';
import storageService from '../services/localStorageService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, ShoppingCart, DollarSign, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    topClients: [],
  });

  useEffect(() => {
    const clients = storageService.getClients();
    const orders = storageService.getOrders();
    
    const clientOrderMap = new Map<string, { orders: number; revenue: number; name: string }>();
    
    orders.forEach(order => {
      const client = clients.find(c => c.id === order.clientId);
      if (client) {
        const clientName = client.name;
        if (!clientOrderMap.has(client.id)) {
          clientOrderMap.set(client.id, { orders: 0, revenue: 0, name: clientName });
        }
        
        const clientData = clientOrderMap.get(client.id)!;
        clientData.orders += 1;
        clientData.revenue += order.total;
      }
    });
    
    const topClients = Array.from(clientOrderMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    setStats({
      totalClients: clients.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter(order => ['pending', 'processing'].includes(order.status)).length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
      topClients,
    });
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const statusData = [
    { name: 'Pending', value: stats.pendingOrders },
    { name: 'Completed', value: stats.completedOrders },
  ];

  const revenueData = stats.topClients.map(client => ({
    name: client.name,
    revenue: client.revenue,
  }));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to your ClientVault dashboard
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow hover:scale-105 transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow hover:scale-105 transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow hover:scale-105 transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              PKR {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow hover:scale-105 transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Orders in progress</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-background">Revenue</TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-background">Top Clients</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of orders by current status
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <div className="w-full h-[300px]">
                {statusData.some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No order data to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue" className="space-y-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Revenue by Client</CardTitle>
              <CardDescription>
                Top clients by revenue generated
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <div className="w-full h-[300px]">
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`PKR ${value}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No revenue data to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="clients" className="space-y-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
              <CardDescription>
                Clients who have placed the most orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topClients.length > 0 ? (
                <div className="space-y-4">
                  {stats.topClients.map((client, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-3 last:border-0 hover:bg-muted/30 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.orders} {client.orders === 1 ? 'order' : 'orders'}
                          </div>
                        </div>
                      </div>
                      <div className="font-medium">PKR {client.revenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No client data to display
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
