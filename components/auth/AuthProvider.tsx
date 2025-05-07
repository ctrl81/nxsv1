import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  userAddress: string | null;
  loginWithGoogle: () => Promise<void>;
  connectWallet: () => Promise<void>;
  recoverAccount: (method: 'email' | 'social') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for stored authentication on mount
    const storedAddress = localStorage.getItem('userAddress');
    if (storedAddress) {
      setUserAddress(storedAddress);
      setIsAuthenticated(true);
    }
  }, []);

  const loginWithGoogle = async () => {
    try {
      // Implement Google OAuth flow
      // Generate zkProof and Sui address
      const suiAddress = '0x...'; // Replace with actual implementation
      localStorage.setItem('userAddress', suiAddress);
      setUserAddress(suiAddress);
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
      throw new Error('Authentication failed');
    }
  };

  const connectWallet = async () => {
    try {
      // Implement wallet connection
      const suiAddress = '0x...'; // Replace with actual implementation
      localStorage.setItem('userAddress', suiAddress);
      setUserAddress(suiAddress);
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw new Error('Wallet connection failed');
    }
  };

  const recoverAccount = async (method: 'email' | 'social') => {
    try {
      // Implement account recovery
      const suiAddress = '0x...'; // Replace with actual implementation
      localStorage.setItem('userAddress', suiAddress);
      setUserAddress(suiAddress);
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Account recovery failed:', error);
      throw new Error('Recovery failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('userAddress');
    setUserAddress(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userAddress,
        loginWithGoogle,
        connectWallet,
        recoverAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 