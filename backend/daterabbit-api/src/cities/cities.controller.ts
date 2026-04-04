import { Controller, Get, Query, DefaultValuePipe, ParseBoolPipe } from '@nestjs/common';
import { CitiesService } from './cities.service';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  findAll(
    @Query('active', new DefaultValuePipe(true), ParseBoolPipe) active: boolean,
  ) {
    return this.citiesService.findAll(active);
  }
}
