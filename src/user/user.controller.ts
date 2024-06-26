import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  AuthData,
  GetAuthData,
} from 'src/auth/decorator/get-auth-data.decorator';
import { PaginationQueryDto, UploadFileDto } from 'src/util/common.dto';
import { ApiBearerUserGuard } from 'src/decorator/auth.dectorator';
import { fixPaginationQueryNumber } from 'src/util/chore.util';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';
import { UserGuard } from 'src/auth/guard/auth.guard';
import { APISummaries } from 'src/helpers';
import { FastifyFileInterceptor } from 'src/util/file.util';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/req.dto';

@Controller('user')
@ApiTags('USER')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get('recent-play-tracks')
  @ApiBearerUserGuard()
  getRecentPlayTracks(
    @GetAuthData() authData: AuthData,
    @Query() query: PaginationQueryDto,
  ) {
    fixPaginationQueryNumber(query);
    return this.userService.getRecentPlayTracks(authData, query);
  }

  @Get('most-play-tracks')
  @ApiBearerUserGuard()
  getMostPlayTracks(@GetAuthData() authData: AuthData) {
    return this.userService.getMostPlayTracks(authData);
  }

  @Get('recent-play-artists')
  @ApiBearerUserGuard()
  getRecentPlayArtists(
    @GetAuthData() authData: AuthData,
    @Query() query: PaginationQueryDto,
  ) {
    fixPaginationQueryNumber(query);
    return this.userService.getRecentPlayArtists(authData, query);
  }

  @Get('most-play-artists')
  @ApiBearerUserGuard()
  getMostPlayArtists(@GetAuthData() authData: AuthData) {
    return this.userService.getMostPlayArtists(authData);
  }

  @Get('recent-play-albums')
  @ApiBearerUserGuard()
  getRecentPlayAlbums(
    @GetAuthData() authData: AuthData,
    @Query() query: PaginationQueryDto,
  ) {
    fixPaginationQueryNumber(query);
    return this.userService.getRecentPlayAlbum(authData, query);
  }

  @ApiOperation({ summary: APISummaries.USER })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post('avatar')
  @UseInterceptors(FastifyFileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  setAvatar(
    @GetAuthData() authData: AuthData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() dto: UploadFileDto, // For Swagger
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.setAvatar(authData.id, file);
  }

  @ApiOperation({ summary: APISummaries.USER })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Put('profile')
  updateProfile(@GetAuthData() user: User, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, dto);
  }
}
