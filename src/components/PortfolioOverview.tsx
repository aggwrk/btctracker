
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, Target, BarChart3, Bitcoin } from 'lucide-react';
import { PortfolioData } from '@/pages/Index';

interface PortfolioOverviewProps {
  portfolioData: PortfolioData;
  formatIDR: (amount: number) => string;
  formatBTC: (amount: number) => string;
}

export const PortfolioOverview = ({ portfolioData, formatIDR, formatBTC }: PortfolioOverviewProps) => {
  const profitPercentage = portfolioData.totalSpent > 0 
    ? (portfolioData.unrealizedPnL / portfolioData.totalSpent) * 100 
    : 0;

  const isProfit = portfolioData.unrealizedPnL >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Holdings */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total BTC
          </CardTitle>
          <Bitcoin className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatBTC(portfolioData.totalBTC)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Nilai: {formatIDR(portfolioData.totalBTC * portfolioData.currentPrice)}
          </p>
        </CardContent>
      </Card>

      {/* Average Buy Price */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Harga Rata-rata
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatIDR(portfolioData.averageBuyPrice || 0)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total dibelanjakan: {formatIDR(portfolioData.totalSpent)}
          </p>
        </CardContent>
      </Card>

      {/* Unrealized P&L */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Unrealized P&L
          </CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatIDR(portfolioData.unrealizedPnL)}
          </div>
          <Badge 
            variant={isProfit ? "default" : "destructive"}
            className="text-xs mt-1"
          >
            {isProfit ? '+' : ''}{profitPercentage.toFixed(2)}%
          </Badge>
        </CardContent>
      </Card>

      {/* Remaining Capital */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Modal Tersisa
          </CardTitle>
          <Wallet className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatIDR(portfolioData.remainingCapital)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            dari {formatIDR(portfolioData.totalCapital)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
