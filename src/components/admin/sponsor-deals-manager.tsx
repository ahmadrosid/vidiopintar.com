'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Upload, Download, Filter, ToggleLeft, ToggleRight, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SponsorDeal {
  id: string;
  dealName: string;
  grantedAt: string;
  expiresAt: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userName: string;
  isExpired: boolean;
  daysUntilExpiry: number;
}

interface CsvValidationResult {
  rows: any[];
  validRows: any[];
  invalidRows: any[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

interface UploadResult {
  success: boolean;
  message: string;
  result: CsvValidationResult;
  insertedDeals?: number;
}

export function SponsorDealsManager() {
  const [deals, setDeals] = useState<SponsorDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterActive !== 'all') {
        params.set('isActive', filterActive);
      }
      if (searchTerm) {
        params.set('dealName', searchTerm);
      }

      const response = await fetch(`/api/admin/sponsor-deals?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setDeals(data.deals);
      } else {
        toast.error(data.error || 'Failed to load sponsor deals');
      }
    } catch (error) {
      toast.error('Error loading sponsor deals');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterActive]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/sponsor-deals/upload', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResult = await response.json();
      setUploadResult(result);

      if (result.success) {
        toast.success(result.message);
        loadDeals(); // Reload the deals list
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Error uploading file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleDeal = async (dealId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/sponsor-deals/${dealId}/toggle`, {
        method: 'PUT',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        loadDeals(); // Reload the deals list
      } else {
        toast.error(result.error || 'Failed to toggle deal');
      }
    } catch (error) {
      toast.error('Error toggling deal');
    }
  };

  const deleteDeal = async (dealId: string) => {
    try {
      const response = await fetch(`/api/admin/sponsor-deals/${dealId}/toggle`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        loadDeals(); // Reload the deals list
      } else {
        toast.error(result.error || 'Failed to delete deal');
      }
    } catch (error) {
      toast.error('Error deleting deal');
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = 'email,dealName,durationDays\nuser@example.com,Premium Access,30\nuser2@example.com,Extended Trial,60';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sponsor-deals-sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDealStatus = (deal: SponsorDeal) => {
    if (!deal.isActive) return { label: 'Inactive', variant: 'secondary' as const };
    if (deal.isExpired) return { label: 'Expired', variant: 'destructive' as const };
    return { label: 'Active', variant: 'default' as const };
  };

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Sponsor Deals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="csv-upload">CSV File</Label>
              <Input
                id="csv-upload"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Expected format: email, dealName, durationDays
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleCsv}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Sample CSV
              </Button>
            </div>
          </div>

          {uploading && (
            <div className="text-sm text-muted-foreground">Uploading...</div>
          )}

          {uploadResult && (
            <div className="space-y-2">
              <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">{uploadResult.message}</span>
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <div>Total rows: {uploadResult.result.summary.total}</div>
                <div>Valid rows: {uploadResult.result.summary.valid}</div>
                <div>Invalid rows: {uploadResult.result.summary.invalid}</div>
                {uploadResult.insertedDeals && (
                  <div>Deals created: {uploadResult.insertedDeals}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Manage Sponsor Deals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Deal Name</Label>
              <Input
                id="search"
                placeholder="Search by deal name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter">Status Filter</Label>
              <select
                id="filter"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <Button onClick={loadDeals} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deals List */}
      <Card className="shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Deal Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Granted</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Expires</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const status = getDealStatus(deal);
                  return (
                    <tr key={deal.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{deal.userName || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{deal.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{deal.dealName}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(deal.grantedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{formatDate(deal.expiresAt)}</div>
                        {!deal.isExpired && deal.daysUntilExpiry > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {deal.daysUntilExpiry} days remaining
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDeal(deal.id, deal.isActive)}
                            className="p-1"
                          >
                            {deal.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-1 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Sponsor Deal</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this sponsor deal for {deal.userEmail}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteDeal(deal.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {deals.length === 0 && !loading && (
              <div className="p-8 text-center text-muted-foreground">
                No sponsor deals found. Upload a CSV file to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}