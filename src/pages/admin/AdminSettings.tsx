import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ExternalLink, Database, Shield, Bell } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your research platform.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* General Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">General</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Show Research Disclaimer</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Display a research notice in the checkout and footer
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Enable Analytics Tracking</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Track user behavior for viability scoring
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Data Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Data & Storage</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect to Lovable Cloud to persist analytics data and enable real-time tracking across sessions.
            </p>
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Connect Cloud Storage
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Scale Alerts</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Notify when a product reaches "Scale" status
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Weekly Report</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive weekly summary of product performance
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Documentation */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <ExternalLink className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Resources</h2>
          </div>
          <div className="space-y-3">
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Viability Score Methodology
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Best Practices for Product Testing
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              API Documentation
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
