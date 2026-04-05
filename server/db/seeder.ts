import 'dotenv/config';

import { eq } from 'drizzle-orm';
import { db } from './client';
import { libraries, librarySeats, reservations, users } from './schemas';

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

  // --- LIBRARIES ---
  const [centralLibrary] = await db
    .insert(libraries)
    .values({
      name: 'Central Library',
      slug: 'central-library',
      location: 'Main Campus, Building A',
      // You can use this in the UI as a hero/banner image
      // image URL is stored only in the frontend for now
    })
    .returning();

  const [scienceLibrary] = await db
    .insert(libraries)
    .values({
      name: 'Science & Technology Library',
      slug: 'science-library',
      location: 'Science Block, 3rd Floor',
    })
    .returning();

  console.log('Libraries seeded:', {
    centralLibrary: centralLibrary?.id,
    scienceLibrary: scienceLibrary?.id,
  });

  // --- SEATS ---
  const centralSeats = await db
    .insert(librarySeats)
    .values([
      {
        libraryId: centralLibrary!.id,
        slug: 'c-a-01',
        code: 'C-A-01',
        label: 'Ground Floor - Window Seat 1',
        type: 'individual',
        floor: 1,
        area: 'Quiet Zone',
      },
      {
        libraryId: centralLibrary!.id,
        slug: 'c-a-02',
        code: 'C-A-02',
        label: 'Ground Floor - Window Seat 2',
        type: 'individual',
        floor: 1,
        area: 'Quiet Zone',
      },
      {
        libraryId: centralLibrary!.id,
        slug: 'c-g-01',
        code: 'C-G-01',
        label: 'Group Study Table 1',
        type: 'group',
        floor: 2,
        area: 'Group Study',
      },
    ])
    .returning();

  const scienceSeats = await db
    .insert(librarySeats)
    .values([
      {
        libraryId: scienceLibrary!.id,
        slug: 's-pc-01',
        code: 'S-PC-01',
        label: 'Computer Seat 1',
        type: 'computer',
        floor: 3,
        area: 'Computer Lab',
      },
      {
        libraryId: scienceLibrary!.id,
        slug: 's-pc-02',
        code: 'S-PC-02',
        label: 'Computer Seat 2',
        type: 'computer',
        floor: 3,
        area: 'Computer Lab',
      },
    ])
    .returning();

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

  const [sampleReservation] = await db
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

  const [tomorrowReservation] = await db
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
