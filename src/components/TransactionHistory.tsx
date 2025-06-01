
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, FileText } from 'lucide-react';
import { Transaction } from '@/pages/Index';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  formatIDR: (amount: number) => string;
  formatBTC: (amount: number) => string;
}

export const TransactionHistory = ({ 
  transactions, 
  onDeleteTransaction, 
  formatIDR, 
  formatBTC 
}: TransactionHistoryProps) => {
  if (transactions.length === 0) {
    return (
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Belum Ada Transaksi
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Mulai dengan menambahkan transaksi pembelian BTC pertama Anda
          </p>
        </CardContent>
      </Card>
    );
  }

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Jumlah BTC', 'Jumlah IDR', 'Harga per BTC', 'Catatan'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.btcAmount.toFixed(8),
        t.idrAmount.toString(),
        (t.idrAmount / t.btcAmount).toFixed(0),
        `"${t.notes || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `btc-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold">Riwayat Transaksi</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((transaction) => {
              const pricePerBTC = transaction.idrAmount / transaction.btcAmount;
              return (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2 sm:space-y-0"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <Badge variant="outline" className="w-fit">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        @ {formatIDR(pricePerBTC)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {formatBTC(transaction.btcAmount)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          = {formatIDR(transaction.idrAmount)}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          "{transaction.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Hapus transaksi ini?')) {
                        onDeleteTransaction(transaction.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};
