import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByVersion: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            resolveComment: jest.fn(),
            addReply: jest.fn(),
            getCommentThread: jest.fn(),
            getUnresolvedComments: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of comments', async () => {
      const result = [{ id: '1', text: 'Comment 1' }]; // Mock the expected result
      jest.spyOn(service, 'findAll').mockImplementation(async () => result as any);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single comment', async () => {
      const commentId = 'some-id';
      const result = { id: commentId, text: 'Test Comment' }; // Mock the expected result
      jest.spyOn(service, 'findOne').mockImplementation(async () => result as any);

      expect(await controller.findOne(commentId)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const createCommentDto = { text: 'New Comment', versionId: 'some-version-id', userId: 'some-user-id' }; // Mock the DTO
      const result = { id: 'new-id', ...createCommentDto }; // Mock the expected result
      jest.spyOn(service, 'create').mockImplementation(async () => result as any);

      expect(await controller.create(createCommentDto as any)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update an existing comment', async () => {
      const commentId = 'some-id';
      const updateCommentDto = { text: 'Updated Comment' }; // Mock the DTO
      const result = { id: commentId, ...updateCommentDto }; // Mock the expected result
      jest.spyOn(service, 'update').mockImplementation(async () => result as any);

      expect(await controller.update(commentId, updateCommentDto as any)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const commentId = 'some-id';
      jest.spyOn(service, 'remove').mockImplementation(async () => undefined as any); // Mock the expected result

      expect(await controller.remove(commentId)).toBeUndefined();
    });
  });

  describe('findByVersion', () => {
    it('should return an array of comments filtered by version', async () => {
      const versionId = 'some-version-id';
      const result = [{ id: '1', text: 'Comment 1', versionId }]; // Mock the expected result
      jest.spyOn(service, 'findByVersion').mockImplementation(async () => result as any);

      expect(await controller.findByVersion(versionId)).toBe(result);
    });
  });

  describe('resolve', () => {
    it('should mark a comment as resolved', async () => {
      const commentId = 'some-id';
      const resolvedBy = 'user-id';
      const result = { id: commentId, resolvedBy, resolvedAt: new Date() }; // Mock the expected result
      jest.spyOn(service, 'resolveComment').mockImplementation(async () => result as any);

      expect(await controller.resolve(commentId, resolvedBy)).toBe(result);
    });
  });

  describe('addReply', () => {
    it('should add a reply to a comment', async () => {
      const commentId = 'some-id';
      const replyData = { text: 'New Reply', versionId: 'some-version-id', userId: 'some-user-id' }; // Mock the DTO
      const result = { id: 'new-reply-id', ...replyData, parentId: commentId }; // Mock the expected result
      jest.spyOn(service, 'addReply').mockImplementation(async () => result as any);

      expect(await controller.addReply(commentId, replyData as any)).toBe(result);
    });
  });

  describe('getThread', () => {
    it('should return a comment thread', async () => {
      const commentId = 'some-id';
      const result = { id: commentId, text: 'Root Comment', replies: [] }; // Mock the expected result
      jest.spyOn(service, 'getCommentThread').mockImplementation(async () => result as any);

      expect(await controller.getThread(commentId)).toBe(result);
    });
  });

  describe('getUnresolved', () => {
    it('should return an array of unresolved comments for a version', async () => {
      const versionId = 'some-version-id';
      const result = [{ id: '1', text: 'Unresolved Comment', versionId, resolvedAt: null }]; // Mock the expected result
      jest.spyOn(service, 'getUnresolvedComments').mockImplementation(async () => result as any);

      expect(await controller.getUnresolved(versionId)).toBe(result);
    });
  });
});
