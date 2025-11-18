import { RolesMiddleware } from './roles.middleware';

describe('RolesMiddleware', () => {
  it('should be defined', () => {
    expect(new RolesMiddleware()).toBeDefined();
  });
});
