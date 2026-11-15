import { ShipmentStatus } from '@prisma/client';

export const DEPARTMENT_KEYWORDS = {
  VENDOR_COORDINATION: 'Điều phối',
  SHIPPING: 'Vận chuyển',
  DELIVERY: 'Giao nhận',
  EXCEPTION: 'Sự cố',
} as const;

export const ACTIVE_SHIPMENT_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.assigned,
  ShipmentStatus.picking_up,
  ShipmentStatus.in_transit,
  ShipmentStatus.out_for_delivery,
];

export function isShippingDept(department?: string | null): boolean {
  if (!department) return false;
  const lower = department.toLowerCase();
  return lower.includes('vận chuyển') || lower.includes('giao nhận');
}

export function isHandlingDept(department?: string | null): boolean {
  if (!department) return false;
  const lower = department.toLowerCase();
  return lower.includes('điều phối') || lower.includes('vendor');
}

export function isExceptionDept(department?: string | null): boolean {
  if (!department) return false;
  const lower = department.toLowerCase();
  return lower.includes('sự cố') || lower.includes('ngoại lệ');
}

export type ShipperCandidate = {
  id: string;
  fullName: string;
  employeeCode: string;
  department: string;
  phone: string | null;
  assignedOrderScope?: string;
  status?: string;
  deletedAt?: Date | null;
  assignedShipments?: Array<{ id: string }>;
};

export type ShipperPoolState = {
  candidates: ShipperCandidate[];
  loadMap: Map<string, number>;
  pickedInBatch: Set<string>;
};

const SHIPPER_CANDIDATE_SELECT = {
  id: true,
  fullName: true,
  employeeCode: true,
  department: true,
  phone: true,
  assignedOrderScope: true,
  status: true,
  deletedAt: true,
} as const;

/**
 * Nạp danh sách bưu tá đang hoạt động và số lượng vận đơn đang giao của từng người bằng `shipment.groupBy`
 * (chỉ tốn 2 truy vấn thay vì N+1 `findBestShipperEmployee` trong các vòng lặp).
 */
export async function loadShipperPoolWithLoads(
  db: any,
  options?: {
    excludeEmployeeId?: string;
    fallbackToAnyActive?: boolean;
  },
): Promise<ShipperPoolState> {
  const excludeEmployeeId = options?.excludeEmployeeId;
  let candidates: ShipperCandidate[] = await db.employee.findMany({
    where: {
      status: 'active',
      deletedAt: null,
      OR: [
        {
          department: {
            contains: DEPARTMENT_KEYWORDS.SHIPPING,
            mode: 'insensitive',
          },
        },
        {
          department: {
            contains: DEPARTMENT_KEYWORDS.DELIVERY,
            mode: 'insensitive',
          },
        },
      ],
      ...(excludeEmployeeId ? { id: { not: excludeEmployeeId } } : {}),
    },
    select: SHIPPER_CANDIDATE_SELECT,
  });

  if (candidates.length === 0 && options?.fallbackToAnyActive) {
    candidates = await db.employee.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        ...(excludeEmployeeId ? { id: { not: excludeEmployeeId } } : {}),
      },
      select: SHIPPER_CANDIDATE_SELECT,
    });
  }

  const loadMap = new Map<string, number>();
  if (candidates.length > 0) {
    if (typeof db.shipment?.groupBy === 'function') {
      const grouped = await db.shipment.groupBy({
        by: ['carrierId'],
        where: {
          carrierId: { in: candidates.map((c) => c.id) },
          status: { in: ACTIVE_SHIPMENT_STATUSES },
        },
        _count: { _all: true },
      });
      for (const row of grouped) {
        if (row.carrierId) {
          loadMap.set(row.carrierId, Number(row._count?._all ?? 0));
        }
      }
    } else {
      for (const candidate of candidates) {
        if (Array.isArray(candidate.assignedShipments)) {
          loadMap.set(candidate.id, candidate.assignedShipments.length);
        }
      }
    }
  }

  return {
    candidates,
    loadMap,
    pickedInBatch: new Set<string>(),
  };
}

/**
 * Chọn bưu tá có tải thấp nhất từ `ShipperPoolState` trong bộ nhớ và tự động tăng tải cho lượt chọn kế tiếp.
 */
export function pickNextShipperFromPool(
  pool: ShipperPoolState,
  options?: {
    excludeEmployeeId?: string;
    preferExcludeIds?: Iterable<string>;
    extraLoadMap?: Map<string, number>;
    incrementLoad?: boolean;
  },
): ShipperCandidate | null {
  const available = options?.excludeEmployeeId
    ? pool.candidates.filter((c) => c.id !== options.excludeEmployeeId)
    : pool.candidates;

  if (!available.length) return null;

  const scopedCouriers = available.filter(
    (c) => !c.assignedOrderScope || c.assignedOrderScope !== 'all_orders',
  );
  const rolePool = scopedCouriers.length > 0 ? scopedCouriers : available;

  const excludedSet = new Set<string>(pool.pickedInBatch);
  if (options?.preferExcludeIds) {
    for (const id of options.preferExcludeIds) {
      excludedSet.add(id);
    }
  }

  const unpicked =
    excludedSet.size > 0
      ? rolePool.filter((c) => !excludedSet.has(c.id))
      : rolePool;
  const targetPool = unpicked.length > 0 ? unpicked : rolePool;

  const getLoad = (c: ShipperCandidate) =>
    (pool.loadMap.get(c.id) ?? 0) + (options?.extraLoadMap?.get(c.id) ?? 0);

  let minLoad = Infinity;
  for (const c of targetPool) {
    const load = getLoad(c);
    if (load < minLoad) minLoad = load;
  }

  const leastBusy = targetPool.filter((c) => getLoad(c) === minLoad);
  const chosen = leastBusy[Math.floor(Math.random() * leastBusy.length)];

  if (chosen && options?.incrementLoad !== false) {
    pool.pickedInBatch.add(chosen.id);
    pool.loadMap.set(chosen.id, (pool.loadMap.get(chosen.id) ?? 0) + 1);
  }

  return chosen ?? null;
}

