import { Badge } from '@/components/ui';
import { VisitStatusConfig } from '@/theme/colors';
import type { VisitStatus } from '@/types/visit.types';

interface Props {
  status: VisitStatus;
}

export function VisitStatusBadge({ status }: Props) {
  // runtime fallback if server returns an unknown status not yet in the enum
  const config = VisitStatusConfig[status] ?? VisitStatusConfig.NOT_STARTED;
  return (
    <Badge
      label={config.label}
      color={config.color}
      backgroundColor={config.dim}
    />
  );
}
