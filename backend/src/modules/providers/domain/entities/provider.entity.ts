/**
 * Domain Provider Entity thiết kế bằng TypeScript thuần,
 * độc lập hoàn toàn với framework và thư viện cơ sở dữ liệu.
 */
export class Provider {
  id?: number;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    name: string,
    description?: string | null,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.name = name;
    this.description = description;
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
