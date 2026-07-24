'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * Obtiene el vehículo principal o crea uno por defecto si no existe ninguno.
 */
export async function getOrCreateVehicle() {
  try {
    let vehicle = await prisma.vehicle.findFirst({
      include: {
        maintenances: {
          orderBy: { date: 'desc' },
        },
        reminders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          make: 'Toyota',
          model: 'Corolla Cross',
          year: 2024,
          plate: 'ABC-123',
          currentMileage: 45000,
          reminders: {
            create: [
              {
                title: 'Cambio de Aceite de Motor 10,000 km',
                category: 'OIL_CHANGE',
                targetMileage: 50000,
                targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
                isCompleted: false,
              },
              {
                title: 'Rotación y Balanceo de Neumáticos',
                category: 'TIRES',
                targetMileage: 48000,
                targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // +15 días
                isCompleted: false,
              },
              {
                title: 'Inspección de Pastillas de Freno',
                category: 'BRAKES',
                targetMileage: 52000,
                targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // +60 días
                isCompleted: false,
              },
            ],
          },
          maintenances: {
            create: [
              {
                serviceName: 'Cambio de Aceite Sintético 5W-30',
                category: 'OIL_CHANGE',
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                mileageAtService: 40000,
                cost: 85.50,
                provider: 'Taller Oficial Toyota - Filtro de aceite OEM',
              },
              {
                serviceName: 'Sustitución de Filtro de Aire y Cabina',
                category: 'FILTER',
                date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                mileageAtService: 38000,
                cost: 45.00,
                provider: 'AutoZone Parts',
              },
            ],
          },
        },
        include: {
          maintenances: true,
          reminders: true,
        },
      });
    }

    return { success: true, vehicle };
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    return { success: false, error: 'No se pudo cargar el vehículo.' };
  }
}

/**
 * Actualiza el kilometraje actual del vehículo.
 */
export async function updateVehicleMileage(id, newMileage) {
  try {
    const mileageInt = parseInt(newMileage, 10);
    if (isNaN(mileageInt) || mileageInt < 0) {
      return { success: false, error: 'El kilometraje ingresado no es válido.' };
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { currentMileage: mileageInt },
    });

    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/reminders');

    return { success: true, vehicle: updated };
  } catch (error) {
    console.error('Error al actualizar kilometraje:', error);
    return { success: false, error: 'No se pudo actualizar el kilometraje.' };
  }
}
