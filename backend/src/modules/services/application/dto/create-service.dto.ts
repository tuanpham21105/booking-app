export class CreateServiceDto {
  providerId: number;
  name: string;
  price: number;
  description?: string | null;
}
