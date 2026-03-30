'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/admin/page-header';
import { api } from '@/lib/api';
import { PlatformSettings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    platformFeePercent: 20,
    minBookingHours: 1,
    maxBookingHours: 8,
    companionMinAge: 18,
    seekerMinAge: 18,
    supportEmail: 'support@daterabbit.com',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSettings()
      .then(setSettings)
      .catch(() => {
        // Settings not available, use defaults
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof PlatformSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Platform configuration" />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Settings saved successfully.
        </div>
      )}

      {/* Fees */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Fees</CardTitle>
          <CardDescription>Configure how the platform earns revenue from bookings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform-fee">Platform Fee (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="platform-fee"
                type="number"
                min={0}
                max={100}
                value={settings.platformFeePercent}
                onChange={(e) => handleChange('platformFeePercent', parseFloat(e.target.value) || 0)}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">% of booking total</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Current setting: {settings.platformFeePercent}% platform fee, {100 - settings.platformFeePercent}% companion earnings
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Booking limits */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Limits</CardTitle>
          <CardDescription>Control minimum and maximum booking durations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-hours">Minimum Hours</Label>
              <Input
                id="min-hours"
                type="number"
                min={1}
                max={24}
                value={settings.minBookingHours}
                onChange={(e) => handleChange('minBookingHours', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-hours">Maximum Hours</Label>
              <Input
                id="max-hours"
                type="number"
                min={1}
                max={24}
                value={settings.maxBookingHours}
                onChange={(e) => handleChange('maxBookingHours', parseInt(e.target.value) || 8)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Age requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Age Requirements</CardTitle>
          <CardDescription>Set minimum age for different user roles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companion-age">Companion Minimum Age</Label>
              <Input
                id="companion-age"
                type="number"
                min={18}
                max={99}
                value={settings.companionMinAge}
                onChange={(e) => handleChange('companionMinAge', parseInt(e.target.value) || 18)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seeker-age">Seeker Minimum Age</Label>
              <Input
                id="seeker-age"
                type="number"
                min={18}
                max={99}
                value={settings.seekerMinAge}
                onChange={(e) => handleChange('seekerMinAge', parseInt(e.target.value) || 18)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Support contact information shown to users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input
              id="support-email"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-rose-500 hover:bg-rose-600"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
