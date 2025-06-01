
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Transaction } from '@/pages/Index';

interface PerformanceChartsProps {
  transactions: Transaction[];
  currentPrice: number;
  formatIDR: (amount: number) => string;
}

export const PerformanceCharts = ({ transactions, currentPrice, formatIDR }: PerformanceChartsProps) => {
  // Prepare data for charts
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Portfolio value over time
  const portfolioData = sortedTransactions.map((transaction, index) => {
    const previousTransactions = sortedTransactions.slice(0, index + 1);
    const totalBTC = previousTransactions.reduce((sum, t) => sum + t.btcAmount, 0);
    const totalSpent = previousTransactions.reduce((sum, t) => sum + t.idrAmount, 0);
    const currentValue = totalBTC * currentPrice;
    
    return {
      date: transaction.date,
      totalSpent,
      currentValue,
      btcAmount: totalBTC,
      pnl: currentValue - totalSpent,
    };
  });

  // Entry prices over time
  const entryPriceData = sortedTransactions.map(transaction => ({
    date: transaction.date,
    entryPrice: transaction.idrAmount / transaction.btcAmount,
    currentPrice,
  }));

  // Capital allocation pie chart data
  const totalSpent = transactions.reduce((sum, t) => sum + t.idrAmount, 0);
  const totalBTC = transactions.reduce((sum, t) => sum + t.btcAmount, 0);
  const currentValue = totalBTC * currentPrice;
  
  const pieData = [
    { name: 'Investasi', value: totalSpent, color: '#f97316' },
    { name: 'Profit/Loss', value: currentValue - totalSpent, color: currentValue > totalSpent ? '#10b981' : '#ef4444' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{new Date(label).toLocaleDateString('id-ID')}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatIDR(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Value Over Time */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Nilai Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => formatIDR(value)}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalSpent"
                stackId="1"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.6}
                name="Total Investasi"
              />
              <Area
                type="monotone"
                dataKey="currentValue"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Nilai Saat Ini"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Entry Prices vs Current Price */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Harga Entry vs Saat Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={entryPriceData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => formatIDR(value)}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="entryPrice"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                name="Harga Entry"
              />
              <Line
                type="monotone"
                dataKey="currentPrice"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Harga Saat Ini"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* P&L Chart */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profit & Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => formatIDR(value)}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                name="P&L"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Capital Allocation */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Alokasi Modal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${formatIDR(value)}`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatIDR(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
