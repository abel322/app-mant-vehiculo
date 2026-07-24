import { getMaintenanceLogs } from '@/app/actions/maintenanceActions';
import HistoryClient from './HistoryClient';

export const revalidate = 0;

export default async function HistoryPage() {
  const res = await getMaintenanceLogs('ALL');
  const logs = res.logs || [];

  return <HistoryClient initialLogs={logs} />;
}
