
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Calculator } from 'lucide-react';
import { Transaction } from '@/pages/Index';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  currentPrice: number;
  remainingCapital: number;
}

export const TransactionForm = ({ onSubmit, onCancel, currentPrice, remainingCapital }: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    btcAmount: '',
    idrAmount: '',
    notes: '',
  });
  const [calculationMode, setCalculationMode] = useState<'btc' | 'idr'>('idr');

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const btcAmount = parseFloat(formData.btcAmount);
    const idrAmount = parseFloat(formData.idrAmount);
    
    if (isNaN(btcAmount) || isNaN(idrAmount) || btcAmount <= 0 || idrAmount <= 0) {
      alert('Mohon masukkan jumlah yang valid');
      return;
    }
    
    if (idrAmount > remainingCapital) {
      alert('Jumlah IDR melebihi modal yang tersisa');
      return;
    }
    
    onSubmit({
      date: formData.date,
      btcAmount,
      idrAmount,
      notes: formData.notes,
    });
  };

  const handleCalculation = () => {
    if (calculationMode === 'idr' && formData.idrAmount && currentPrice) {
      const btc = parseFloat(formData.idrAmount) / currentPrice;
      setFormData(prev => ({ ...prev, btcAmount: btc.toFixed(8) }));
    } else if (calculationMode === 'btc' && formData.btcAmount && currentPrice) {
      const idr = parseFloat(formData.btcAmount) * currentPrice;
      setFormData(prev => ({ ...prev, idrAmount: idr.toString() }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Tambah Transaksi</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Mode Kalkulasi</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCalculationMode(prev => prev === 'idr' ? 'btc' : 'idr')}
                >
                  {calculationMode === 'idr' ? 'IDR → BTC' : 'BTC → IDR'}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Harga saat ini: {formatIDR(currentPrice)}
              </p>
            </div>

            <div>
              <Label htmlFor="idrAmount">Jumlah IDR</Label>
              <Input
                id="idrAmount"
                type="number"
                placeholder="0"
                value={formData.idrAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, idrAmount: e.target.value }))}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Modal tersisa: {formatIDR(remainingCapital)}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="btcAmount" className="flex-1">Jumlah BTC</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCalculation}
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  Hitung
                </Button>
              </div>
              <Input
                id="btcAmount"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={formData.btcAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, btcAmount: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Strategi, kondisi pasar, dll..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Batal
              </Button>
              <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
