"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  planType: string;
  amount: number;
  currency: string;
  status: string;
  transactionReference: string;
  createdAt: Date | null;
  confirmedAt?: Date | null;
  expiresAt?: Date | null;
  membershipBillUrl?: string | null;
  paymentSettings?: string | null;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [localTransactions] = useState(transactions);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "waiting_confirmation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "expired":
      case "failed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (localTransactions.length === 0) {
    return (
      <Card className="shadow-none border-none rounded-xs">
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No transactions found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-none rounded-xs">
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Confirmed</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {localTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium capitalize">
                  {transaction.planType} Plan
                </TableCell>
                <TableCell className="font-medium">
                  {formatAmount(transaction.amount, transaction.currency)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(transaction.status)}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(transaction.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {transaction.confirmedAt
                    ? formatDate(transaction.confirmedAt)
                    : "-"}
                </TableCell>
                <TableCell>
                  {transaction.status === "pending" &&
                    transaction.membershipBillUrl && (
                      <Button asChild size="sm" variant="outline">
                        <a href={transaction.membershipBillUrl}>Continue</a>
                      </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
