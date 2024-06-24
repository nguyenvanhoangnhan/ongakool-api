import { PaginationQueryDto } from './common.dto';

export function fixPaginationQueryNumber(pagination: PaginationQueryDto) {
  pagination.page = +pagination.page;
  pagination.pageSize = +pagination.pageSize;
}
