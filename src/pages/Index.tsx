
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Plus, Wallet, Target, BarChart3 } from 'lucide-react';
import { TransactionForm } from '@/components/TransactionForm';
import { PortfolioOverview } from '@/components/PortfolioOverview';
import { TransactionHistory } from '@/components/TransactionHistory';
import { PerformanceCharts } from '@/components/PerformanceCharts';
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentBTCPrice, setCurrentBTCPrice] = useState<number>(0);
  const [totalCapital, setTotalCapital] = useState<number>(100000000); // Default 100M IDR
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
    const interval = setInterval(fetchBTCPrice, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [toast]);

  // Load data from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('btc-transactions');
    const savedCapital = localStorage.getItem('btc-total-capital');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedCapital) {
      setTotalCapital(parseFloat(savedCapital));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('btc-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('btc-total-capital', totalCapital.toString());
  }, [totalCapital]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    setShowAddTransaction(false);
    toast({
      title: "Transaksi Ditambahkan",
      description: "Pembelian BTC berhasil dicatat",
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Transaksi Dihapus",
      description: "Transaksi berhasil dihapus dari portfolio",
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
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
                setTotalCapital(parseFloat(newCapital));
                toast({
                  title: "Modal Diperbarui",
                  description: `Total modal diset ke ${formatIDR(parseFloat(newCapital))}`,
                });
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
