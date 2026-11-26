import { calculatePagination, toSkipTake } from './pagination.util';

describe('calculatePagination', () => {
  it('should return skip 0 and take 10 for page 1 and limit 10', () => {
    const result = calculatePagination(1, 10);
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  it('should return skip 10 and take 10 for page 2 and limit 10', () => {
    const result = calculatePagination(2, 10);
    expect(result).toEqual({ skip: 10, take: 10 });
  });

  it('should return skip 30 and take 15 for page 3 and limit 15', () => {
    const result = calculatePagination(3, 15);
    expect(result).toEqual({ skip: 30, take: 15 });
  });

  it('should fallback to defaults (page 1, limit 10) when parameters are undefined', () => {
    const result = calculatePagination();
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  it('should fallback to safe values when page or limit is 0 or negative', () => {
    const result = calculatePagination(0, -5);
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  it('should handle floating point numbers by flooring them', () => {
    const result = calculatePagination(2.8, 10.5);
    expect(result).toEqual({ skip: 10, take: 10 });
  });

  it('should work identically with toSkipTake alias', () => {
    expect(toSkipTake(2, 20)).toEqual({ skip: 20, take: 20 });
  });
});
