/**
 * Hàm tiện ích chung hỗ trợ chuyển đổi 2 chiều giữa Domain Entity và ORM Entity.
 * Đảm bảo tính nhất quán của Clean Architecture và tái sử dụng cho các module.
 */

/**
 * Chuyển đổi từ ORM Entity sang Domain Entity.
 *
 * @param DomainClass Class của Domain Entity cần khởi tạo
 * @param ormEntity Bản ghi từ TypeORM
 * @param customMapper Hàm mapping tùy biến (nếu có trường đặc thù)
 * @returns Domain Entity instance hoặc null nếu ormEntity rỗng
 */
export function convertToDomain<TDomain extends object, TOrm extends object>(
  DomainClass: new (...args: any[]) => TDomain,
  ormEntity: TOrm,
  customMapper?: (orm: TOrm) => TDomain,
): TDomain;
export function convertToDomain<TDomain extends object, TOrm extends object>(
  DomainClass: new (...args: any[]) => TDomain,
  ormEntity: null | undefined,
  customMapper?: (orm: TOrm) => TDomain,
): null;
export function convertToDomain<TDomain extends object, TOrm extends object>(
  DomainClass: new (...args: any[]) => TDomain,
  ormEntity: TOrm | null | undefined,
  customMapper?: (orm: TOrm) => TDomain,
): TDomain | null;
export function convertToDomain<TDomain extends object, TOrm extends object>(
  DomainClass: new (...args: any[]) => TDomain,
  ormEntity: TOrm | null | undefined,
  customMapper?: (orm: TOrm) => TDomain,
): TDomain | null {
  if (!ormEntity) {
    return null;
  }

  if (customMapper) {
    return customMapper(ormEntity);
  }

  const domainInstance = Object.create(DomainClass.prototype) as TDomain;
  return Object.assign(domainInstance, ormEntity);
}

/**
 * Chuyển đổi danh sách ORM Entity sang danh sách Domain Entity.
 *
 * @param DomainClass Class của Domain Entity
 * @param ormEntities Danh sách bản ghi từ TypeORM
 * @param customMapper Hàm mapping tùy biến (tùy chọn)
 * @returns Mảng các Domain Entity
 */
export function convertToDomainList<TDomain extends object, TOrm extends object>(
  DomainClass: new (...args: any[]) => TDomain,
  ormEntities: TOrm[],
  customMapper?: (orm: TOrm) => TDomain,
): TDomain[] {
  return ormEntities.map((entity) => convertToDomain(DomainClass, entity, customMapper));
}

/**
 * Chuyển đổi từ Domain Entity sang ORM Entity.
 *
 * @param OrmClass Class của TypeORM Entity
 * @param domainEntity Thực thể nghiệp vụ từ tầng Domain
 * @param customMapper Hàm mapping tùy biến (tùy chọn)
 * @returns Instance của ORM Entity
 */
export function convertToOrm<TOrm extends object, TDomain extends object>(
  OrmClass: new () => TOrm,
  domainEntity: TDomain,
  customMapper?: (domain: TDomain) => TOrm,
): TOrm {
  if (customMapper) {
    return customMapper(domainEntity);
  }

  const ormInstance = new OrmClass();
  for (const [key, value] of Object.entries(domainEntity)) {
    if (value !== undefined) {
      (ormInstance as Record<string, unknown>)[key] = value;
    }
  }

  return ormInstance;
}

export const toDomainEntity = convertToDomain;
export const toDomainList = convertToDomainList;
export const toOrmEntity = convertToOrm;
