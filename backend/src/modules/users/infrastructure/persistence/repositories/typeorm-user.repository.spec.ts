import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { User } from '../../../domain/entities/user.entity';

class MockUserOrmRepository {
  findOneResult: UserOrmEntity | null = null;
  lastFindOneWhere?: Record<string, unknown>;

  findAndCountResult: [UserOrmEntity[], number] = [[], 0];
  lastSkip?: number;
  lastTake?: number;
  lastWhere?: unknown;

  createdEntity?: Partial<UserOrmEntity>;
  savedEntity?: UserOrmEntity;
  deletedId?: number;

  async findOne(options: { where: Record<string, unknown> }): Promise<UserOrmEntity | null> {
    this.lastFindOneWhere = options.where;
    return this.findOneResult;
  }

  async findAndCount(options: {
    skip?: number;
    take?: number;
    order?: Record<string, string>;
    where?: unknown;
  }): Promise<[UserOrmEntity[], number]> {
    this.lastSkip = options.skip;
    this.lastTake = options.take;
    this.lastWhere = options.where;
    return this.findAndCountResult;
  }

  create(entity: Partial<UserOrmEntity>): UserOrmEntity {
    this.createdEntity = entity;
    return entity as UserOrmEntity;
  }

  async save(entity: UserOrmEntity): Promise<UserOrmEntity> {
    this.savedEntity = entity;
    return entity;
  }

  async delete(id: number): Promise<{ affected?: number }> {
    this.deletedId = id;
    return { affected: id === 999 ? 0 : 1 };
  }
}

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let mockRepo: MockUserOrmRepository;

  const mockDate = new Date();
  const mockOrmEntity: UserOrmEntity = {
    id: 1,
    fullName: 'Nguyen Van A',
    email: 'a@example.com',
    passwordHash: 'hashed123',
    role: UserRole.CUSTOMER,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(async () => {
    mockRepo = new MockUserOrmRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);
  });

  describe('findById', () => {
    it('should return domain user when found', async () => {
      mockRepo.findOneResult = mockOrmEntity;

      const result = await repository.findById(1);
      expect(mockRepo.lastFindOneWhere).toEqual({ id: 1 });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(1);
      expect(result?.email).toBe('a@example.com');
    });

    it('should return null when user not found', async () => {
      mockRepo.findOneResult = null;

      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return domain user when found by email', async () => {
      mockRepo.findOneResult = mockOrmEntity;

      const result = await repository.findByEmail('a@example.com');
      expect(mockRepo.lastFindOneWhere).toEqual({ email: 'a@example.com' });
      expect(result?.email).toBe('a@example.com');
    });

    it('should return null when email does not exist', async () => {
      mockRepo.findOneResult = null;

      const result = await repository.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should convert page and limit to skip and take and return users with total', async () => {
      mockRepo.findAndCountResult = [[mockOrmEntity], 1];

      const [users, total] = await repository.findAll(2, 5);

      expect(mockRepo.lastSkip).toBe(5);
      expect(mockRepo.lastTake).toBe(5);
      expect(users.length).toBe(1);
      expect(users[0]).toBeInstanceOf(User);
      expect(total).toBe(1);
    });

    it('should use default page 1 and limit 10 when not provided', async () => {
      mockRepo.findAndCountResult = [[mockOrmEntity], 1];

      await repository.findAll();

      expect(mockRepo.lastSkip).toBe(0);
      expect(mockRepo.lastTake).toBe(10);
      expect(mockRepo.lastWhere).toBeUndefined();
    });

    it('should apply ILike search on fullName and email when search is provided', async () => {
      mockRepo.findAndCountResult = [[mockOrmEntity], 1];

      await repository.findAll(1, 10, 'john');

      expect(Array.isArray(mockRepo.lastWhere)).toBe(true);
      const whereArray = mockRepo.lastWhere as Array<Record<string, unknown>>;
      expect(whereArray.length).toBe(2);
      expect(whereArray[0]).toHaveProperty('fullName');
      expect(whereArray[1]).toHaveProperty('email');
    });

    it('should apply role filter when role is provided without search', async () => {
      mockRepo.findAndCountResult = [[mockOrmEntity], 1];

      await repository.findAll(1, 10, undefined, UserRole.STAFF);

      expect(mockRepo.lastWhere).toEqual({ role: UserRole.STAFF });
    });

    it('should combine search and role filter when both are provided', async () => {
      mockRepo.findAndCountResult = [[mockOrmEntity], 1];

      await repository.findAll(1, 10, 'john', UserRole.STAFF);

      expect(Array.isArray(mockRepo.lastWhere)).toBe(true);
      const whereArray = mockRepo.lastWhere as Array<Record<string, unknown>>;
      expect(whereArray.length).toBe(2);
      expect(whereArray[0]).toHaveProperty('fullName');
      expect(whereArray[0]).toHaveProperty('role', UserRole.STAFF);
      expect(whereArray[1]).toHaveProperty('email');
      expect(whereArray[1]).toHaveProperty('role', UserRole.STAFF);
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const result = await repository.create(
        'Nguyen Van A',
        'a@example.com',
        'hashed123',
        UserRole.CUSTOMER,
      );

      expect(mockRepo.createdEntity).toEqual({
        fullName: 'Nguyen Van A',
        email: 'a@example.com',
        passwordHash: 'hashed123',
        role: UserRole.CUSTOMER,
      });
      expect(mockRepo.savedEntity).toBeDefined();
      expect(result).toBeInstanceOf(User);
      expect(result.fullName).toBe('Nguyen Van A');
    });
  });

  describe('update', () => {
    it('should update fields and return domain user if found', async () => {
      mockRepo.findOneResult = Object.assign(new UserOrmEntity(), mockOrmEntity);

      const result = await repository.update(1, 'Updated Name', undefined, UserRole.STAFF);

      expect(result?.fullName).toBe('Updated Name');
      expect(result?.role).toBe(UserRole.STAFF);
      expect(mockRepo.savedEntity).toBeDefined();
    });

    it('should return null if user to update is not found', async () => {
      mockRepo.findOneResult = null;

      const result = await repository.update(999, 'Name');
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true when record is deleted', async () => {
      const result = await repository.delete(1);
      expect(result).toBe(true);
      expect(mockRepo.deletedId).toBe(1);
    });

    it('should return false when record does not exist', async () => {
      const result = await repository.delete(999);
      expect(result).toBe(false);
    });
  });

  describe('save', () => {
    it('should map domain user to ORM entity and save', async () => {
      const domainUser = new User('Test User', 'test@example.com', 'pwd');

      const result = await repository.save(domainUser);
      expect(mockRepo.savedEntity).toBeDefined();
      expect(result.fullName).toBe('Test User');
    });
  });
});
