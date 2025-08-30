'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Clock, Users, TrendingUp, Award, AlertCircle } from 'lucide-react';

interface LiveAuctionRoomProps {
  auctionId: string;
  initialData: {
    id: string;
    currentBid: number;
    startingBid: number;
    reservePrice?: number;
    minBidIncrement: number;
    startTime: string;
    endTime: string;
    status: string;
    listing: {
      id: string;
      title: string;
      description: string;
      quantity: number;
      unit: string;
      pricePerUnit: number;
      images: string[];
    };
    farmer: {
      id: string;
      name: string;
      rating: number;
    };
    bids: Array<{
      id: string;
      amount: number;
      bidderId: string;
      bidderName: string;
      createdAt: string;
    }>;
  };
}

interface Bid {
  id: string;
  amount: number;
  bidderId: string;
  bidderName: string;
  createdAt: string;
}

export function LiveAuctionRoom({ auctionId, initialData }: LiveAuctionRoomProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentBid, setCurrentBid] = useState(initialData.currentBid || initialData.startingBid);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [bids, setBids] = useState<Bid[]>(initialData.bids || []);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [participants, setParticipants] = useState(0);
  const [isAutoBid, setIsAutoBid] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState('');
  const [auctionStatus, setAuctionStatus] = useState(initialData.status);
  
  const countdownRef = useRef<NodeJS.Timeout>();
  const socketRef = useRef<Socket>();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to auction room');
      newSocket.emit('join_auction', { auctionId, userId: user?.id });
    });

    newSocket.on('bid_placed', (data: any) => {
      if (data.auctionId === auctionId) {
        setCurrentBid(data.currentBid);
        setBids((prev: Bid[]) => [data.bid, ...prev]);
        setSuccess(`New bid placed: ${formatCurrency(data.currentBid)}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    });

    newSocket.on('auction_started', (data: any) => {
      if (data.auctionId === auctionId) {
        setAuctionStatus('LIVE');
        setSuccess('Auction has started!');
        setTimeout(() => setSuccess(''), 3000);
      }
    });

    newSocket.on('auction_ended', (data: any) => {
      if (data.auctionId === auctionId) {
        setAuctionStatus('ENDED');
        setSuccess(`Auction ended! Winning bid: ${formatCurrency(data.winningBid?.amount || 0)}`);
        setTimeout(() => setSuccess(''), 5000);
      }
    });

    newSocket.on('auction_extended', (data: any) => {
      if (data.auctionId === auctionId) {
        setSuccess(`Auction extended: ${data.reason}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    });

    newSocket.on('participant_count', (data: any) => {
      if (data.auctionId === auctionId) {
        setParticipants(data.count);
      }
    });

    newSocket.on('error', (error: any) => {
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [auctionId, user?.id]);

  useEffect(() => {
    // Countdown timer
    const updateCountdown = () => {
      const now = new Date().getTime();
      const endTime = new Date(initialData.endTime).getTime();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        setAuctionStatus('ENDED');
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      }
    };

    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [initialData.endTime]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlaceBid = async () => {
    if (!user) {
      setError('Please login to place a bid');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    const minBid = currentBid + initialData.minBidIncrement;
    if (amount < minBid) {
      setError(`Bid must be at least ${formatCurrency(minBid)}`);
      return;
    }

    setIsPlacingBid(true);
    setError('');

    try {
      const response = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount,
          isAutoBid,
          maxAutoBidAmount: isAutoBid ? parseFloat(maxAutoBid) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place bid');
      }

      const bidData = await response.json();
      setBidAmount('');
      setSuccess('Bid placed successfully!');
      setTimeout(() => setSuccess(''), 3000);

      // Emit bid through socket
      if (socketRef.current) {
        socketRef.current.emit('place_bid', {
          auctionId,
          amount,
          isAutoBid,
          maxAutoBidAmount: isAutoBid ? parseFloat(maxAutoBid) : undefined,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to place bid');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const isAuctionLive = auctionStatus === 'LIVE';
  const canBid = isAuctionLive && user && user.id !== initialData.farmer.id;
  const isWinningBid = bids.length > 0 && bids[0]?.bidderId === user?.id;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Auction Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {initialData.listing.title}
              </CardTitle>
              <p className="text-gray-600 mt-2">{initialData.listing.description}</p>
            </div>
            <div className="text-right">
              <Badge 
                variant={isAuctionLive ? 'default' : auctionStatus === 'ENDED' ? 'secondary' : 'outline'}
                className="text-lg px-4 py-2"
              >
                {isAuctionLive ? 'LIVE NOW' : auctionStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-600">Time Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(currentBid)}
              </div>
              <div className="text-sm text-gray-600">Current Bid</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {participants}
              </div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bidding Section */}
      {canBid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Place Your Bid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Amount
                </label>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min: ${formatCurrency(currentBid + initialData.minBidIncrement)}`}
                  min={currentBid + initialData.minBidIncrement}
                  step="0.01"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum bid: {formatCurrency(currentBid + initialData.minBidIncrement)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-bid (Optional)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAutoBid}
                      onChange={(e) => setIsAutoBid(e.target.checked)}
                      className="mr-2"
                    />
                    Enable auto-bidding
                  </label>
                  {isAutoBid && (
                    <Input
                      type="number"
                      value={maxAutoBid}
                      onChange={(e) => setMaxAutoBid(e.target.value)}
                      placeholder="Maximum bid amount"
                      min={currentBid + initialData.minBidIncrement}
                      step="0.01"
                    />
                  )}
                </div>
              </div>
            </div>
            
            <Button
              onClick={handlePlaceBid}
              disabled={isPlacingBid || !bidAmount}
              className="w-full"
              size="lg"
            >
              {isPlacingBid ? 'Placing Bid...' : 'Place Bid'}
            </Button>

            {isWinningBid && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <Award className="w-5 h-5" />
                <span className="font-medium">You are currently winning this auction!</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auction Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Quantity</label>
                <p className="text-lg font-semibold">
                  {initialData.listing.quantity} {initialData.listing.unit}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Price per Unit</label>
                <p className="text-lg font-semibold">
                  {formatCurrency(initialData.listing.pricePerUnit)}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Starting Bid</label>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(initialData.startingBid)}
              </p>
            </div>
            {initialData.reservePrice && (
              <div>
                <label className="text-sm font-medium text-gray-500">Reserve Price</label>
                <p className="text-lg font-semibold text-orange-600">
                  {formatCurrency(initialData.reservePrice)}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Farmer</label>
              <p className="text-lg font-semibold">{initialData.farmer.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm">{initialData.farmer.rating.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bids */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bids</CardTitle>
          </CardHeader>
          <CardContent>
            {bids.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bids yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      bid.bidderId === user?.id
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium">
                        {bid.bidderId === user?.id ? 'You' : bid.bidderName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatRelativeTime(bid.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        {formatCurrency(bid.amount)}
                      </p>
                      {bid.bidderId === user?.id && (
                        <Badge variant="outline" className="text-xs">
                          Your Bid
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
          <Award className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
