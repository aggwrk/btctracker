import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Plus, Wallet, Target, BarChart3, LogOut, User } from 'lucide-react';
import { TransactionForm } from '@/components/TransactionForm';
import { PortfolioOverview } from '@/components/PortfolioOverview';
import { TransactionHistory } from '@/components/TransactionHistory';
import { PerformanceCharts } from '@/components/PerformanceCharts';
import { AlertsSystem } from '@/components/AlertsSystem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  date: string;
  btcAmount: number;
  idrAmount: number;
  notes?: string;
}

export interface PortfolioData {
  totalBTC: number;
  totalSpent: number;
  averageBuyPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  totalCapital: number;
  remainingCapital: number;
}

const Index = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentBTCPrice, setCurrentBTCPrice] = useState<number>(0);
  const [totalCapital, setTotalCapital] = useState<number>(100000000);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch current BTC price
  useEffect(() => {
    const fetchBTCPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr');
        const data = await response.json();
        setCurrentBTCPrice(data.bitcoin.idr);
      } catch (error) {
        console.error('Error fetching BTC price:', error);
        toast({
          title: "Error",
          description: "Failed to fetch current BTC price",
          variant: "destructive",
        });
      }
    };

    fetchBTCPrice();
    const interval = setInterval(fetchBTCPrice, 60000);
    return () => clearInterval(interval);
  }, [toast]);

  // Load user data from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Load transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('btc_transactions')
          .select('*')
          .order('transaction_date', { ascending: false });

        if (transactionsError) throw transactionsError;

        // Transform data to match existing interface
        const formattedTransactions = transactionsData.map(t => ({
          id: t.id,
          date: t.transaction_date,
          btcAmount: Number(t.btc_amount),
          idrAmount: Number(t.idr_amount),
          notes: t.notes || '',
        }));
        setTransactions(formattedTransactions);

        // Load user settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError;
        }

        if (settingsData) {
          setTotalCapital(Number(settingsData.total_capital));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Error",
          description: "Failed to load your data",
          variant: "destructive",
        });
      }
    };

    loadUserData();
  }, [user, toast]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('btc_transactions')
        .insert([
          {
            user_id: user.id,
            btc_amount: transaction.btcAmount,
            idr_amount: transaction.idrAmount,
            transaction_date: transaction.date,
            notes: transaction.notes || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        date: data.transaction_date,
        btcAmount: Number(data.btc_amount),
        idrAmount: Number(data.idr_amount),
        notes: data.notes || '',
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setShowAddTransaction(false);
      toast({
        title: "Transaksi Ditambahkan",
        description: "Pembelian BTC berhasil dicatat",
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('btc_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Transaksi Dihapus",
        description: "Transaksi berhasil dihapus dari portfolio",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const updateTotalCapital = async (newCapital: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          { user_id: user.id, total_capital: newCapital },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setTotalCapital(newCapital);
      toast({
        title: "Modal Diperbarui",
        description: `Total modal diset ke ${formatIDR(newCapital)}`,
      });
    } catch (error) {
      console.error('Error updating capital:', error);
      toast({
        title: "Error",
        description: "Failed to update capital",
        variant: "destructive",
      });
    }
  };

  // Calculate portfolio data
  const portfolioData: PortfolioData = {
    totalBTC: transactions.reduce((sum, t) => sum + t.btcAmount, 0),
    totalSpent: transactions.reduce((sum, t) => sum + t.idrAmount, 0),
    averageBuyPrice: transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + t.idrAmount, 0) / transactions.reduce((sum, t) => sum + t.btcAmount, 0)
      : 0,
    currentPrice: currentBTCPrice,
    unrealizedPnL: 0,
    totalCapital,
    remainingCapital: totalCapital - transactions.reduce((sum, t) => sum + t.idrAmount, 0),
  };

  portfolioData.unrealizedPnL = (portfolioData.totalBTC * currentBTCPrice) - portfolioData.totalSpent;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatBTC = (amount: number) => {
    return `₿${amount.toFixed(8)}`;
  };

  const displayName = profile?.full_name || user?.email || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header with User Info */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              <span className="text-gray-600 dark:text-gray-300">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            BTC Portfolio Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Pantau investasi Bitcoin Anda dalam IDR
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="text-sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              Live Price: {formatIDR(currentBTCPrice)}
            </Badge>
          </div>
        </div>

        {/* Alerts System */}
        <AlertsSystem 
          currentBTCPrice={currentBTCPrice}
          remainingCapital={portfolioData.remainingCapital}
          totalCapital={totalCapital}
        />

        {/* Portfolio Overview */}
        <PortfolioOverview 
          portfolioData={portfolioData}
          formatIDR={formatIDR}
          formatBTC={formatBTC}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <Button 
            onClick={() => setShowAddTransaction(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Transaksi
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              const newCapital = prompt('Masukkan total modal (IDR):', totalCapital.toString());
              if (newCapital && !isNaN(parseFloat(newCapital))) {
                updateTotalCapital(parseFloat(newCapital));
              }
            }}
            size="lg"
          >
            <Target className="w-5 h-5 mr-2" />
            Set Modal
          </Button>
        </div>

        {/* Charts */}
        {transactions.length > 0 && (
          <div className="mb-8">
            <PerformanceCharts 
              transactions={transactions}
              currentPrice={currentBTCPrice}
              formatIDR={formatIDR}
            />
          </div>
        )}

        {/* Transaction History */}
        <TransactionHistory 
          transactions={transactions}
          onDeleteTransaction={deleteTransaction}
          formatIDR={formatIDR}
          formatBTC={formatBTC}
        />

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <TransactionForm
            onSubmit={addTransaction}
            onCancel={() => setShowAddTransaction(false)}
            currentPrice={currentBTCPrice}
            remainingCapital={portfolioData.remainingCapital}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
