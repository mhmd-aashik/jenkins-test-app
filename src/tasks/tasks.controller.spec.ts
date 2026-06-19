import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus } from './dto/create-task.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    create: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        id: 1,
        title: dto.title,
        description: dto.description || null,
        status: dto.status || TaskStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    findAll: jest.fn().mockResolvedValue([
      { id: 1, title: 'Test Task', description: 'Test Desc', status: TaskStatus.PENDING },
    ]),
    findOne: jest.fn().mockImplementation((id) =>
      Promise.resolve({ id, title: 'Test Task', description: 'Test Desc', status: TaskStatus.PENDING }),
    ),
    update: jest.fn().mockImplementation((id, dto) =>
      Promise.resolve({ id, ...dto }),
    ),
    remove: jest.fn().mockImplementation((id) =>
      Promise.resolve({ id, title: 'Test Task', status: TaskStatus.COMPLETED }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const dto = { title: 'Test Task', description: 'Test Desc', status: TaskStatus.PENDING };
      const result = await controller.create(dto);
      expect(result).toHaveProperty('id', 1);
      expect(result.title).toBe(dto.title);
      expect(mockTasksService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const result = await controller.findAll();
      expect(result).toBeInstanceOf(Array);
      expect(result[0].title).toBe('Test Task');
      expect(mockTasksService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return one task', async () => {
      const result = await controller.findOne(1);
      expect(result).toHaveProperty('id', 1);
      expect(mockTasksService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const dto = { title: 'Updated Title' };
      const result = await controller.update(1, dto);
      expect(result.title).toBe(dto.title);
      expect(mockTasksService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const result = await controller.remove(1);
      expect(result).toHaveProperty('id', 1);
      expect(mockTasksService.remove).toHaveBeenCalledWith(1);
    });
  });
});
