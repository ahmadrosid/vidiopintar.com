'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AdminNavigation } from '@/components/admin/admin-navigation';

const adminFieldClassName =
  'h-10 rounded-xs border-border bg-background text-foreground shadow-xs placeholder:text-muted-foreground dark:bg-input/30';

const adminTextareaClassName =
  'min-h-24 rounded-xs border-border bg-background text-foreground shadow-xs placeholder:text-muted-foreground dark:bg-input/30';

const adminFieldGroupClassName = 'space-y-3';

const adminCardClassName =
  'rounded-xs shadow-[0px_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_12px_rgba(0,0,0,0.25)]';

interface PaymentSettings {
  id: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  whatsappPhoneNumber: string;
  whatsappMessageTemplate: string;
}

// Custom hook for payment settings without useEffect
function usePaymentSettings() {
  const [data, setData] = useState<{
    settings: PaymentSettings | null;
    loading: boolean;
    error: string | null;
  }>({
    settings: null,
    loading: true,
    error: null
  });

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings');
      if (response.ok) {
        const settings = await response.json();
        setData({ settings, loading: false, error: null });
      } else {
        setData({ settings: null, loading: false, error: 'Failed to fetch payment settings' });
      }
    } catch (error) {
      setData({ settings: null, loading: false, error: 'Failed to fetch payment settings' });
    }
  };

  // Auto-fetch on mount using a self-executing async function
  useMemo(() => {
    fetchSettings();
  }, []);

  return { ...data, refetch: fetchSettings };
}

export default function PaymentSettingsPage() {
  const { settings, loading, error, refetch } = usePaymentSettings();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    whatsappPhoneNumber: '',
    whatsappMessageTemplate: ''
  });

  // Update form data when settings are loaded
  useMemo(() => {
    if (settings) {
      setFormData({
        bankName: settings.bankName || '',
        bankAccountNumber: settings.bankAccountNumber || '',
        bankAccountName: settings.bankAccountName || '',
        whatsappPhoneNumber: settings.whatsappPhoneNumber || '',
        whatsappMessageTemplate: settings.whatsappMessageTemplate || ''
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/payment-settings';
      const method = settings ? 'PUT' : 'POST';
      const body = settings ? { id: settings.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save payment settings');
      }

      const data = await response.json();
      refetch();
      toast.success('Payment settings saved successfully!');
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <main className="bg-accent dark:bg-background min-h-screen">
        <div className="container max-w-[1328px] w-full mx-auto py-8 px-4">
          <div className="animate-pulse space-y-8">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-10 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className={`${adminCardClassName} border bg-card p-6 space-y-6`}>
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-10 bg-muted rounded" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-10 bg-muted rounded" />
                  <div className="h-24 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-accent dark:bg-background min-h-screen">
      <div className="container max-w-[1328px] w-full mx-auto py-8 px-4">
        <AdminNavigation
          title="Payment Settings"
          description="Configure bank details and WhatsApp settings for manual payment processing"
        />

        <Card className={adminCardClassName}>
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
            <CardDescription>
              Set up your bank account details and WhatsApp confirmation settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Bank Details</h3>
                  
                  <div className={adminFieldGroupClassName}>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder="e.g., Bank Central Asia (BCA)"
                      className={adminFieldClassName}
                      required
                    />
                  </div>

                  <div className={adminFieldGroupClassName}>
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                      placeholder="e.g., 1234567890"
                      className={adminFieldClassName}
                      required
                    />
                  </div>

                  <div className={adminFieldGroupClassName}>
                    <Label htmlFor="bankAccountName">Account Name</Label>
                    <Input
                      id="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={(e) => handleInputChange('bankAccountName', e.target.value)}
                      placeholder="e.g., Vidiopintar Indonesia"
                      className={adminFieldClassName}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Configuration</h3>
                  
                  <div className={adminFieldGroupClassName}>
                    <Label htmlFor="whatsappPhoneNumber">Phone Number</Label>
                    <Input
                      id="whatsappPhoneNumber"
                      value={formData.whatsappPhoneNumber}
                      onChange={(e) => handleInputChange('whatsappPhoneNumber', e.target.value)}
                      placeholder="e.g., 6281234567890 (with country code, no +)"
                      className={adminFieldClassName}
                      required
                    />
                  </div>

                  <div className={adminFieldGroupClassName}>
                    <Label htmlFor="whatsappMessageTemplate">Message Template</Label>
                    <Textarea
                      id="whatsappMessageTemplate"
                      value={formData.whatsappMessageTemplate}
                      onChange={(e) => handleInputChange('whatsappMessageTemplate', e.target.value)}
                      placeholder="Halo, saya sudah melakukan transfer untuk {planName} sebesar {planPrice}. Mohon konfirmasi pembayaran saya."
                      rows={4}
                      className={adminTextareaClassName}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Use{' '}
                      <code className="rounded-xs bg-muted px-1 py-0.5 text-xs text-foreground">{'{planName}'}</code>
                      {' '}and{' '}
                      <code className="rounded-xs bg-muted px-1 py-0.5 text-xs text-foreground">{'{planPrice}'}</code>
                      {' '}as placeholders for dynamic content
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-border pt-4">
                <Button type="submit" disabled={saving} className="rounded-xs">
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
                
                {settings && (
                  <Button type="button" variant="outline" onClick={refetch} className="rounded-xs dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {settings && (
          <Card className={`mt-6 ${adminCardClassName}`}>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Preview how the payment page will look with these settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 rounded-xs border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                    <p className="font-medium">{formData.bankName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                    <p className="font-mono">{formData.bankAccountNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Name</p>
                    <p className="font-medium">{formData.bankAccountName}</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Message (Monthly Plan Example)</p>
                    <p className="mt-1 rounded-xs border border-border bg-background p-3 text-sm text-foreground">
                      {formData.whatsappMessageTemplate
                        .replace('{planName}', 'Monthly Plan')
                        .replace('{planPrice}', 'IDR 50,000')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}