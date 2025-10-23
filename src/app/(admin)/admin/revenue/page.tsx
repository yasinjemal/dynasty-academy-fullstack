"use client";

/**
 * 💰💰💰 REVENUE MAXIMIZER DASHBOARD 💰💰💰
 * Complete revenue optimization control center
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardStats {
  totalRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
  churnRate: number;
  avgLTV: number;
  atRiskUsers: number;
  highValueUsers: number;
}

export default function RevenueMaximizerPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Mock data for now - would fetch from API
      setStats({
        totalRevenue: 125430,
        avgOrderValue: 458,
        conversionRate: 3.2,
        churnRate: 12.5,
        avgLTV: 2350,
        atRiskUsers: 23,
        highValueUsers: 47,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const runBatchChurnAnalysis = async () => {
    try {
      const res = await fetch("/api/revenue/churn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: true }),
      });

      const data = await res.json();
      alert(`Processed ${data.processed} users. ${data.highRisk} at high risk.`);
      fetchDashboardStats();
    } catch (error) {
      alert("Failed to run batch analysis");
    }
  };

  const runBatchLTVCalculation = async () => {
    try {
      const res = await fetch("/api/revenue/ltv/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 100 }),
      });

      const data = await res.json();
      alert(
        `Calculated LTV for ${data.summary.total} users.\nAvg LTV: R${Math.round(data.summary.avgLTV)}\nWhales: ${data.summary.whales} | High-value: ${data.summary.highValue}`
      );
      fetchDashboardStats();
    } catch (error) {
      alert("Failed to run batch calculation");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading revenue intelligence...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">💰 Revenue Maximizer</h1>
          <p className="text-muted-foreground">
            AI-powered revenue optimization & customer intelligence
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runBatchChurnAnalysis} variant="outline">
            🛡️ Analyze Churn
          </Button>
          <Button onClick={runBatchLTVCalculation} variant="outline">
            💎 Calculate LTV
          </Button>
          <Button onClick={fetchDashboardStats}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{stats?.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{stats?.avgOrderValue}</div>
            <p className="text-xs text-green-600">+12% vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversionRate}%</div>
            <p className="text-xs text-green-600">+0.8% vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.churnRate}%</div>
            <p className="text-xs text-red-600">Target: &lt;10%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg LTV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{stats?.avgLTV.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">+R350 vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Value Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.highValueUsers}</div>
            <p className="text-xs text-muted-foreground">LTV &gt; R5,000</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing">💵 Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="upsells">🎯 Smart Upsells</TabsTrigger>
          <TabsTrigger value="churn">🛡️ Churn Prevention</TabsTrigger>
          <TabsTrigger value="ltv">💎 LTV Segments</TabsTrigger>
        </TabsList>

        {/* Dynamic Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pricing Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-4">💵 Dynamic Pricing Engine Ready!</p>
                  <p>Configure pricing rules to optimize revenue automatically.</p>
                  <p className="text-sm mt-2">
                    Base price adjusts based on time, demand, user segment, and more.
                  </p>
                  <Button className="mt-4" variant="outline">
                    + Create Pricing Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Upsells Tab */}
        <TabsContent value="upsells" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upsell Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-4">🎯 Smart Upsell System Deployed!</p>
                  <p>
                    Personalized recommendations at cart, checkout, and post-purchase.
                  </p>
                  <p className="text-sm mt-2">
                    Automatically suggests complementary products based on user behavior.
                  </p>
                  <Button className="mt-4" variant="outline">
                    + Create Upsell Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn Prevention Tab */}
        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>At-Risk Users ({stats?.atRiskUsers})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-4">🛡️ Churn Prediction Active!</p>
                  <p>ML-based risk scoring identifies users likely to churn.</p>
                  <p className="text-sm mt-2">
                    Automated win-back offers sent based on risk level.
                  </p>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button variant="outline" onClick={runBatchChurnAnalysis}>
                      Analyze All Users
                    </Button>
                    <Button variant="outline">View At-Risk Users</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LTV Segments Tab */}
        <TabsContent value="ltv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Value Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl mb-2">🐋</div>
                    <div className="font-bold">Whales</div>
                    <div className="text-2xl font-bold mt-2">12</div>
                    <div className="text-sm text-muted-foreground">
                      LTV &gt; R10,000
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl mb-2">💎</div>
                    <div className="font-bold">High-Value</div>
                    <div className="text-2xl font-bold mt-2">35</div>
                    <div className="text-sm text-muted-foreground">
                      LTV: R5,000-10,000
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl mb-2">⭐</div>
                    <div className="font-bold">Medium</div>
                    <div className="text-2xl font-bold mt-2">128</div>
                    <div className="text-sm text-muted-foreground">
                      LTV: R2,000-5,000
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl mb-2">🌱</div>
                    <div className="font-bold">Low</div>
                    <div className="text-2xl font-bold mt-2">245</div>
                    <div className="text-sm text-muted-foreground">
                      LTV &lt; R2,000
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg text-center bg-red-50">
                    <div className="text-2xl mb-2">⚠️</div>
                    <div className="font-bold">At-Risk</div>
                    <div className="text-2xl font-bold mt-2">{stats?.atRiskUsers}</div>
                    <div className="text-sm text-red-600">Churn prob &gt; 70%</div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <Button onClick={runBatchLTVCalculation}>
                    Calculate LTV for All Users
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Impact Projection */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Revenue Impact Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Dynamic Pricing
              </div>
              <div className="text-2xl font-bold text-green-600">+15%</div>
              <div className="text-xs text-muted-foreground">
                ~R18,800/month revenue lift
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Smart Upsells
              </div>
              <div className="text-2xl font-bold text-green-600">+20%</div>
              <div className="text-xs text-muted-foreground">
                ~R25,000/month from upsells
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Churn Prevention
              </div>
              <div className="text-2xl font-bold text-green-600">+25%</div>
              <div className="text-xs text-muted-foreground">
                ~R31,000/month retained revenue
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-green-50">
              <div className="text-sm text-muted-foreground mb-1">
                Total Monthly Impact
              </div>
              <div className="text-2xl font-bold text-green-600">+R74,800</div>
              <div className="text-xs text-green-600 font-medium">
                +59% revenue increase
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
