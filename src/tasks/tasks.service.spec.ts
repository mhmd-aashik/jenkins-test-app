import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { DRIZZLE } from '../database/database.provider';
import { TaskStatus } from './dto/create-task.dto';

describe('TasksService', () => {
  let service: TasksService;

  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Desc',
    status: TaskStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReturning = jest
    .fn()
    .mockImplementation(() => Promise.resolve([mockTask]));
  const mockWhereSelect = jest
    .fn()
    .mockImplementation(() => Promise.resolve([mockTask]));
  const mockOrderBy = jest
    .fn()
    .mockImplementation(() => Promise.resolve([mockTask]));

  const mockDrizzle = {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }),
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        orderBy: mockOrderBy,
        where: mockWhereSelect,
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: mockReturning,
        }),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: mockReturning,
      }),
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockReturning.mockImplementation(() => Promise.resolve([mockTask]));
    mockWhereSelect.mockImplementation(() => Promise.resolve([mockTask]));
    mockOrderBy.mockImplementation(() => Promise.resolve([mockTask]));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: DRIZZLE,
          useValue: mockDrizzle,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should insert and return a new task', async () => {
      const dto = {
        title: 'Test Task',
        description: 'Test Desc',
        status: TaskStatus.PENDING,
      };
      const result = await service.create(dto);
      expect(result).toEqual(mockTask);
      expect(mockDrizzle.insert).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should select and return all tasks', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockTask]);
      expect(mockDrizzle.select).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should select and return a task by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockTask);
      expect(mockDrizzle.select).toHaveBeenCalled();
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockWhereSelect.mockImplementationOnce(() => Promise.resolve([]));
      await expect(service.findOne(99)).rejects.toThrow(
        'Task with ID 99 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a task and return it', async () => {
      const dto = { title: 'Updated Title' };
      mockReturning.mockImplementationOnce(() =>
        Promise.resolve([{ ...mockTask, title: 'Updated Title' }]),
      );
      const result = await service.update(1, dto);
      expect(result.title).toBe('Updated Title');
      expect(mockDrizzle.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if task to update does not exist', async () => {
      mockReturning.mockImplementationOnce(() => Promise.resolve([]));
      await expect(service.update(99, { title: 'No Exist' })).rejects.toThrow(
        'Task with ID 99 not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete a task and return it', async () => {
      mockReturning.mockImplementationOnce(() => Promise.resolve([mockTask]));
      const result = await service.remove(1);
      expect(result).toEqual(mockTask);
      expect(mockDrizzle.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if task to delete does not exist', async () => {
      mockReturning.mockImplementationOnce(() => Promise.resolve([]));
      await expect(service.remove(99)).rejects.toThrow(
        'Task with ID 99 not found',
      );
    });
  });
});
