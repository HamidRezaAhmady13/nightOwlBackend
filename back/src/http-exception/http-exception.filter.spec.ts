import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

describe('HttpExceptionFilter', () => {
  it('should be defined', () => {
    expect(new HttpExceptionFilter()).toBeDefined();
  });
});
