import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { permissions } = await request.json();
    const { userId } = params;

    // Validate input
    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Los permisos deben ser un array' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Delete existing permissions
    await prisma.userPermission.deleteMany({
      where: { userId }
    });

    // Add new permissions
    if (permissions.length > 0) {
      const permissionData = permissions.map((permissionId: string) => ({
        userId,
        permissionId
      }));

      await prisma.userPermission.createMany({
        data: permissionData
      });
    }

    return NextResponse.json({ message: 'Permisos actualizados' });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}