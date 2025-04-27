
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../types';
import storageService from '../services/localStorageService';
import { toast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  isAuthenticated: false,
  loading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Enhanced authentication persistence check on initial load and focus
  const checkUserAuth = () => {
    try {
      const savedUser = storageService.getUser();
      if (savedUser) {
        console.log("User authentication restored from storage");
        setUser(savedUser);
      } else {
        console.log("No user found in storage");
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check for existing login on initial load
  useEffect(() => {
    // Initial auth check
    checkUserAuth();
    
    // Add event listeners for app state changes (important for mobile)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        console.log("App became visible, checking auth");
        checkUserAuth();
      }
    });
    
    // Check for auth when app resumes from background on mobile
    document.addEventListener("resume", checkUserAuth);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkUserAuth();
      });
      document.removeEventListener("resume", checkUserAuth);
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Get the stored user to verify credentials
      const storedUser = storageService.getUser();
      
      if (!storedUser) {
        toast({
          title: "Login Failed",
          description: "No user account found. Please register first.",
          variant: "destructive"
        });
        return false;
      }

      // Hash the password to compare with stored hash
      const passwordHash = CryptoJS.SHA256(password).toString();
      
      if (storedUser.username === username && storedUser.passwordHash === passwordHash) {
        console.log("User authenticated successfully");
        setUser(storedUser);
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
        console.log("Authentication failed: credentials don't match");
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = storageService.getUser();
      
      if (existingUser) {
        toast({
          title: "Registration Failed",
          description: "A user account already exists. Please login instead.",
          variant: "destructive"
        });
        return false;
      }
      
      // Create a new user
      const passwordHash = CryptoJS.SHA256(password).toString();
      const newUser: User = {
        id: new Date().getTime().toString(),
        username,
        passwordHash,
        createdAt: new Date().toISOString()
      };
      
      storageService.saveUser(newUser);
      setUser(newUser);
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!"
      });
      
      console.log("User registered successfully");
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully."
    });
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      isAuthenticated: !!user,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
