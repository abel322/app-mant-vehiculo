'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * Obtiene todos los recordatorios.
 */
export async function getReminders() {
  try {
    const reminders = await prisma.reminder.findMany({
      orderBy: [
        { isCompleted: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return { success: true, reminders };
  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
    return { success: false, error: 'No se pudieron obtener los recordatorios.' };
  }
}

/**
 * Crea un nuevo recordatorio.
 */
export async function createReminder(data) {
  try {
    const { vehicleId, title, category, targetMileage, targetDate } = data;

    if (!title || !title.trim()) {
      return { success: false, error: 'El título del recordatorio es obligatorio.' };
    }

    const mileageInt = targetMileage ? parseInt(targetMileage, 10) : null;
    const dateObj = targetDate ? new Date(targetDate) : null;

    const newReminder = await prisma.reminder.create({
      data: {
        vehicleId,
        title: title.trim(),
        category: category || 'GENERAL',
        targetMileage: mileageInt,
        targetDate: dateObj,
        isCompleted: false,
      },
    });

    revalidatePath('/');
    revalidatePath('/reminders');

    return { success: true, reminder: newReminder };
  } catch (error) {
    console.error('Error al crear recordatorio:', error);
    return { success: false, error: 'Error al registrar el recordatorio.' };
  }
}

/**
 * Alterna el estado de completado (isCompleted) de un recordatorio.
 */
export async function toggleReminder(id) {
  try {
    const current = await prisma.reminder.findUnique({ where: { id } });
    if (!current) {
      return { success: false, error: 'Recordatorio no encontrado.' };
    }

    const updated = await prisma.reminder.update({
      where: { id },
      data: { isCompleted: !current.isCompleted },
    });

    revalidatePath('/');
    revalidatePath('/reminders');

    return { success: true, reminder: updated };
  } catch (error) {
    console.error('Error al alternar estado del recordatorio:', error);
    return { success: false, error: 'No se pudo actualizar el recordatorio.' };
  }
}

/**
 * Elimina un recordatorio.
 */
export async function deleteReminder(id) {
  try {
    await prisma.reminder.delete({ where: { id } });

    revalidatePath('/');
    revalidatePath('/reminders');

    return { success: true };
  } catch (error) {
    console.error('Error al eliminar recordatorio:', error);
    return { success: false, error: 'No se pudo eliminar el recordatorio.' };
  }
}
