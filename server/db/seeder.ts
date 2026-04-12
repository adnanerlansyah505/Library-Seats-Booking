import 'dotenv/config';

import { and, eq } from 'drizzle-orm';
import { db } from './client';
import { libraries, librarySeats, profiles, reservations, users } from './schemas';

async function main() {
  console.log('Seeding database with demo data...');

  // --- USERS --- (idempotent: works even if users already exist)
  let [admin] = await db
    .insert(users)
    .values({
      studentId: 'ADMIN-0001',
      email: 'admin@example.com',
      username: 'admin',
      password: 'password-hash-admin', // TODO: replace with a real hash
      role: 'admin',
      isEmailVerified: true,
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  if (!admin) {
    admin = await db.query.users.findFirst({
      where: eq(users.email, 'admin@example.com'),
    });
  }

  let [student] = await db
    .insert(users)
    .values({
      studentId: 'STU-0001',
      email: 'student@example.com',
      username: 'student',
      password: 'password-hash-student', // TODO: replace with a real hash
      role: 'student',
      isEmailVerified: true,
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  if (!student) {
    student = await db.query.users.findFirst({
      where: eq(users.email, 'student@example.com'),
    });
  }

  console.log('Users seeded:', { admin: admin?.id, student: student?.id });

  // --- PROFILES --- (optional, but keeps the new `profiles` table in sync)
  if (admin) {
    await db
      .insert(profiles)
      .values({
        userId: admin.id,
        firstName: 'Admin',
        lastName: 'User',
        phone: '000-000-0000',
        address: 'Main Campus',
      })
      .onConflictDoNothing({ target: profiles.userId });
  }

  if (student) {
    await db
      .insert(profiles)
      .values({
        userId: student.id,
        firstName: 'Student',
        lastName: 'User',
        phone: '111-111-1111',
        address: 'Student Housing',
      })
      .onConflictDoNothing({ target: profiles.userId });
  }

  // --- LIBRARIES --- (upsert by slug so seeding is idempotent and picks up schema changes)
  const [centralLibrary] = await db
    .insert(libraries)
    .values({
      name: 'Central Library',
      slug: 'central-library',
      location: 'Main Campus, Building A',
      // You can use this in the UI as a hero/banner image
      // image URL is stored only in the frontend for now
    })
    .onConflictDoUpdate({
      target: libraries.slug,
      set: {
        name: 'Central Library',
        location: 'Main Campus, Building A',
      },
    })
    .returning();

  const [scienceLibrary] = await db
    .insert(libraries)
    .values({
      name: 'Science & Technology Library',
      slug: 'science-library',
      location: 'Science Block, 3rd Floor',
    })
    .onConflictDoUpdate({
      target: libraries.slug,
      set: {
        name: 'Science & Technology Library',
        location: 'Science Block, 3rd Floor',
      },
    })
    .returning();

  console.log('Libraries seeded:', {
    centralLibrary: centralLibrary?.id,
    scienceLibrary: scienceLibrary?.id,
  });

  // --- SEATS --- (upsert by slug so existing rows get updated with new schedule fields)
  const centralSeatDefinitions = [
    {
      slug: 'c-a-01',
      code: 'C-A-01',
      label: 'Ground Floor - Window Seat 1',
      type: 'individual' as const,
      floor: 1,
      area: 'Quiet Zone',
      openingHours: '08:00-18:00',
      openTime: '08:00:00',
      closeTime: '18:00:00',
      isActive: true,
    },
    {
      slug: 'c-a-02',
      code: 'C-A-02',
      label: 'Ground Floor - Window Seat 2',
      type: 'individual' as const,
      floor: 1,
      area: 'Quiet Zone',
      openingHours: '08:00-18:00',
      openTime: '08:00:00',
      closeTime: '18:00:00',
      isActive: true,
    },
    {
      slug: 'c-g-01',
      code: 'C-G-01',
      label: 'Group Study Table 1',
      type: 'group' as const,
      floor: 2,
      area: 'Group Study',
      openingHours: '09:00-20:00',
      openTime: '09:00:00',
      closeTime: '20:00:00',
      isActive: true,
    },
  ];

  const centralSeats: { id: number }[] = [];
  for (const def of centralSeatDefinitions) {
    const [seat] = await db
      .insert(librarySeats)
      .values({
        libraryId: centralLibrary!.id,
        ...def,
      })
      .onConflictDoUpdate({
        target: librarySeats.slug,
        set: {
          libraryId: centralLibrary!.id,
          code: def.code,
          label: def.label,
          type: def.type,
          floor: def.floor,
          area: def.area,
          openingHours: def.openingHours,
          openTime: def.openTime,
          closeTime: def.closeTime,
          isActive: def.isActive,
        },
      })
      .returning();

    if (seat) centralSeats.push(seat);
  }

  const scienceSeatDefinitions = [
    {
      slug: 's-pc-01',
      code: 'S-PC-01',
      label: 'Computer Seat 1',
      type: 'computer' as const,
      floor: 3,
      area: 'Computer Lab',
      openingHours: '08:00-22:00',
      openTime: '08:00:00',
      closeTime: '22:00:00',
      isActive: true,
    },
    {
      slug: 's-pc-02',
      code: 'S-PC-02',
      label: 'Computer Seat 2',
      type: 'computer' as const,
      floor: 3,
      area: 'Computer Lab',
      openingHours: '08:00-22:00',
      openTime: '08:00:00',
      closeTime: '22:00:00',
      isActive: true,
    },
  ];

  const scienceSeats: { id: number }[] = [];
  for (const def of scienceSeatDefinitions) {
    const [seat] = await db
      .insert(librarySeats)
      .values({
        libraryId: scienceLibrary!.id,
        ...def,
      })
      .onConflictDoUpdate({
        target: librarySeats.slug,
        set: {
          libraryId: scienceLibrary!.id,
          code: def.code,
          label: def.label,
          type: def.type,
          floor: def.floor,
          area: def.area,
          openingHours: def.openingHours,
          openTime: def.openTime,
          closeTime: def.closeTime,
          isActive: def.isActive,
        },
      })
      .returning();

    if (seat) scienceSeats.push(seat);
  }

  console.log('Seats seeded:', {
    centralSeats: centralSeats.map((s) => s.id),
    scienceSeats: scienceSeats.map((s) => s.id),
  });

  // --- RESERVATIONS (BOOKINGS) ---
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Drizzle's `date()` columns are typed as strings, while `timestamp()` uses Date.
  const toDateOnly = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD

  if (!admin || !student) {
    throw new Error('Admin or student user missing; seeder could not retrieve user records.');
  }

  // Make reservation seeding idempotent as well (one booking for today and one for tomorrow)
  const existingTodayReservation = await db.query.reservations.findFirst({
    where: and(
      eq(reservations.userId, student.id),
      eq(reservations.libraryId, centralLibrary!.id),
      eq(reservations.seatId, centralSeats[0]!.id),
      eq(reservations.reservedDate, toDateOnly(today)),
    ),
  });

  const [sampleReservation] = existingTodayReservation
    ? [existingTodayReservation]
    : await db
        .insert(reservations)
        .values({
          userId: student.id,
          libraryId: centralLibrary!.id,
          seatId: centralSeats[0]!.id,
          seatNumber: 1,
          reservedAt: now,
          reservedDate: toDateOnly(today),
          startTime: now,
          endTime: now,
          status: 'confirmed',
        })
        .returning();

  const existingTomorrowReservation = await db.query.reservations.findFirst({
    where: and(
      eq(reservations.userId, student.id),
      eq(reservations.libraryId, scienceLibrary!.id),
      eq(reservations.seatId, scienceSeats[0]!.id),
      eq(reservations.reservedDate, toDateOnly(tomorrow)),
    ),
  });

  const [tomorrowReservation] = existingTomorrowReservation
    ? [existingTomorrowReservation]
    : await db
        .insert(reservations)
        .values({
          userId: student.id,
          libraryId: scienceLibrary!.id,
          seatId: scienceSeats[0]!.id,
          seatNumber: 1,
          reservedAt: now,
          reservedDate: toDateOnly(tomorrow),
          startTime: now,
          endTime: now,
          status: 'pending',
        })
        .returning();

  console.log('Reservations seeded:', {
    sampleReservation: sampleReservation?.id,
    tomorrowReservation: tomorrowReservation?.id,
  });

  console.log('Seeding complete.');
}

main()
  .catch((err) => {
    console.error('Seeder failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    // drizzle-orm/node-postgres uses pg.Pool internally through our client
    // closing the pool is handled automatically when the process exits,
    // but we can still end the process explicitly.
    console.log('Seeder finished.');
  });
