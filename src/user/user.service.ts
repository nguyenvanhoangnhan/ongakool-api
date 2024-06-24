import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';
import { AuthData } from 'src/auth/decorator/get-auth-data.decorator';
import { PlainToInstance } from 'src/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQueryDto } from 'src/util/common.dto';
import { User } from './entities/user.entity';
import { S3Service } from 'src/s3/s3.service';
import { v4 as uuidv4 } from 'uuid';
import * as argon from 'argon2';
import { UpdateProfileDto } from './dto/req.dto';

@Injectable()
export class UserService {
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  findAll() {
    return `This action returns all user`;
  }

  getFavoriteTracks(authData: AuthData) {
    return this.prisma.user_favourite_track.findMany({
      where: {
        userId: authData.id,
      },
    });
  }

  getRecentPlayTracks(authData: AuthData, pagination?: PaginationQueryDto) {
    return this.prisma.user_listen_track.findMany({
      where: {
        userId: authData.id,
      },
      take: pagination?.pageSize || 20,
      skip: pagination?.page ? (pagination.page - 1) * pagination.pageSize : 0,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  getMostPlayTracks(authData: AuthData) {
    return this.prisma.user_listen_track.findMany({
      where: {
        userId: authData.id,
      },
      take: 20,
      orderBy: {
        listenCount: 'desc',
      },
    });
  }

  getRecentPlayArtists(authData: AuthData, pagination?: PaginationQueryDto) {
    return this.prisma.user_listen_artist.findMany({
      where: {
        userId: authData.id,
      },
      take: pagination?.pageSize || 20,
      skip: pagination?.page ? (pagination.page - 1) * pagination.pageSize : 0,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  getMostPlayArtists(authData: AuthData) {
    return this.prisma.user_listen_artist.findMany({
      where: {
        userId: authData.id,
      },
      take: 20,
      orderBy: {
        listenCount: 'desc',
      },
    });
  }

  getRecentPlayAlbum(authData: AuthData, pagination?: PaginationQueryDto) {
    return this.prisma.user_listen_album.findMany({
      where: {
        userId: authData.id,
      },
      take: pagination?.pageSize || 20,
      skip: pagination?.page ? (pagination.page - 1) * pagination.pageSize : 0,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.fullname) {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          fullname: dto.fullname,
        },
      });
    }

    if (dto.password) {
      const hashedPassword = await argon.hash(dto.password);

      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          pwdHash: hashedPassword,
        },
      });
    }

    const userWithProfile = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return PlainToInstance(User, userWithProfile);
  }

  async setAvatar(userId: number, file: Express.Multer.File) {
    console.log('file.originalname', file.originalname);

    console.log(path.extname(file.originalname));

    const { fullUrl } = await this.s3.uploadFile({
      fileBody: file.buffer,
      directory: 'avatar',
      fileName: `avatar_${userId}_${uuidv4()}${path.extname(file.originalname)}`,
    });

    if (!fullUrl) throw new BadRequestException('Failed to upload image');

    const oldAvatar = (
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          avatarImageUrl: true,
        },
      })
    ).avatarImageUrl;

    if (oldAvatar && this.s3.matchUrl(oldAvatar)) {
      const objectKey = this.s3.getObjectKeyFromUrl(oldAvatar);
      await this.s3.deleteFiles([{ key: objectKey }]);
    }

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarImageUrl: fullUrl,
      },
    });

    return fullUrl;
  }
}
