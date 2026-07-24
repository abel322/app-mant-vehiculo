import { getOrCreateVehicle } from '@/app/actions/vehicleActions';
import { getReminders } from '@/app/actions/reminderActions';
import RemindersClient from './RemindersClient';

export const revalidate = 0;

export default async function RemindersPage() {
  const vehicleRes = await getOrCreateVehicle();
  const remindersRes = await getReminders();

  const vehicle = vehicleRes.vehicle || { id: 'demo', currentMileage: 45000 };
  const reminders = remindersRes.reminders || [];

  return <RemindersClient vehicleId={vehicle.id} currentMileage={vehicle.currentMileage} initialReminders={reminders} />;
}
