import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(payload: { name: string; email: string; photoUrl?: string }) {
    if (!payload || !payload.name || !payload.email) {
      return { error: 'Name and email are required' };
    }

    const user = await this.prisma.user.create({
      data: {
        gid: crypto.randomUUID(),
        name: payload.name,
        email: payload.email,
        photoUrl: payload.photoUrl,
      },
    });

    return { data: user };
  }

  async listUsers() {
    const data = await this.prisma.user.findMany();
    return { data };
  }

  async getUserById(userGid: string) {
    const user = await this.prisma.user.findUnique({
      where: { gid: userGid },
    });
    return { data: user ?? null };
  }
}
