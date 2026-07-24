import { getOrCreateVehicle } from '@/app/actions';
import DashboardClient from './DashboardClient';

export const revalidate = 0;

export default async function DashboardPage() {
  const res = await getOrCreateVehicle();
  const vehicle = res.vehicle || {
    id: '',
    make: 'Toyota',
    model: 'Corolla Cross',
    year: 2024,
    plate: 'ABC-123',
    currentMileage: 45000,
    maintenances: [],
    reminders: [],
  };

  return <DashboardClient initialVehicle={vehicle} />;
}
