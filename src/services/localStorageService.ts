
import { Client, Order, User, CustomField } from "../types";
import CryptoJS from 'crypto-js';

// Secret key for encryption - in a real app, you'd want to generate and store this securely
const SECRET_KEY = "your-secure-secret-key-that-is-very-long";

class LocalStorageService {
  // User authentication
  private readonly USER_KEY = 'secure_user_data';
  private readonly CLIENTS_KEY = 'secure_clients_data';
  private readonly ORDERS_KEY = 'secure_orders_data';
  private readonly CUSTOM_FIELDS_KEY = 'secure_custom_fields';
  
  // Encryption/Decryption helpers
  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  }
  
  private decrypt(ciphertext: string): any {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // User methods
  saveUser(user: User): void {
    const encryptedUser = this.encrypt(user);
    localStorage.setItem(this.USER_KEY, encryptedUser);
  }

  getUser(): User | null {
    const encryptedUser = localStorage.getItem(this.USER_KEY);
    if (!encryptedUser) return null;
    
    try {
      return this.decrypt(encryptedUser);
    } catch (error) {
      console.error("Failed to decrypt user data:", error);
      return null;
    }
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Client methods
  saveClients(clients: Client[]): void {
    const encryptedClients = this.encrypt(clients);
    localStorage.setItem(this.CLIENTS_KEY, encryptedClients);
  }

  getClients(): Client[] {
    const encryptedClients = localStorage.getItem(this.CLIENTS_KEY);
    if (!encryptedClients) return [];
    
    try {
      return this.decrypt(encryptedClients);
    } catch (error) {
      console.error("Failed to decrypt client data:", error);
      return [];
    }
  }

  addClient(client: Client): void {
    const clients = this.getClients();
    clients.push(client);
    this.saveClients(clients);
  }

  updateClient(updatedClient: Client): boolean {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === updatedClient.id);
    
    if (index !== -1) {
      clients[index] = updatedClient;
      this.saveClients(clients);
      return true;
    }
    return false;
  }

  deleteClient(clientId: string): boolean {
    const clients = this.getClients();
    const filteredClients = clients.filter(c => c.id !== clientId);
    
    if (filteredClients.length !== clients.length) {
      this.saveClients(filteredClients);
      return true;
    }
    return false;
  }

  // Order methods
  saveOrders(orders: Order[]): void {
    const encryptedOrders = this.encrypt(orders);
    localStorage.setItem(this.ORDERS_KEY, encryptedOrders);
  }

  getOrders(): Order[] {
    const encryptedOrders = localStorage.getItem(this.ORDERS_KEY);
    if (!encryptedOrders) return [];
    
    try {
      return this.decrypt(encryptedOrders);
    } catch (error) {
      console.error("Failed to decrypt order data:", error);
      return [];
    }
  }

  getClientOrders(clientId: string): Order[] {
    const orders = this.getOrders();
    return orders.filter(order => order.clientId === clientId);
  }

  addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    this.saveOrders(orders);
  }

  updateOrder(updatedOrder: Order): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === updatedOrder.id);
    
    if (index !== -1) {
      orders[index] = updatedOrder;
      this.saveOrders(orders);
      return true;
    }
    return false;
  }

  deleteOrder(orderId: string): boolean {
    const orders = this.getOrders();
    const filteredOrders = orders.filter(o => o.id !== orderId);
    
    if (filteredOrders.length !== orders.length) {
      this.saveOrders(filteredOrders);
      return true;
    }
    return false;
  }

  // Custom fields methods
  saveCustomFields(customFields: CustomField[]): void {
    const encryptedFields = this.encrypt(customFields);
    localStorage.setItem(this.CUSTOM_FIELDS_KEY, encryptedFields);
  }

  getCustomFields(): CustomField[] {
    const encryptedFields = localStorage.getItem(this.CUSTOM_FIELDS_KEY);
    if (!encryptedFields) return [];
    
    try {
      return this.decrypt(encryptedFields);
    } catch (error) {
      console.error("Failed to decrypt custom fields data:", error);
      return [];
    }
  }

  addCustomField(customField: CustomField): void {
    const customFields = this.getCustomFields();
    customFields.push(customField);
    this.saveCustomFields(customFields);
  }

  updateCustomField(updatedCustomField: CustomField): boolean {
    const customFields = this.getCustomFields();
    const index = customFields.findIndex(cf => cf.id === updatedCustomField.id);
    
    if (index !== -1) {
      customFields[index] = updatedCustomField;
      this.saveCustomFields(customFields);
      return true;
    }
    return false;
  }

  deleteCustomField(customFieldId: string): boolean {
    const customFields = this.getCustomFields();
    const filteredCustomFields = customFields.filter(cf => cf.id !== customFieldId);
    
    if (filteredCustomFields.length !== customFields.length) {
      this.saveCustomFields(filteredCustomFields);
      return true;
    }
    return false;
  }

  // Database utilities
  clearDatabase(): void {
    localStorage.removeItem(this.CLIENTS_KEY);
    localStorage.removeItem(this.ORDERS_KEY);
    localStorage.removeItem(this.CUSTOM_FIELDS_KEY);
  }

  exportData(): { clients: Client[]; orders: Order[]; customFields: CustomField[] } {
    return {
      clients: this.getClients(),
      orders: this.getOrders(),
      customFields: this.getCustomFields()
    };
  }

  importData(data: { clients: Client[]; orders: Order[]; customFields: CustomField[] }): void {
    this.saveClients(data.clients);
    this.saveOrders(data.orders);
    this.saveCustomFields(data.customFields);
  }
}

export const storageService = new LocalStorageService();
export default storageService;
