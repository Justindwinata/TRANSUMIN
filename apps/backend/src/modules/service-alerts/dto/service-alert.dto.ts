export class ServiceAlertDto {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  severity: string;
  status: string;
  source: string;
  operatorName?: string | null;
  affectedRoute?: string | null;
  affectedStop?: string | null;
  createdAt: string;
}

export const serviceAlertToDto = (row: {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date | null;
  severity: string;
  status: string;
  source: string;
  operatorName?: string | null;
  affectedRoute?: string | null;
  affectedStop?: string | null;
  createdAt: Date;
}): ServiceAlertDto => ({
  id: row.id,
  title: row.title,
  description: row.description,
  startsAt: row.startsAt.toISOString(),
  endsAt: row.endsAt ? row.endsAt.toISOString() : null,
  severity: row.severity,
  status: row.status,
  source: row.source,
  operatorName: row.operatorName ?? null,
  affectedRoute: row.affectedRoute ?? null,
  affectedStop: row.affectedStop ?? null,
  createdAt: row.createdAt.toISOString(),
});
