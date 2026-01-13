import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../common/inmemory.repository';
import { User } from './user.entity';

@Injectable()
export class UsersService extends InMemoryRepository<User> {
  createUser(payload: { name: string; email: string; photoUrl?: string }) {
    if (!payload || !payload.name || !payload.email) {
      return { error: 'Name and email are required' };
    }

    const user: User = {
      gid: crypto.randomUUID(),
      name: payload.name,
      email: payload.email,
      photoUrl: payload.photoUrl,
      createdAt: new Date().toISOString(),
    };

    this.create(user);
    return { data: user };
  }

  listUsers() {
    return { data: this.findAll() };
  }

  getUserById(userGid: string) {
    return { data: this.findById(userGid) ?? null };
  }
}
