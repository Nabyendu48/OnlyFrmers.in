'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/lib/utils';
import { Search, Filter, Clock, Users, TrendingUp, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

interface Auction {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  startingBid: number;
  currentBid?: number;
  reservePrice?: number;
  totalBids: number;
  uniqueBidders: number;
  listing: {
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    images: string[];
    location: string;
  };
  farmer: {
    id: string;
    name: string;
    rating: number;
  };
}

export default function AuctionsPage() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startTime');

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    filterAndSortAuctions();
  }, [auctions, searchTerm, statusFilter, sortBy]);

  const fetchAuctions = async () => {
    try {
      const response = await fetch('/api/auctions');
      if (response.ok) {
        const data = await response.json();
        setAuctions(data);
      }
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortAuctions = () => {
    let filtered = auctions.filter((auction) => {
      const matchesSearch = auction.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           auction.listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           auction.farmer.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort auctions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'startTime':
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        case 'endTime':
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        case 'startingBid':
          return a.startingBid - b.startingBid;
        case 'currentBid':
          return (a.currentBid || 0) - (b.currentBid || 0);
        case 'totalBids':
          return b.totalBids - a.totalBids;
        default:
          return 0;
      }
    });

    setFilteredAuctions(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Scheduled</Badge>;
      case 'LIVE':
        return <Badge variant="default" className="bg-red-600">Live Now</Badge>;
      case 'ENDED':
        return <Badge variant="secondary">Ended</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeStatus = (startTime: string, endTime: string, status: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (status === 'LIVE') {
      const remaining = end.getTime() - now.getTime();
      if (remaining <= 0) return 'Ending soon';
      
      const minutes = Math.floor(remaining / (1000 * 60));
      if (minutes < 60) return `${minutes}m remaining`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m remaining`;
    } else if (status === 'SCHEDULED') {
      const timeUntilStart = start.getTime() - now.getTime();
      if (timeUntilStart <= 0) return 'Starting soon';
      
      const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
      if (days > 0) return `Starts in ${days} day${days > 1 ? 's' : ''}`;
      
      const hours = Math.floor(timeUntilStart / (1000 * 60 * 60));
      return `Starts in ${hours}h`;
    }
    
    return formatDateTime(end);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Auctions</h1>
        <p className="text-gray-600">
          Discover fresh produce from farmers across India. Bid in real-time and get the best prices.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search auctions, crops, or farmers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live Now</option>
            <option value="ENDED">Ended</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="startTime">Sort by Start Time</option>
            <option value="endTime">Sort by End Time</option>
            <option value="startingBid">Sort by Starting Bid</option>
            <option value="currentBid">Sort by Current Bid</option>
            <option value="totalBids">Sort by Popularity</option>
          </select>
        </div>
      </div>

      {/* Auctions Grid */}
      {filteredAuctions.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Check back later for new auctions'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <Card key={auction.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {auction.listing.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {auction.listing.description}
                    </p>
                  </div>
                  {getStatusBadge(auction.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Auction Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Starting Bid:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(auction.startingBid)}
                    </span>
                  </div>
                  
                  {auction.currentBid && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Current Bid:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(auction.currentBid)}
                      </span>
                    </div>
                  )}
                  
                  {auction.reservePrice && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Reserve:</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(auction.reservePrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Listing Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Quantity:</span>
                    <span>{auction.listing.quantity} {auction.listing.unit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Price per Unit:</span>
                    <span>{formatCurrency(auction.listing.pricePerUnit)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{auction.listing.location}</span>
                  </div>
                </div>

                {/* Auction Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeStatus(auction.startTime, auction.endTime, auction.status)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{auction.uniqueBidders} bidders</span>
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{auction.farmer.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs">{auction.farmer.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {auction.totalBids} bids
                  </span>
                </div>

                {/* Action Button */}
                <Link href={`/auctions/${auction.id}`} className="block">
                  <Button 
                    className="w-full" 
                    variant={auction.status === 'LIVE' ? 'default' : 'outline'}
                    disabled={auction.status === 'ENDED' || auction.status === 'COMPLETED'}
                  >
                    {auction.status === 'LIVE' ? 'Join Auction' : 
                     auction.status === 'SCHEDULED' ? 'View Details' : 'View Results'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Auction CTA for Farmers */}
      {user?.role === 'FARMER' && (
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to sell your produce?
              </h3>
              <p className="text-gray-600 mb-4">
                Create an auction and connect directly with buyers. No commission fees, just better prices.
              </p>
              <Link href="/auctions/create">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Create New Auction
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
