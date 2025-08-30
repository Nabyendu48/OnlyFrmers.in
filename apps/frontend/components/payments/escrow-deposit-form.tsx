'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Shield, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface EscrowDepositFormProps {
  listingId: string;
  auctionId?: string;
  listingPrice: number;
  quantity: number;
  onDepositComplete: (escrowHoldId: string) => void;
}

export function EscrowDepositForm({
  listingId,
  auctionId,
  listingPrice,
  quantity,
  onDepositComplete,
}: EscrowDepositFormProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalAmount = listingPrice * quantity;
  const escrowAmount = totalAmount * 0.1; // 10% deposit

  const handleDeposit = async () => {
    if (!user) {
      setError('Please login to make a deposit');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create escrow hold
      const escrowResponse = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          listingId,
          auctionId,
          amount: escrowAmount,
          totalAmount,
        }),
      });

      if (!escrowResponse.ok) {
        const errorData = await escrowResponse.json();
        throw new Error(errorData.message || 'Failed to create escrow hold');
      }

      const escrowData = await escrowResponse.json();

      // Create payment intent
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: user.id,
          listingId,
          auctionId,
          escrowHoldId: escrowData.id,
          type: 'ESCROW_DEPOSIT',
          amount: escrowAmount,
          currency: 'INR',
          paymentGateway: 'RAZORPAY',
          description: `10% escrow deposit for ${quantity} units`,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const paymentData = await paymentResponse.json();

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(escrowAmount * 100), // Convert to paise
        currency: 'INR',
        name: 'OnlyFarmers.in',
        description: `Escrow Deposit - ${quantity} units`,
        order_id: paymentData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({
                paymentIntentId: paymentData.paymentIntentId,
                transactionId: response.razorpay_payment_id,
                paymentMethod: 'card',
                gatewayResponse: response,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            setSuccess('Escrow deposit successful! You can now participate in the auction.');
            onDepositComplete(escrowData.id);
          } catch (error) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: {
          color: '#10B981',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Escrow Deposit Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            To participate in this auction, you need to deposit 10% of the total amount
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(escrowAmount)}
            </div>
            <div className="text-sm text-gray-500">
              of {formatCurrency(totalAmount)} total
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Listing Price:</span>
            <span>{formatCurrency(listingPrice)} per unit</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span>{quantity} units</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Escrow Deposit (10%):</span>
            <span className="font-semibold text-green-600">{formatCurrency(escrowAmount)}</span>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">How it works:</p>
              <ul className="mt-1 space-y-1">
                <li>• Deposit 10% to secure your participation</li>
                <li>• Funds are held securely in escrow</li>
                <li>• Refunded if you don't win the auction</li>
                <li>• Applied to final payment if you win</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDeposit}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <CreditCard className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Deposit {formatCurrency(escrowAmount)}
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{success}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
