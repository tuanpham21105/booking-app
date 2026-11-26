/**
 * Chuyển đổi page và limit thành skip và take cho truy vấn phân trang cơ sở dữ liệu.
 * Nhận tham số độc lập trực tiếp từ endpoint, không bọc trong interface hay class.
 *
 * @param page Số thứ tự trang hiện tại (bắt đầu từ 1, mặc định 1)
 * @param limit Số lượng bản ghi trên một trang (mặc định 10)
 * @returns Đối tượng chứa skip và take
 */
export function calculatePagination(
  page: number = 1,
  limit: number = 10,
): { skip: number; take: number } {
  const safePage = Number(page) > 0 ? Math.floor(Number(page)) : 1;
  const safeLimit = Number(limit) > 0 ? Math.floor(Number(limit)) : 10;
  const skip = (safePage - 1) * safeLimit;
  const take = safeLimit;

  return { skip, take };
}

export const toSkipTake = calculatePagination;
