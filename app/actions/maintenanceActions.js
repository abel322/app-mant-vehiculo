'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * Obtiene todos los registros de mantenimiento ordenados por fecha descendente.
 */
export async function getMaintenanceLogs(categoryFilter = 'ALL') {
  try {
    const where = categoryFilter && categoryFilter !== 'ALL' 
      ? { category: categoryFilter }
      : {};

    const logs = await prisma.maintenanceLog.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { vehicle: true },
    });

    return { success: true, logs };
  } catch (error) {
    console.error('Error al obtener mantenimientos:', error);
    return { success: false, error: 'Error al consultar historial de mantenimientos.' };
  }
}

/**
 * Crea un nuevo registro de mantenimiento y actualiza automáticamente el kilometraje del vehículo si es mayor.
 */
export async function createMaintenanceLog(data) {
  try {
    const { vehicleId, serviceName, category, date, mileageAtService, cost, provider } = data;

    if (!serviceName || !serviceName.trim()) {
      return { success: false, error: 'El nombre del servicio es obligatorio.' };
    }

    const mileageInt = parseInt(mileageAtService, 10);
    const costFloat = parseFloat(cost);
    const dateObj = date ? new Date(date) : new Date();

    if (isNaN(mileageInt) || mileageInt < 0) {
      return { success: false, error: 'Indica un kilometraje válido.' };
    }

    if (isNaN(costFloat) || costFloat < 0) {
      return { success: false, error: 'Indica un costo válido.' };
    }

    // Guardar log de mantenimiento
    const newLog = await prisma.maintenanceLog.create({
      data: {
        vehicleId,
        serviceName: serviceName.trim(),
        category: category || 'GENERAL',
        date: dateObj,
        mileageAtService: mileageInt,
        cost: costFloat,
        provider: provider ? provider.trim() : '',
      },
    });

    // Actualizar kilometraje del vehículo si el servicio registró un valor mayor
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (vehicle && mileageInt > vehicle.currentMileage) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { currentMileage: mileageInt },
      });
    }

    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/reminders');

    return { success: true, log: newLog };
  } catch (error) {
    console.error('Error al crear mantenimiento:', error);
    return { success: false, error: 'Error al registrar el mantenimiento en la base de datos.' };
  }
}

/**
 * Elimina un registro de mantenimiento por ID.
 */
export async function deleteMaintenanceLog(id) {
  try {
    await prisma.maintenanceLog.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/history');

    return { success: true };
  } catch (error) {
    console.error('Error al eliminar mantenimiento:', error);
    return { success: false, error: 'No se pudo eliminar el registro.' };
  }
}
