'use client';

import React, { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, Text, View, Typography, Dialog } from '@sous/ui';
import { Search, Bell, Settings, Plus, Info, Type, AppWindow } from 'lucide-react';

export const ComponentPlayground: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [btnVariant, setBtnVariant] = useState<'default' | 'outline' | 'ghost'>('default');
  
  const ViewAny = View as any;
  const TextAny = Text as any;

  return (
    <div className="p-12 space-y-16 max-w-6xl mx-auto pb-40">
      {/* Introduction */}
      <div className="space-y-4">
        <Typography variant="h1">ATOMIC<span className="text-emerald-500">.PLAYGROUND</span></Typography>
        <Typography variant="lead">
          Standardized universal components built with React Native Web and NativeWind v4. 
          Designed for absolute parity between web, mobile, and signage.
        </Typography>
      </div>

      {/* Typography */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Type size={20} className="text-purple-500" />
          </div>
          <Typography variant="h3" className="uppercase tracking-tight">Typography</Typography>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 space-y-6">
          <Typography variant="h1">Heading 1 (Brand Black)</Typography>
          <Typography variant="h2">Heading 2 (Section Border)</Typography>
          <Typography variant="h3">Heading 3 (Sub-section)</Typography>
          <Typography variant="h4">Heading 4 (Minor Title)</Typography>
          <Typography variant="p">
            This is a standard paragraph. It has a comfortable leading and uses the standard zinc-400 color 
            for readability in dark mode environments. It also supports spacing between siblings.
          </Typography>
          <div className="flex flex-col space-y-2">
            <Typography variant="large">Large Text (Bold)</Typography>
            <Typography variant="small">Small Text (Meta)</Typography>
            <Typography variant="muted">Muted Text (Secondary info)</Typography>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Plus size={20} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tight">Buttons</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 space-y-8">
            <div className="flex flex-wrap gap-4">
              <Button label="Primary Button" variant="default" />
              <Button label="Secondary" variant="secondary" />
              <Button label="Outline" variant="outline" />
              <Button label="Ghost" variant="ghost" />
              <Button label="Destructive" variant="destructive" />
            </div>
            <div className="flex items-center space-x-4">
              <Button size="sm" label="Small" />
              <Button size="default" label="Default" />
              <Button size="lg" label="Large / High Visibility" />
            </div>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 flex items-center justify-center">
             <Button className="w-full max-w-xs" label="Full Width Fluid Button" />
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
            <Search size={20} className="text-sky-500" />
          </div>
          <h2 className="text-2xl font-brand font-black text-white uppercase tracking-tight">Forms & Inputs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 space-y-6">
            <Input label="Email Address" placeholder="chef@sous.tools" />
            <Input label="Password" placeholder="••••••••" secureTextEntry />
            <Input label="Search Inventory" placeholder="Start typing..." />
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 space-y-6">
            <Input label="Error State" value="Invalid input" error="This field is required for HACCP compliance" />
            <Input label="Disabled State" placeholder="Cannot edit this" editable={false} selectTextOnFocus={false} />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Layout size={20} className="text-purple-500" />
          </div>
          <Typography variant="h3" className="uppercase tracking-tight">Containment</Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <TextAny className="text-zinc-500 text-sm">Real-time infrastructure monitoring.</TextAny>
            </CardHeader>
            <CardContent>
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <TextAny className="text-zinc-400 text-xs font-bold uppercase">Database</TextAny>
                  <TextAny className="text-emerald-500 text-xs font-bold">ACTIVE</TextAny>
                </div>
                <div className="flex items-center justify-between">
                  <TextAny className="text-zinc-400 text-xs font-bold uppercase">Redis Cache</TextAny>
                  <TextAny className="text-emerald-500 text-xs font-bold">ACTIVE</TextAny>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" label="View Metrics" />
            </CardFooter>
          </Card>

          <Card className="border-sky-500/20 bg-sky-500/5">
            <CardHeader>
              <div className="flex items-center space-x-2 text-sky-500 mb-2">
                <Bell size={16} />
                <TextAny className="text-[10px] font-black uppercase tracking-widest">Notification</TextAny>
              </div>
              <CardTitle>Inventory Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <TextAny className="text-zinc-400 leading-relaxed">
                Stock level for <TextAny className="text-white font-bold">"Butter (Unsalted)"</TextAny> is below critical threshold.
              </TextAny>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-sky-500" label="Reorder Now" />
            </CardFooter>
          </Card>

          <Card className="border-zinc-800/20 bg-zinc-900/10">
            <CardHeader>
              <CardTitle>Quick Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950 flex items-center justify-between border border-zinc-800">
                <TextAny className="text-zinc-300 text-sm">Auto-Scale Recipes</TextAny>
                <div className="w-8 h-4 bg-emerald-500 rounded-full" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950 flex items-center justify-between border border-zinc-800">
                <TextAny className="text-zinc-300 text-sm">Dark Mode</TextAny>
                <div className="w-8 h-4 bg-zinc-800 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Overlays */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <AppWindow size={20} className="text-orange-500" />
          </div>
          <Typography variant="h3" className="uppercase tracking-tight">Overlays</Typography>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 flex items-center space-x-4">
          <Button label="Open Dialog" onPress={() => setIsDialogOpen(true)} />
          <Dialog 
            open={isDialogOpen} 
            onOpenChange={setIsDialogOpen}
            title="Update Confirmation"
            description="Are you sure you want to commit these changes to the production ledger?"
          >
            <div className="space-y-6">
              <Typography variant="p">
                This action cannot be undone. All theoretical stock levels will be recalculated based on the new recipe weights.
              </Typography>
              <div className="flex flex-row space-x-3 justify-end mt-8">
                <Button variant="outline" label="Cancel" onPress={() => setIsDialogOpen(false)} />
                <Button label="Confirm Update" onPress={() => setIsDialogOpen(false)} />
              </div>
            </div>
          </Dialog>
        </div>
      </section>

      {/* Info Box */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex items-start space-x-6">
        <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Info size={24} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-brand font-black text-white uppercase tracking-tight">Universal Design Token</h3>
          <p className="text-zinc-400 leading-relaxed max-w-3xl">
            These components use standardized OKLCH color tokens and custom shadows defined in our brand system. 
            They automatically adjust spacing and touch targets when running on physical Android/iOS hardware vs web browsers.
          </p>
        </div>
      </div>
    </div>
  );
};
