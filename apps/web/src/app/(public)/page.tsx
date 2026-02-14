import Link from 'next/link';
import { ArrowRight, ChefHat, Check, Zap, Smartphone, HardDrive, BarChart3 } from 'lucide-react';
import { Button, Badge, View, Text } from '@sous/ui';
import { config } from '@sous/config';

async function getPlans() {
  try {
    const res = await fetch(`${config.api.url}/billing/plans`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function LandingPage() {
  const plans = await getPlans();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge variant="outline" className="px-4 py-1 text-sm bg-background/50 backdrop-blur border-primary/20 text-primary">
              v0.1.0 Release Candidate
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl mx-auto">
              The Operating System for the <span className="text-primary">Physical World</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl">
              Connect every screen, sensor, and station in your kitchen. 
              Automate costing, inventory, and procurement with AI-driven intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 min-w-[300px]">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-12">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-12">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ChefHat className="h-8 w-8 text-primary" />}
              title="Culinary Intelligence"
              description="AI-powered recipe ingestion from Google Drive. Real-time dynamic costing and smart scaling."
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-yellow-500" />}
              title="Zero-Config Edge"
              description="Hardware nodes discover each other automatically via mDNS. No IT guy required."
            />
            <FeatureCard 
              icon={<Smartphone className="h-8 w-8 text-blue-500" />}
              title="Unified Experience"
              description="One codebase running on Web, iOS, Android, and Kiosk hardware. Seamless state sync."
            />
            <FeatureCard 
              icon={<HardDrive className="h-8 w-8 text-green-500" />}
              title="Inventory Automation"
              description="Par-level monitoring with automated low-stock email alerts and vendor integration."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-purple-500" />}
              title="Financial Ledger"
              description="Immutable record of every transaction. Integrated with Square, Toast, and Stripe."
            />
            <FeatureCard 
              icon={<Check className="h-8 w-8 text-orange-500" />}
              title="Developer First"
              description="Built on NestJS, Next.js 16, and Capacitor. Fully typed, documented, and extensible."
            />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24" id="pricing">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-12">Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.length > 0 ? (
              plans.map((plan: any) => (
                <PricingCard 
                  key={plan.id}
                  title={plan.name.replace(' Monthly', '')} 
                  price={`$${(plan.priceMonthly / 100).toFixed(0)}`} 
                  description={getPlanDescription(plan.slug)}
                  recommended={plan.slug === 'chef-de-partie-monthly'}
                />
              ))
            ) : (
              <>
                <PricingCard title="Commis" price="$59" description="For food trucks & pop-ups." />
                <PricingCard title="Chef de Partie" price="$149" description="For busy independent cafes." recommended />
                <PricingCard title="Executive Chef" price="$399" description="For enterprise groups." />
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t bg-muted/10">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 Sous Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function getPlanDescription(slug: string) {
  if (slug.startsWith('commis')) return "For food trucks & pop-ups.";
  if (slug.startsWith('chef-de-partie')) return "For busy independent cafes.";
  if (slug.startsWith('executive-chef')) return "For enterprise groups.";
  return "Custom plan.";
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col p-6 bg-background rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({ title, price, description, recommended }: { title: string, price: string, description: string, recommended?: boolean }) {
  return (
    <div className={`flex flex-col p-8 rounded-xl border ${recommended ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'bg-background shadow-sm'}`}>
      <h3 className="text-lg font-bold uppercase tracking-widest text-muted-foreground mb-2">{title}</h3>
      <div className="text-4xl font-black mb-4">{price}<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
      <p className="text-sm text-muted-foreground mb-8">{description}</p>
      <Link href="/register" className="w-full">
        <Button variant={recommended ? 'default' : 'outline'} className="w-full">Choose Plan</Button>
      </Link>
    </div>
  );
}
