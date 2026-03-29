import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('packages')
@UseGuards(JwtAuthGuard)
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Get('templates')
  async getTemplates() {
    return this.packagesService.getTemplates();
  }

  @Get('companion/:id')
  async getCompanionPackages(@Param('id', ParseUUIDPipe) id: string) {
    const packages = await this.packagesService.getCompanionPackages(id);
    return packages.map((p) => this.formatPackage(p));
  }

  @Get('my')
  async getMyPackages(@Request() req) {
    const packages = await this.packagesService.getMyPackages(req.user.id);
    return packages.map((p) => this.formatPackage(p));
  }

  @Post('my')
  async createPackage(
    @Request() req,
    @Body() body: { templateId: string; price: number; customDescription?: string },
  ) {
    if (!body.templateId || body.price === undefined) {
      throw new HttpException('templateId and price are required', HttpStatus.BAD_REQUEST);
    }
    const pkg = await this.packagesService.createPackage({
      companionId: req.user.id,
      templateId: body.templateId,
      price: body.price,
      customDescription: body.customDescription,
    });
    return this.formatPackage(pkg);
  }

  @Put('my/:id')
  async updatePackage(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() body: { price?: number; customDescription?: string; isActive?: boolean },
  ) {
    const pkg = await this.packagesService.updatePackage(id, req.user.id, body);
    return this.formatPackage(pkg);
  }

  @Delete('my/:id')
  async deletePackage(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.packagesService.deletePackage(id, req.user.id);
    return { success: true };
  }

  private formatPackage(pkg: any) {
    return {
      id: pkg.id,
      companionId: pkg.companionId,
      templateId: pkg.templateId,
      price: pkg.price,
      customDescription: pkg.customDescription || undefined,
      isActive: pkg.isActive,
      template: pkg.template
        ? {
            id: pkg.template.id,
            slug: pkg.template.slug,
            name: pkg.template.name,
            nameRu: pkg.template.nameRu,
            description: pkg.template.description,
            descriptionRu: pkg.template.descriptionRu,
            defaultDuration: pkg.template.defaultDuration,
            defaultActivity: pkg.template.defaultActivity,
            icon: pkg.template.icon,
          }
        : undefined,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
  }
}
