'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function SetupGuide() {
  const [copied, setCopied] = useState(false);

  const mongodbUri = process.env.NEXT_PUBLIC_MONGODB_SETUP || 'mongodb+srv://[username]:[password]@cluster0.xxxxx.mongodb.net/cimara_inventory';

  const copyToClipboard = () => {
    navigator.clipboard.writeText('MONGODB_URI=' + mongodbUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-primary">CIMARA Setup Required</h1>
            <p className="text-muted-foreground">Complete these steps to start using the Inventory Management System</p>
          </div>

          {/* Error Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>MongoDB Not Connected</AlertTitle>
            <AlertDescription>
              Your MongoDB database is not configured. Follow the steps below to set it up in 5 minutes.
            </AlertDescription>
          </Alert>

          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                Create MongoDB Atlas Account
              </CardTitle>
              <CardDescription>Free database hosting service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Go to <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer" className="text-primary underline">mongodb.com/cloud/atlas</a></li>
                <li>Click "Try Free" and create an account</li>
                <li>Create an organization and project</li>
                <li>Select "M0 Free" tier when creating a cluster</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                Get Your Connection String
              </CardTitle>
              <CardDescription>Copy the MongoDB URI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>In MongoDB Atlas, go to "Clusters" page</li>
                <li>Click "Connect" on your cluster</li>
                <li>Select "Drivers" → "Node.js"</li>
                <li>Copy the connection string (starts with <code className="bg-muted px-2 py-1 rounded text-xs">mongodb+srv://</code>)</li>
                <li>Replace {"<username>"} and {"<password>"} with your credentials</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                Add to Environment Variables
              </CardTitle>
              <CardDescription>Configure the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Create or edit <code className="bg-muted px-2 py-1 rounded text-xs">.env.local</code> file in your project root:</p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>
                  MONGODB_URI=mongodb+srv://[username]:[password]@cluster0.xxxxx.mongodb.net/cimara_inventory
                </code>
              </div>
              <Button onClick={copyToClipboard} variant="outline" className="w-full gap-2 bg-transparent">
                <Copy className="h-4 w-4" />
                {copied ? 'Copied to clipboard!' : 'Copy template to clipboard'}
              </Button>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
                Restart the Application
              </CardTitle>
              <CardDescription>Apply the configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Stop the development server (Ctrl+C)</li>
                <li>Run <code className="bg-muted px-2 py-1 rounded text-xs">npm run dev</code></li>
                <li>Refresh your browser</li>
                <li>You should now see the CIMARA dashboard!</li>
              </ol>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                See <code className="bg-muted px-2 py-1 rounded text-xs">MONGODB_SETUP_QUICK.md</code> for detailed troubleshooting and FAQs.
              </p>
              <div className="space-y-2">
                <p className="font-semibold">Common issues:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Invalid connection string - verify username and password</li>
                  <li>IP whitelist - add 0.0.0.0/0 in MongoDB Atlas security settings</li>
                  <li>Database name - ensure database name matches in Atlas</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Success message */}
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Ready to Go!</AlertTitle>
            <AlertDescription className="text-green-800">
              Once you complete these steps, the Inventory Management System will be fully operational.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </main>
  );
}
