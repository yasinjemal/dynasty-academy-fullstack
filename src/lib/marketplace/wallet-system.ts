/**
 * DYNASTY WALLET SYSTEM
 *
 * Digital wallet for students and instructors:
 * - Students: Credits, purchases, refunds, gift cards
 * - Instructors: Earnings, withdrawals, royalties
 * - Platform: Transaction fees, escrow, payouts
 *
 * Features:
 * - Multi-currency support (USD, EUR, cryptocurrency)
 * - Instant transfers between users
 * - Automated royalty distribution
 * - Escrow for pending transactions
 * - Transaction history & receipts
 */

import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/security/audit-logger";

export type WalletType = "student" | "instructor" | "platform";
export type TransactionType =
  | "deposit" // Add money to wallet
  | "withdrawal" // Cash out
  | "purchase" // Buy course/product
  | "refund" // Return money
  | "royalty" // Instructor earnings
  | "transfer" // User-to-user
  | "gift" // Gift card
  | "escrow_hold" // Temporary hold
  | "escrow_release" // Release held funds
  | "platform_fee"; // Platform commission

export type Currency = "USD" | "EUR" | "GBP" | "BTC" | "ETH";

export interface Wallet {
  id: string;
  userId: string;
  type: WalletType;
  balances: {
    currency: Currency;
    available: number; // Available for use
    pending: number; // Pending/escrow
    lifetime: number; // Total earned (instructors only)
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  status: "pending" | "completed" | "failed" | "cancelled";
  fromWalletId?: string;
  toWalletId?: string;
  metadata: {
    productId?: string;
    productType?: "course" | "book" | "pdf" | "audio" | "subscription";
    description?: string;
    receiptUrl?: string;
    invoiceNumber?: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Create wallet for new user
 */
export async function createWallet(params: {
  userId: string;
  type: WalletType;
}): Promise<Wallet> {
  const { userId, type } = params;

  const wallet: Wallet = {
    id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    balances: [{ currency: "USD", available: 0, pending: 0, lifetime: 0 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // TODO: Store in database
  // await prisma.wallet.create({ data: wallet });

  await createAuditLog({
    action: "WALLET_CREATED",
    userId,
    severity: "info",
    metadata: { after: { walletId: wallet.id, type } },
  });

  return wallet;
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(
  walletId: string,
  currency: Currency = "USD"
): Promise<{ available: number; pending: number; lifetime: number }> {
  // TODO: Query from database
  // For now, return mock data
  return {
    available: 150.0,
    pending: 25.5,
    lifetime: 5420.0,
  };
}

/**
 * Deposit money into wallet
 */
export async function depositToWallet(params: {
  walletId: string;
  amount: number;
  currency: Currency;
  paymentMethodId: string;
}): Promise<Transaction> {
  const { walletId, amount, currency, paymentMethodId } = params;

  // Validate amount
  if (amount <= 0) {
    throw new Error("Deposit amount must be positive");
  }

  // Process payment via Stripe
  const paymentIntent = await processPayment({
    amount,
    currency,
    paymentMethodId,
  });

  if (!paymentIntent.success) {
    throw new Error("Payment failed");
  }

  // Create transaction
  const transaction: Transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    walletId,
    type: "deposit",
    amount,
    currency,
    status: "completed",
    metadata: {
      description: `Deposit via ${paymentMethodId}`,
      receiptUrl: paymentIntent.receiptUrl,
    },
    createdAt: new Date(),
    completedAt: new Date(),
  };

  // Update wallet balance
  await updateWalletBalance(walletId, currency, amount, "add");

  // TODO: Store transaction in database
  // await prisma.transaction.create({ data: transaction });

  await createAuditLog({
    action: "WALLET_DEPOSIT",
    severity: "info",
    metadata: { after: { walletId, amount, currency } },
  });

  return transaction;
}

/**
 * Withdraw money from wallet
 */
export async function withdrawFromWallet(params: {
  walletId: string;
  amount: number;
  currency: Currency;
  bankAccountId: string;
}): Promise<Transaction> {
  const { walletId, amount, currency, bankAccountId } = params;

  // Validate amount
  if (amount <= 0) {
    throw new Error("Withdrawal amount must be positive");
  }

  // Check balance
  const balance = await getWalletBalance(walletId, currency);
  if (balance.available < amount) {
    throw new Error("Insufficient funds");
  }

  // Process withdrawal via Stripe
  const payout = await processPayout({
    amount,
    currency,
    bankAccountId,
  });

  if (!payout.success) {
    throw new Error("Withdrawal failed");
  }

  // Create transaction
  const transaction: Transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    walletId,
    type: "withdrawal",
    amount: -amount, // Negative for withdrawal
    currency,
    status: "completed",
    metadata: {
      description: `Withdrawal to ${bankAccountId}`,
    },
    createdAt: new Date(),
    completedAt: new Date(),
  };

  // Update wallet balance
  await updateWalletBalance(walletId, currency, amount, "subtract");

  await createAuditLog({
    action: "WALLET_WITHDRAWAL",
    severity: "info",
    metadata: { after: { walletId, amount, currency } },
  });

  return transaction;
}

/**
 * Purchase product using wallet
 */
export async function purchaseWithWallet(params: {
  buyerWalletId: string;
  sellerWalletId: string;
  amount: number;
  currency: Currency;
  productId: string;
  productType: Transaction["metadata"]["productType"];
}): Promise<{
  buyerTxn: Transaction;
  sellerTxn: Transaction;
  platformTxn: Transaction;
}> {
  const {
    buyerWalletId,
    sellerWalletId,
    amount,
    currency,
    productId,
    productType,
  } = params;

  // Check buyer balance
  const buyerBalance = await getWalletBalance(buyerWalletId, currency);
  if (buyerBalance.available < amount) {
    throw new Error("Insufficient funds");
  }

  // Calculate platform fee (5-50% based on seller's trust score)
  const sellerTrustScore = await getSellerTrustScore(sellerWalletId);
  const platformFeeRate = calculatePlatformFee(sellerTrustScore);
  const platformFee = amount * platformFeeRate;
  const sellerAmount = amount - platformFee;

  // Create buyer transaction (debit)
  const buyerTxn: Transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    walletId: buyerWalletId,
    type: "purchase",
    amount: -amount,
    currency,
    status: "completed",
    toWalletId: sellerWalletId,
    metadata: {
      productId,
      productType,
      description: `Purchase: ${productType} #${productId}`,
    },
    createdAt: new Date(),
    completedAt: new Date(),
  };

  // Create seller transaction (credit)
  const sellerTxn: Transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    walletId: sellerWalletId,
    type: "royalty",
    amount: sellerAmount,
    currency,
    status: "completed",
    fromWalletId: buyerWalletId,
    metadata: {
      productId,
      productType,
      description: `Sale: ${productType} #${productId}`,
    },
    createdAt: new Date(),
    completedAt: new Date(),
  };

  // Create platform fee transaction
  const platformWalletId = "platform_wallet";
  const platformTxn: Transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    walletId: platformWalletId,
    type: "platform_fee",
    amount: platformFee,
    currency,
    status: "completed",
    metadata: {
      productId,
      productType,
      description: `Platform fee (${(platformFeeRate * 100).toFixed(1)}%)`,
    },
    createdAt: new Date(),
    completedAt: new Date(),
  };

  // Update balances
  await updateWalletBalance(buyerWalletId, currency, amount, "subtract");
  await updateWalletBalance(sellerWalletId, currency, sellerAmount, "add");
  await updateWalletBalance(platformWalletId, currency, platformFee, "add");

  // Update seller lifetime earnings
  await updateLifetimeEarnings(sellerWalletId, currency, sellerAmount);

  await createAuditLog({
    action: "PURCHASE_COMPLETED",
    severity: "info",
    metadata: {
      after: {
        buyerWalletId,
        sellerWalletId,
        amount,
        sellerAmount,
        platformFee,
        productId,
      },
    },
  });

  return { buyerTxn, sellerTxn, platformTxn };
}

/**
 * Transfer money between users
 */
export async function transferBetweenWallets(params: {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  currency: Currency;
  message?: string;
}): Promise<Transaction> {
  const { fromWalletId, toWalletId, amount, currency, message } = params;

  // Validate
  if (amount <= 0) {
    throw new Error("Transfer amount must be positive");
  }

  // Check balance
  const balance = await getWalletBalance(fromWalletId, currency);
  if (balance.available < amount) {
    throw new Error("Insufficient funds");
  }

  // Create transfer transaction
  const transaction: Transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    walletId: fromWalletId,
    type: "transfer",
    amount: -amount,
    currency,
    status: "completed",
    toWalletId,
    metadata: {
      description: message || "Wallet transfer",
    },
    createdAt: new Date(),
    completedAt: new Date(),
  };

  // Update balances
  await updateWalletBalance(fromWalletId, currency, amount, "subtract");
  await updateWalletBalance(toWalletId, currency, amount, "add");

  return transaction;
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
  walletId: string,
  limit: number = 50
): Promise<Transaction[]> {
  // TODO: Query from database
  // For now, return mock data
  return generateMockTransactions(walletId, limit);
}

/**
 * Calculate platform fee based on seller trust score
 */
function calculatePlatformFee(trustScore: number): number {
  // Trust score 0-1000 maps to fee 50%-5%
  // Higher trust = lower fee
  const maxFee = 0.5; // 50%
  const minFee = 0.05; // 5%

  const feeRange = maxFee - minFee;
  const trustRatio = trustScore / 1000;

  return maxFee - feeRange * trustRatio;
}

/**
 * Get seller's trust score
 */
async function getSellerTrustScore(walletId: string): Promise<number> {
  // TODO: Query from trust score engine
  return 750; // Mock: Trusted tier
}

/**
 * Update wallet balance
 */
async function updateWalletBalance(
  walletId: string,
  currency: Currency,
  amount: number,
  operation: "add" | "subtract"
): Promise<void> {
  // TODO: Atomic database update
  console.log(
    `${
      operation === "add" ? "+" : "-"
    }${amount} ${currency} → wallet ${walletId}`
  );
}

/**
 * Update lifetime earnings (instructors only)
 */
async function updateLifetimeEarnings(
  walletId: string,
  currency: Currency,
  amount: number
): Promise<void> {
  // TODO: Update wallet.balances[currency].lifetime
  console.log(`Lifetime earnings +${amount} ${currency} → wallet ${walletId}`);
}

/**
 * Process payment via Stripe
 */
async function processPayment(params: {
  amount: number;
  currency: Currency;
  paymentMethodId: string;
}): Promise<{ success: boolean; receiptUrl?: string }> {
  // TODO: Integrate with Stripe
  return {
    success: true,
    receiptUrl: "https://stripe.com/receipts/...",
  };
}

/**
 * Process payout via Stripe
 */
async function processPayout(params: {
  amount: number;
  currency: Currency;
  bankAccountId: string;
}): Promise<{ success: boolean }> {
  // TODO: Integrate with Stripe
  return { success: true };
}

/**
 * Generate mock transaction data
 */
function generateMockTransactions(
  walletId: string,
  count: number
): Transaction[] {
  const types: TransactionType[] = [
    "purchase",
    "royalty",
    "deposit",
    "withdrawal",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `txn_mock_${i}`,
    walletId,
    type: types[Math.floor(Math.random() * types.length)],
    amount: Math.random() * 100 - 50,
    currency: "USD" as Currency,
    status: "completed" as const,
    metadata: {
      description: "Mock transaction",
    },
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
  }));
}

/**
 * Get wallet analytics
 */
export async function getWalletAnalytics(walletId: string) {
  const transactions = await getTransactionHistory(walletId, 1000);

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const avgTransactionAmount =
    transactions.length > 0
      ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) /
        transactions.length
      : 0;

  return {
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
    transactionCount: transactions.length,
    avgTransactionAmount,
  };
}
