import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // #696 - admin identity
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // #700 - revenue
  @Get('revenue')
  getRevenue() {
    return this.adminService.getRevenue();
  }

  // #700 - transactions
  @Get('transactions')
  getTransactions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getTransactions(page, Math.min(limit, 100));
  }

  // #701 - reviews
  @Get('reviews')
  getReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getReviews(page, Math.min(limit, 100));
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(id);
  }

  @Get('users')
  getUsers(
    @Query('search') search = '',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getUsers(search, page, Math.min(limit, 100));
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean; isAdmin?: boolean },
  ) {
    return this.adminService.updateUser(id, body);
  }

  // #697 - ban/unban
  @Post('users/:id/ban')
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Post('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  // #698 - user bookings
  @Get('users/:userId/bookings')
  getUserBookings(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getUserBookings(userId, page, Math.min(limit, 100));
  }

  @Get('bookings')
  getBookings(
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.adminService.getBookings(status, page, Math.min(limit, 100));
  }

  @Get('bookings/:id')
  getBookingById(@Param('id') id: string) {
    return this.adminService.getBookingById(id);
  }

  // #699 - cancel booking
  @Post('bookings/:id/cancel')
  cancelBooking(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.cancelBooking(id, body.reason);
  }

  @Get('verifications')
  getVerifications(
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.adminService.getVerifications(status, page, Math.min(limit, 100));
  }

  @Put('verifications/:id/approve')
  approveVerification(@Param('id') id: string) {
    return this.adminService.approveVerification(id);
  }

  @Put('verifications/:id/reject')
  rejectVerification(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.rejectVerification(id, body.reason);
  }
}
