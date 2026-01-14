/**
 * Seed-skript for Firestore
 * Fyller databasen med test-data
 * 
 * Kjør: node scripts/seed.js (fra prosjektroten)
 */

const admin = require('firebase-admin');
const serviceAccount = require('../scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const seedData = async () => {
  try {
    console.log('🌱 Starter seeding av Firestore...\n');

    // 1) Seed Categories
    console.log('📁 Seeding categories...');
    const categories = [
      { name: 'Elektronikk', icon: '⚡', description: 'Datamaskiner, nettbrett, kameraer', order: 1 },
      { name: 'Verktøy', icon: '🔧', description: 'Håndverktøy, måleinstrumenter', order: 2 },
      { name: 'Laboratoriumutstyr', icon: '🔬', description: 'Vitenskapelig utstyr', order: 3 }
    ];

    for (const cat of categories) {
      const docId = `cat-${cat.name.toLowerCase().replace(/\s+/g, '-')}`;
      await db.collection('categories').doc(docId).set({
        ...cat,
        createdAt: admin.firestore.Timestamp.now()
      });
      console.log(`  ✓ ${cat.name}`);
    }

    // 2) Seed Shelves
    console.log('\n🗃️  Seeding shelves...');
    const shelves = [
      { name: 'Hylle A', location: 'Lagrom 1, Etasje 2', capacity: 50, description: 'Elektronikk' },
      { name: 'Hylle B', location: 'Lagrom 1, Etasje 1', capacity: 40, description: 'Verktøy' },
      { name: 'Hylle C', location: 'Laboratorium', capacity: 30, description: 'Lab-utstyr' }
    ];

    for (const shelf of shelves) {
      const docId = `shelf-${shelf.name.toLowerCase()}`;
      await db.collection('shelves').doc(docId).set({
        ...shelf,
        currentUsage: 0,
        createdAt: admin.firestore.Timestamp.now()
      });
      console.log(`  ✓ ${shelf.name}`);
    }

    // 3) Seed Equipment
    console.log('\n⚙️  Seeding equipment...');
    const equipment = [
      {
        name: 'Laptop Dell XPS 13',
        description: 'Høyytelse bærbar datamaskin',
        category: 'cat-elektronikk',
        manufacturer: 'Dell',
        model: 'XPS 13 (9320)',
        serialNumber: 'DELL-XPS-2025-001',
        barcode: 'P001234567890',
        status: 'available',
        condition: 'excellent',
        shelf: 'shelf-hylle-a',
        location: 'Hylle A, Reol 2',
        totalQuantity: 5,
        quantityAvailable: 3,
        quantityLoaned: 2,
        quantityMaintenance: 0,
        specifications: {
          cpu: 'Intel Core i7-1360P',
          ram: '16GB LPDDR5',
          storage: '512GB NVMe SSD',
          battery: '~12 timer'
        },
        purchaseDate: admin.firestore.Timestamp.fromDate(new Date('2024-06-15')),
        purchasePrice: 12999,
        warrantyExpires: admin.firestore.Timestamp.fromDate(new Date('2026-06-15')),
        requiresSignature: true,
        depositAmount: 2000,
        tags: ['laptop', 'programmering', 'høytytelse'],
        notes: 'Nylig oppgradert SSD',
        isDeprecated: false
      },
      {
        name: 'iPad Pro 12.9"',
        description: 'Tablet for design og koding',
        category: 'cat-elektronikk',
        manufacturer: 'Apple',
        model: 'iPad Pro (6th gen)',
        serialNumber: 'IPAD-PRO-2025-001',
        barcode: 'P002234567891',
        status: 'available',
        condition: 'good',
        shelf: 'shelf-hylle-a',
        location: 'Hylle A, Reol 3',
        totalQuantity: 8,
        quantityAvailable: 6,
        quantityLoaned: 2,
        quantityMaintenance: 0,
        specifications: {
          screenSize: '12.9 tommer',
          storage: '256GB',
          connectivity: 'Wi-Fi only'
        },
        purchaseDate: admin.firestore.Timestamp.fromDate(new Date('2024-09-01')),
        purchasePrice: 8999,
        warrantyExpires: admin.firestore.Timestamp.fromDate(new Date('2025-09-01')),
        requiresSignature: false,
        depositAmount: 1500,
        tags: ['tablet', 'design', 'iOS'],
        notes: '',
        isDeprecated: false
      },
      {
        name: 'Solderingsjern 60W',
        description: 'Professionelt solderingsjern',
        category: 'cat-verktoey',
        manufacturer: 'Weller',
        model: 'WES51',
        serialNumber: 'SOLDER-001',
        barcode: 'P003234567892',
        status: 'available',
        condition: 'excellent',
        shelf: 'shelf-hylle-b',
        location: 'Hylle B, Reol 1',
        totalQuantity: 3,
        quantityAvailable: 3,
        quantityLoaned: 0,
        quantityMaintenance: 0,
        specifications: {},
        purchaseDate: admin.firestore.Timestamp.fromDate(new Date('2023-01-10')),
        purchasePrice: 1499,
        warrantyExpires: admin.firestore.Timestamp.fromDate(new Date('2024-01-10')),
        requiresSignature: false,
        depositAmount: 500,
        tags: ['verktoey', 'elektronikk'],
        notes: 'Må være under tilsyn',
        isDeprecated: false
      }
    ];

    for (const item of equipment) {
      const docRef = db.collection('equipment').doc();
      await docRef.set({
        ...item,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: 'admin-001'
      });
      console.log(`  ✓ ${item.name}`);
    }

    // 4) Seed Users
    console.log('\n👥 Seeding users...');
    const users = [
      {
        email: 'ola.nordmann@elev.tromsfylke.no',
        displayName: 'Ola Nordmann',
        role: 'student',
        isActive: true,
        metadata: { studentId: 'ELV-2025-001', class: '1.år IT', maxLoansAllowed: 5 }
      },
      {
        email: 'kari.andersen@elev.tromsfylke.no',
        displayName: 'Kari Andersen',
        role: 'student',
        isActive: true,
        metadata: { studentId: 'ELV-2025-002', class: '1.år IT', maxLoansAllowed: 5 }
      }
    ];

    for (const user of users) {
      const docRef = db.collection('users').doc();
      await docRef.set({
        ...user,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
      console.log(`  ✓ ${user.displayName}`);
    }

    console.log('\n✅ Seeding fullført!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Feil under seeding:', error);
    process.exit(1);
  }
};

seedData();