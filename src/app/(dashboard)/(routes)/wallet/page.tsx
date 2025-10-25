"use client";

/**
 * WALLET DASHBOARD
 *
 * Student/Instructor digital wallet interface:
 * - Balance display (available, pending, lifetime)
 * - Deposit/withdrawal controls
 * - Transaction history
 * - Analytics charts
 * - Quick actions
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  Clock,
  Download,
} from "lucide-react";

// Import wallet functions
import {
  getWalletBalance,
  getTransactionHistory,
  depositToWallet,
  withdrawFromWallet,
  getWalletAnalytics,
  type Transaction,
  type Currency,
} from "@/lib/marketplace/wallet-system";

export default function WalletDashboard() {
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    lifetime: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    transactionCount: 0,
    avgTransactionAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  const walletId = "wallet_user_123"; // TODO: Get from user session
  const currency: Currency = "USD";

  useEffect(() => {
    loadWalletData();
  }, []);

  async function loadWalletData() {
    try {
      setLoading(true);

      const [balanceData, transactionData, analyticsData] = await Promise.all([
        getWalletBalance(walletId, currency),
        getTransactionHistory(walletId, 50),
        getWalletAnalytics(walletId),
      ]);

      setBalance(balanceData);
      setTransactions(transactionData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit(amount: number) {
    try {
      await depositToWallet({
        walletId,
        amount,
        currency,
        paymentMethodId: "pm_card_123", // TODO: Payment method selector
      });
      await loadWalletData();
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  }

  async function handleWithdraw(amount: number) {
    try {
      await withdrawFromWallet({
        walletId,
        amount,
        currency,
        bankAccountId: "ba_123", // TODO: Bank account selector
      });
      await loadWalletData();
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">💰 Dynasty Wallet</h1>
          <p className="text-muted-foreground">
            Manage your earnings and purchases
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Statement
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${balance.available.toFixed(2)}
            </div>
            <p className="text-xs text-purple-100 mt-1">
              Ready to spend or withdraw
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${balance.pending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Processing transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Lifetime Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${balance.lifetime.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <DepositForm onDeposit={handleDeposit} />
          <WithdrawForm onWithdraw={handleWithdraw} />
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Your financial overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                +${analytics.totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                -${analytics.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Net Income</p>
              <p className="text-2xl font-bold">
                ${analytics.netIncome.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{analytics.transactionCount}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Avg. Amount</p>
              <p className="text-2xl font-bold">
                ${analytics.avgTransactionAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent activity on your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2 mt-4">
              {transactions.map((txn) => (
                <TransactionRow key={txn.id} transaction={txn} />
              ))}
            </TabsContent>

            <TabsContent value="income" className="space-y-2 mt-4">
              {transactions
                .filter((t) => t.amount > 0)
                .map((txn) => (
                  <TransactionRow key={txn.id} transaction={txn} />
                ))}
            </TabsContent>

            <TabsContent value="expenses" className="space-y-2 mt-4">
              {transactions
                .filter((t) => t.amount < 0)
                .map((txn) => (
                  <TransactionRow key={txn.id} transaction={txn} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-full ${
            isIncome ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isIncome ? (
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div>
          <p className="font-medium">
            {transaction.metadata.description || "Transaction"}
          </p>
          <p className="text-sm text-muted-foreground">
            {transaction.createdAt.toLocaleDateString()} at{" "}
            {transaction.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-bold ${
            isIncome ? "text-green-600" : "text-red-600"
          }`}
        >
          {isIncome ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
        </p>
        <Badge
          variant={transaction.status === "completed" ? "default" : "secondary"}
        >
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
}

function DepositForm({ onDeposit }: { onDeposit: (amount: number) => void }) {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (value > 0) {
      onDeposit(value);
      setAmount("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
      <Input
        type="number"
        placeholder="Amount to deposit"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="1"
        step="0.01"
      />
      <Button type="submit" className="bg-green-600 hover:bg-green-700">
        <ArrowDownLeft className="mr-2 h-4 w-4" />
        Deposit
      </Button>
    </form>
  );
}

function WithdrawForm({
  onWithdraw,
}: {
  onWithdraw: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (value > 0) {
      onWithdraw(value);
      setAmount("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
      <Input
        type="number"
        placeholder="Amount to withdraw"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="1"
        step="0.01"
      />
      <Button type="submit" variant="outline">
        <ArrowUpRight className="mr-2 h-4 w-4" />
        Withdraw
      </Button>
    </form>
  );
}
