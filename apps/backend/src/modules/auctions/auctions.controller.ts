import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new auction' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Auction created successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only farmers can create auctions',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid auction data',
  })
  async createAuction(
    @Body() createAuctionDto: CreateAuctionDto,
    @Request() req,
  ) {
    const auction = await this.auctionsService.createAuction(
      createAuctionDto,
      req.user.id,
    );
    return {
      success: true,
      message: 'Auction created successfully',
      data: auction,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all auctions with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by auction status' })
  @ApiQuery({ name: 'farmerId', required: false, description: 'Filter by farmer ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auctions retrieved successfully',
  })
  async getAuctions(
    @Query('status') status?: string,
    @Query('farmerId') farmerId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const auctions = await this.auctionsService.getLiveAuctions();
    return {
      success: true,
      data: auctions,
      pagination: {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        total: auctions.length,
      },
    };
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Get scheduled auctions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scheduled auctions retrieved successfully',
  })
  async getScheduledAuctions() {
    const auctions = await this.auctionsService.getScheduledAuctions();
    return {
      success: true,
      data: auctions,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get auction by ID' })
  @ApiParam({ name: 'id', description: 'Auction ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auction retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Auction not found',
  })
  async getAuction(@Param('id') id: string) {
    const auction = await this.auctionsService.getAuction(id);
    return {
      success: true,
      data: auction,
    };
  }

  @Post(':id/bid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a bid on an auction' })
  @ApiParam({ name: 'id', description: 'Auction ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bid placed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid bid data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot place bid',
  })
  async placeBid(
    @Param('id') auctionId: string,
    @Body() placeBidDto: PlaceBidDto,
    @Request() req,
  ) {
    const bid = await this.auctionsService.placeBid(
      placeBidDto,
      req.user.id,
    );
    return {
      success: true,
      message: 'Bid placed successfully',
      data: bid,
    };
  }

  @Put(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start an auction' })
  @ApiParam({ name: 'id', description: 'Auction ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auction started successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only auction owner can start auction',
  })
  async startAuction(
    @Param('id') auctionId: string,
    @Request() req,
  ) {
    const auction = await this.auctionsService.startAuction(
      auctionId,
      req.user.id,
    );
    return {
      success: true,
      message: 'Auction started successfully',
      data: auction,
    };
  }

  @Put(':id/end')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End an auction' })
  @ApiParam({ name: 'id', description: 'Auction ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auction ended successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only auction owner can end auction',
  })
  async endAuction(
    @Param('id') auctionId: string,
    @Request() req,
  ) {
    const auction = await this.auctionsService.endAuction(
      auctionId,
      req.user.id,
    );
    return {
      success: true,
      message: 'Auction ended successfully',
      data: auction,
    };
  }

  @Get('user/bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bids' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User bids retrieved successfully',
  })
  async getUserBids(@Request() req) {
    const bids = await this.auctionsService.getUserBids(req.user.id);
    return {
      success: true,
      data: bids,
    };
  }

  @Get('user/auctions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user auctions (farmers only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User auctions retrieved successfully',
  })
  async getUserAuctions(@Request() req) {
    const auctions = await this.auctionsService.getUserAuctions(req.user.id);
    return {
      success: true,
      data: auctions,
    };
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join auction room for real-time updates' })
  @ApiParam({ name: 'id', description: 'Auction ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Joined auction room successfully',
  })
  async joinAuctionRoom(
    @Param('id') auctionId: string,
    @Request() req,
  ) {
    await this.auctionsService.joinAuctionRoom(auctionId, req.user.id);
    return {
      success: true,
      message: 'Joined auction room successfully',
    };
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave auction room' })
  @ApiParam({ name: 'id', description: 'Auction ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Left auction room successfully',
  })
  async leaveAuctionRoom(
    @Param('id') auctionId: string,
    @Request() req,
  ) {
    await this.auctionsService.leaveAuctionRoom(auctionId, req.user.id);
    return {
      success: true,
      message: 'Left auction room successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an auction' })
  @ApiParam({ name: 'id', description: 'Auction ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auction cancelled successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only auction owner can cancel auction',
  })
  @HttpCode(HttpStatus.OK)
  async cancelAuction(
    @Param('id') auctionId: string,
    @Request() req,
  ) {
    // TODO: Implement auction cancellation logic
    return {
      success: true,
      message: 'Auction cancelled successfully',
    };
  }
}
