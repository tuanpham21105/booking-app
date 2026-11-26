import {
  convertToDomain,
  convertToDomainList,
  convertToOrm,
  toDomainEntity,
  toDomainList,
  toOrmEntity,
} from './entity-converter.util';

class DummyDomain {
  id?: number;
  name: string;

  constructor(name: string, id?: number) {
    this.name = name;
    this.id = id;
  }

  greet(): string {
    return `Hello, ${this.name}`;
  }
}

class DummyOrm {
  id?: number;
  name!: string;
}

describe('entity-converter.util', () => {
  describe('convertToDomain', () => {
    it('should convert ORM entity to Domain instance preserving prototype and methods', () => {
      const orm: DummyOrm = { id: 1, name: 'Alice' };
      const domain = convertToDomain(DummyDomain, orm);

      expect(domain).toBeInstanceOf(DummyDomain);
      expect(domain.id).toBe(1);
      expect(domain.name).toBe('Alice');
      expect(domain.greet()).toBe('Hello, Alice');
    });

    it('should return null when ormEntity is null or undefined', () => {
      expect(convertToDomain(DummyDomain, null)).toBeNull();
      expect(convertToDomain(DummyDomain, undefined)).toBeNull();
    });

    it('should use customMapper when provided', () => {
      const orm: DummyOrm = { id: 2, name: 'Bob' };
      const domain = convertToDomain(DummyDomain, orm, (o) => new DummyDomain(`Custom ${o.name}`, o.id));

      expect(domain).toBeInstanceOf(DummyDomain);
      expect(domain.name).toBe('Custom Bob');
    });

    it('should support toDomainEntity alias', () => {
      const orm: DummyOrm = { id: 3, name: 'Charlie' };
      const domain = toDomainEntity(DummyDomain, orm);

      expect(domain.name).toBe('Charlie');
    });
  });

  describe('convertToDomainList', () => {
    it('should convert an array of ORM entities to Domain entities', () => {
      const ormList: DummyOrm[] = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const domainList = convertToDomainList(DummyDomain, ormList);

      expect(domainList.length).toBe(2);
      expect(domainList[0]).toBeInstanceOf(DummyDomain);
      expect(domainList[1].name).toBe('Bob');
    });

    it('should support toDomainList alias', () => {
      const ormList: DummyOrm[] = [{ id: 1, name: 'Alice' }];
      expect(toDomainList(DummyDomain, ormList).length).toBe(1);
    });
  });

  describe('convertToOrm', () => {
    it('should convert Domain entity to ORM entity copying non-undefined properties', () => {
      const domain = new DummyDomain('Alice', 1);
      const orm = convertToOrm(DummyOrm, domain);

      expect(orm).toBeInstanceOf(DummyOrm);
      expect(orm.id).toBe(1);
      expect(orm.name).toBe('Alice');
    });

    it('should omit undefined properties', () => {
      const domain = new DummyDomain('Bob');
      const orm = convertToOrm(DummyOrm, domain);

      expect(orm.id).toBeUndefined();
      expect(orm.name).toBe('Bob');
    });

    it('should use customMapper when provided', () => {
      const domain = new DummyDomain('Charlie', 3);
      const orm = convertToOrm(DummyOrm, domain, (d) => {
        const item = new DummyOrm();
        item.id = d.id;
        item.name = `Mapped ${d.name}`;
        return item;
      });

      expect(orm.name).toBe('Mapped Charlie');
    });

    it('should support toOrmEntity alias', () => {
      const domain = new DummyDomain('Dave', 4);
      const orm = toOrmEntity(DummyOrm, domain);

      expect(orm.name).toBe('Dave');
    });
  });
});
