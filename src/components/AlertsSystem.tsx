
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, TrendingDown, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertsSystemProps {
  currentBTCPrice: number;
  remainingCapital: number;
  totalCapital: number;
}

export const AlertsSystem = ({ currentBTCPrice, remainingCapital, totalCapital }: AlertsSystemProps) => {
  const [lowCapitalAlert, setLowCapitalAlert] = useState(true);
  const [lowCapitalThreshold, setLowCapitalThreshold] = useState(20); // percentage
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLowCapitalAlert(settings.lowCapitalAlert ?? true);
      setLowCapitalThreshold(settings.lowCapitalThreshold ?? 20);
      setPriceAlerts(settings.priceAlerts ?? true);
      setTargetPrice(settings.targetPrice ?? 0);
      setAlertDirection(settings.alertDirection ?? 'above');
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      lowCapitalAlert,
      lowCapitalThreshold,
      priceAlerts,
      targetPrice,
      alertDirection,
    };
    localStorage.setItem('alertSettings', JSON.stringify(settings));
    toast({
      title: "Pengaturan Alert Disimpan",
      description: "Preferensi notifikasi Anda telah diperbarui",
    });
  };

  // Check for low capital
  const capitalPercentage = (remainingCapital / totalCapital) * 100;
  const isLowCapital = lowCapitalAlert && capitalPercentage <= lowCapitalThreshold;

  // Check for price alerts
  const isPriceAlertTriggered = priceAlerts && targetPrice > 0 && (
    (alertDirection === 'above' && currentBTCPrice >= targetPrice) ||
    (alertDirection === 'below' && currentBTCPrice <= targetPrice)
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Alerts */}
        {(isLowCapital || isPriceAlertTriggered) && (
          <div className="space-y-3">
            {isLowCapital && (
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  Modal tersisa rendah: {capitalPercentage.toFixed(1)}% dari total modal
                </AlertDescription>
              </Alert>
            )}
            {isPriceAlertTriggered && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Price alert: BTC mencapai target {alertDirection === 'above' ? 'di atas' : 'di bawah'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(targetPrice)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low Capital Alert */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Peringatan Modal Rendah</Label>
              <Switch
                checked={lowCapitalAlert}
                onCheckedChange={setLowCapitalAlert}
              />
            </div>
            {lowCapitalAlert && (
              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold (%)</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={lowCapitalThreshold}
                  onChange={(e) => setLowCapitalThreshold(Number(e.target.value))}
                  min="1"
                  max="50"
                />
              </div>
            )}
          </div>

          {/* Price Alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Alert Harga BTC</Label>
              <Switch
                checked={priceAlerts}
                onCheckedChange={setPriceAlerts}
              />
            </div>
            {priceAlerts && (
              <div className="space-y-2">
                <Label htmlFor="targetPrice">Target Harga (IDR)</Label>
                <Input
                  id="targetPrice"
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  placeholder="Masukkan target harga"
                />
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Notifikasi ketika harga</Label>
                  <select
                    value={alertDirection}
                    onChange={(e) => setAlertDirection(e.target.value as 'above' | 'below')}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="above">di atas</option>
                    <option value="below">di bawah</option>
                  </select>
                  <Label className="text-sm">target</Label>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button onClick={saveSettings} className="w-full">
          Simpan Pengaturan Alert
        </Button>
      </CardContent>
    </Card>
  );
};
