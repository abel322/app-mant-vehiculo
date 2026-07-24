'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * Obtiene el vehículo por defecto o crea uno inicial si la base de datos está vacía.
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
                title: 'Cambio de Aceite Sintético',
                targetMileage: 50000,
                targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isCompleted: false,
              },
              {
                title: 'Rotación de Cauchos y Alineación',
                targetMileage: 48000,
                targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                isCompleted: false,
              },
              {
                title: 'Revisión del Sistema de Frenos',
                targetMileage: 52000,
                isCompleted: false,
              },
            ],
          },
          maintenances: {
            create: [
              {
                serviceName: 'Cambio de Aceite Sintético 5W-30',
                category: 'Aceite',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                mileageAtService: 42000,
                cost: 85.00,
                provider: 'Taller Oficial Toyota',
                notes: 'Filtro OEM reemplazado correctamente.',
              },
              {
                serviceName: 'Cambio de Pastillas de Freno Delanteras',
                category: 'Frenos',
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                mileageAtService: 40000,
                cost: 120.50,
                provider: 'Brake Specialist',
                notes: 'Pastillas cerámicas instaladas.',
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
    console.error('Error en getOrCreateVehicle:', error);
    return { success: false, error: 'No se pudo obtener la información del vehículo.' };
  }
}

/**
 * Registra un nuevo mantenimiento en la base de datos (Server Action).
 * Soporta FormData o un objeto JS convencional.
 */
export async function addMaintenanceLog(data) {
  try {
    let vehicleId = '';
    let serviceName = '';
    let category = 'General';
    let mileageAtServiceRaw = 0;
    let costRaw = 0;
    let provider = '';
    let notes = '';
    let dateRaw = '';

    if (data instanceof FormData) {
      vehicleId = data.get('vehicleId');
      serviceName = data.get('serviceName') || data.get('servicio');
      category = data.get('category') || data.get('categoria') || 'General';
      mileageAtServiceRaw = data.get('mileageAtService') || data.get('kilometraje');
      costRaw = data.get('cost') || data.get('costo');
      provider = data.get('provider') || data.get('proveedor') || '';
      notes = data.get('notes') || data.get('notas') || '';
      dateRaw = data.get('date') || data.get('fecha');
    } else if (data && typeof data === 'object') {
      vehicleId = data.vehicleId;
      serviceName = data.serviceName || data.servicio;
      category = data.category || data.categoria || 'General';
      mileageAtServiceRaw = data.mileageAtService || data.kilometraje;
      costRaw = data.cost || data.costo;
      provider = data.provider || data.proveedor || '';
      notes = data.notes || data.notas || '';
      dateRaw = data.date || data.fecha;
    }

    if (!serviceName || !serviceName.trim()) {
      return { success: false, error: 'El nombre del servicio es requerido.' };
    }

    const mileageAtService = parseInt(mileageAtServiceRaw, 10);
    if (isNaN(mileageAtService) || mileageAtService < 0) {
      return { success: false, error: 'El kilometraje ingresado no es válido.' };
    }

    const cost = parseFloat(costRaw);
    if (isNaN(cost) || cost < 0) {
      return { success: false, error: 'El costo ingresado no es válido.' };
    }

    const date = dateRaw ? new Date(dateRaw) : new Date();

    // Guardar en Prisma
    const newLog = await prisma.maintenanceLog.create({
      data: {
        vehicleId,
        serviceName: serviceName.trim(),
        category,
        date,
        mileageAtService,
        cost,
        provider: provider ? provider.trim() : null,
        notes: notes ? notes.trim() : null,
      },
    });

    // Actualizar kilometraje del vehículo si el servicio registró un valor mayor
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (vehicle && mileageAtService > vehicle.currentMileage) {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { currentMileage: mileageAtService },
        });
      }
    }

    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/reminders');

    return { success: true, log: newLog };
  } catch (error) {
    console.error('Error al agregar log de mantenimiento:', error);
    return { success: false, error: 'Ocurrió un error al guardar el registro.' };
  }
}

/**
 * Actualiza el kilometraje actual del vehículo (Server Action).
 */
export async function updateVehicleMileage(vehicleId, newMileage) {
  try {
    const mileageInt = parseInt(newMileage, 10);
    if (isNaN(mileageInt) || mileageInt < 0) {
      return { success: false, error: 'El kilometraje debe ser un número entero válido.' };
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { currentMileage: mileageInt },
    });

    revalidatePath('/');
    revalidatePath('/history');
    revalidatePath('/reminders');

    return { success: true, vehicle: updatedVehicle };
  } catch (error) {
    console.error('Error al actualizar kilometraje:', error);
    return { success: false, error: 'No se pudo actualizar el odómetro del vehículo.' };
  }
}

/**
 * Alterna el estado de completado de un recordatorio (Server Action).
 */
export async function toggleReminderStatus(reminderId) {
  try {
    const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
    if (!reminder) {
      return { success: false, error: 'Recordatorio no encontrado.' };
    }

    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: { isCompleted: !reminder.isCompleted },
    });

    revalidatePath('/');
    revalidatePath('/reminders');

    return { success: true, reminder: updated };
  } catch (error) {
    console.error('Error al cambiar estado del recordatorio:', error);
    return { success: false, error: 'No se pudo cambiar el estado del recordatorio.' };
  }
}
