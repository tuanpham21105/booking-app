export class CreateScheduleDto {
  serviceId: number;
  date: string;
  startTime: string;
  duration: number;
  totalSlots: number;
}
