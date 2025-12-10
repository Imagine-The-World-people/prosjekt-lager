/**
 * Firestore Database Schema
 * Definerer alle collections, documents, og deres feltstruktur
 * 
 * Collections:
 * - users (brukere/elever)
 * - equipment (utstyr/produkter)
 * - loans (utlån-transaksjoner)
 * - categories (kategori for utstyr)
 * - shelves (hyller/lagerplass)
 * - audit_logs (revisjonlogg)
 */

export const firestoreSchema = {
  /**
   * USERS Collection
   * Lagrer info om alle brukere (elever, lærere, admin)
   */
  users: {
    collectionName: 'users',
    documentStructure: {
      // Auto ID: uid fra Firebase Auth
      uid: 'string (auto)',
      email: 'string (email)',
      displayName: 'string (fullt navn)',
      phoneNumber: 'string (mobilnummer)',
      role: 'string (enum: "student", "teacher", "admin")',
      department: 'string (avdeling/klasse)',
      isActive: 'boolean (true hvis bruker kan låne)',
      createdAt: 'timestamp (registreringsdato)',
      updatedAt: 'timestamp (sist endret)',
      lastLoginAt: 'timestamp (sist innlogging)',
      metadata: {
        studentId: 'string (elev-ID fra skolen)',
        class: 'string (klasse, f.eks 1.år IT)',
        maxLoansAllowed: 'number (max antall samtidige utlån)',
        totalLoansLifetime: 'number (totalt antall utlån all time)'
      },
      settings: {
        emailNotifications: 'boolean',
        smsNotifications: 'boolean',
        loanReminderDays: 'number (påminnelse X dager før forfallsdato)'
      }
    },
    exampleDoc: {
      uid: 'user-12345',
      email: 'ola.nordmann@elev.tromsfylke.no',
      displayName: 'Ola Nordmann',
      phoneNumber: '+47 98765432',
      role: 'student',
      department: 'IT-avdelingen',
      isActive: true,
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-12-08'),
      lastLoginAt: new Date('2025-12-08T10:30:00Z'),
      metadata: {
        studentId: 'ELV-2025-001',
        class: '1.år IT',
        maxLoansAllowed: 5,
        totalLoansLifetime: 12
      },
      settings: {
        emailNotifications: true,
        smsNotifications: false,
        loanReminderDays: 3
      }
    }
  },

  /**
   * EQUIPMENT Collection
   * Lagrer info om alt utstyr som kan lånes ut
   */
  equipment: {
    collectionName: 'equipment',
    documentStructure: {
      // Auto ID: equipment-12345
      id: 'string (auto)',
      name: 'string (navn på utstyret)',
      description: 'string (kort beskrivelse)',
      category: 'string (ref til categories collection)',
      subcategory: 'string (underkategori)',
      manufacturer: 'string (produsent)',
      model: 'string (modellnummer)',
      serialNumber: 'string (UNIK serienummer for tracking)',
      barcode: 'string (strekkode EAN/QR for scanner)',
      
      // Tilstand og status
      status: 'string (enum: "available", "loaned", "maintenance", "damaged", "retired")',
      condition: 'string (enum: "excellent", "good", "fair", "poor")',
      
      // Lagring
      shelf: 'string (ref til shelves collection - hvor det ligger)',
      location: 'string (hylle nr., reol nr., osv.)',
      
      // Mengde
      totalQuantity: 'number (totalt antall enheter av denne typen)',
      quantityAvailable: 'number (hvor mange som er tilgjengelig nå)',
      quantityLoaned: 'number (hvor mange som er utlånt)',
      quantityMaintenance: 'number (under vedlikehold)',
      
      // Spesifikasjoner (dynamisk avhengig av kategori)
      specifications: {
        // For laptops:
        cpu: 'string (prosessor)',
        ram: 'string (RAM, f.eks "16GB")',
        storage: 'string (lagring, f.eks "512GB SSD")',
        gpu: 'string (grafikkort)',
        battery: 'string (batteritid)',
        
        // For tablets/iPad:
        screenSize: 'string (skjermstørrelse)',
        storage: 'string (intern lagring)',
        connectivity: 'string ("Wi-Fi only" eller "Wi-Fi + LTE")',
        
        // For kameraer:
        megapixels: 'string',
        sensorSize: 'string',
        lensType: 'string'
      },
      
      // Vedlikehold og kostnad
      purchaseDate: 'date (kjøpsdato)',
      purchasePrice: 'number (kostnad)',
      warrantyExpires: 'date (garantiperiode utløper)',
      maintenanceSchedule: 'string (vedlikeholdsplan)',
      lastMaintenanceDate: 'date (sist vedlikeholdt)',
      estimatedLifespan: 'number (levetid i år)',
      
      // Sikkerhet
      requiresSignature: 'boolean (kreves underskrift ved utlån)',
      depositAmount: 'number (depositum hvis aktuelt)',
      insuranceValue: 'number (forsikringsverdi)',
      
      // Metadata
      tags: 'array<string> (søkbare tagger)',
      notes: 'string (andre merknadinger)',
      isDeprecated: 'boolean (hvis utstyret er utfaset)',
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      createdBy: 'string (ref til user som lagt det til)',
      updatedBy: 'string (ref til user som sist endret)'
    },
    exampleDoc: {
      id: 'eq-laptop-001',
      name: 'Laptop Dell XPS 13',
      description: 'Høyytelse bærbar datamaskin for programmering',
      category: 'elektronikk',
      subcategory: 'datamaskiner',
      manufacturer: 'Dell',
      model: 'XPS 13 (9320)',
      serialNumber: 'DELL-XPS-2025-001',
      barcode: 'P001234567890',
      
      status: 'available',
      condition: 'excellent',
      
      shelf: 'shelf-main-01',
      location: 'Hylle A, Reol 2, Plass 3',
      
      totalQuantity: 5,
      quantityAvailable: 3,
      quantityLoaned: 2,
      quantityMaintenance: 0,
      
      specifications: {
        cpu: 'Intel Core i7-1360P',
        ram: '16GB LPDDR5',
        storage: '512GB NVMe SSD',
        gpu: 'Intel Iris Xe',
        battery: '~12 timer'
      },
      
      purchaseDate: new Date('2024-06-15'),
      purchasePrice: 12999,
      warrantyExpires: new Date('2026-06-15'),
      maintenanceSchedule: 'Årlig',
      lastMaintenanceDate: new Date('2025-10-01'),
      estimatedLifespan: 4,
      
      requiresSignature: true,
      depositAmount: 2000,
      insuranceValue: 15000,
      
      tags: ['laptop', 'programmering', 'høytytelse', 'bærbar'],
      notes: 'Nylig oppgradert med ny SSD. Krever USB-C dock for tilkobling.',
      isDeprecated: false,
      createdAt: new Date('2024-06-15'),
      updatedAt: new Date('2025-12-08'),
      createdBy: 'admin-001',
      updatedBy: 'admin-001'
    }
  },

  /**
   * LOANS Collection
   * Registrerer alle utlån-transaksjoner (historikk + aktive)
   */
  loans: {
    collectionName: 'loans',
    documentStructure: {
      // Auto ID: loan-12345
      id: 'string (auto)',
      loanDate: 'timestamp (når utstyret ble lånt ut)',
      dueDate: 'timestamp (når det skal returneres)',
      returnDate: 'timestamp (når det faktisk ble returnert, null hvis ikke returnert)',
      
      // Referanser
      userId: 'string (ref til users)',
      equipmentId: 'string (ref til equipment)',
      
      // Bruker-info (snapshot på utlånstidspunktet)
      userSnapshot: {
        uid: 'string',
        email: 'string',
        displayName: 'string'
      },
      
      // Utstyr-info (snapshot)
      equipmentSnapshot: {
        id: 'string',
        name: 'string',
        serialNumber: 'string'
      },
      
      // Status
      status: 'string (enum: "active", "overdue", "returned", "lost", "damaged")',
      isOverdue: 'boolean (beregnet: dueDate < now && status !== "returned")',
      daysOverdue: 'number (daysOverdue = now - dueDate)',
      
      // Betingelser
      signedBy: 'string (bruker som confirmerte utlån)',
      signatureUrl: 'string (URL til digital signatur)',
      depositPaid: 'boolean (depositum betalt)',
      depositAmount: 'number',
      
      // Tilstand ved retur
      conditionAtReturn: 'string (enum: "excellent", "good", "fair", "poor", "damaged")',
      damageNotes: 'string (hvis utstyr er skadet)',
      damageCost: 'number (kostnad for reparasjon)',
      
      // Admin-notater
      notes: 'string',
      checkedOutBy: 'string (ref til admin som utstedte)',
      checkedInBy: 'string (ref til admin som mottok retur)',
      
      // Metadata
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    exampleDoc: {
      id: 'loan-2025-001',
      loanDate: new Date('2025-12-08T10:30:00Z'),
      dueDate: new Date('2025-12-15'),
      returnDate: null,
      
      userId: 'user-12345',
      equipmentId: 'eq-laptop-001',
      
      userSnapshot: {
        uid: 'user-12345',
        email: 'ola.nordmann@elev.tromsfylke.no',
        displayName: 'Ola Nordmann'
      },
      
      equipmentSnapshot: {
        id: 'eq-laptop-001',
        name: 'Laptop Dell XPS 13',
        serialNumber: 'DELL-XPS-2025-001'
      },
      
      status: 'active',
      isOverdue: false,
      daysOverdue: 0,
      
      signedBy: 'admin-001',
      signatureUrl: 'https://...',
      depositPaid: true,
      depositAmount: 2000,
      
      conditionAtReturn: null,
      damageNotes: null,
      damageCost: 0,
      
      notes: 'Lånt for prosjektarbeid i programmering',
      checkedOutBy: 'admin-001',
      checkedInBy: null,
      
      createdAt: new Date('2025-12-08T10:30:00Z'),
      updatedAt: new Date('2025-12-08T10:30:00Z')
    }
  },

  /**
   * CATEGORIES Collection
   * Kategorier for utstyr (elektronikk, verktøy, osv.)
   */
  categories: {
    collectionName: 'categories',
    documentStructure: {
      id: 'string (auto)',
      name: 'string',
      icon: 'string (emoji eller URL)',
      description: 'string',
      order: 'number (sorteringsrekkefølge)',
      createdAt: 'timestamp'
    },
    exampleDocs: [
      {
        id: 'cat-elektronikk',
        name: 'Elektronikk',
        icon: '⚡',
        description: 'Datamaskiner, nettbrett, kameraer',
        order: 1,
        createdAt: new Date()
      },
      {
        id: 'cat-verktoey',
        name: 'Verktøy',
        icon: '🔧',
        description: 'Håndverktøy, måleinstrumenter',
        order: 2,
        createdAt: new Date()
      },
      {
        id: 'cat-laboratorium',
        name: 'Laboratoriumutstyr',
        icon: '🔬',
        description: 'Vitenskapelig utstyr',
        order: 3,
        createdAt: new Date()
      }
    ]
  },

  /**
   * SHELVES Collection
   * Lagerplass/hyller hvor utstyr er organisert
   */
  shelves: {
    collectionName: 'shelves',
    documentStructure: {
      id: 'string (auto)',
      name: 'string (navn, f.eks "Hylle A")',
      location: 'string (fysisk lokasjon)',
      capacity: 'number (max antall enheter)',
      currentUsage: 'number (antall enheter som ligger der nå)',
      description: 'string',
      createdAt: 'timestamp'
    },
    exampleDoc: {
      id: 'shelf-main-01',
      name: 'Hylle A',
      location: 'Lagrom 1, Etasje 2',
      capacity: 50,
      currentUsage: 34,
      description: 'Elektronikk og datamaskiner',
      createdAt: new Date()
    }
  },

  /**
   * AUDIT_LOGS Collection
   * Revisjonlogg for alle handlinger (sikkerhet & compliance)
   */
  audit_logs: {
    collectionName: 'audit_logs',
    documentStructure: {
      id: 'string (auto)',
      action: 'string (enum: "equipment_added", "loan_created", "equipment_damaged", osv.)',
      userId: 'string (ref til bruker som utførte handlingen)',
      targetId: 'string (equipment ID, loan ID, user ID som var target)',
      targetType: 'string (enum: "equipment", "loan", "user")',
      changes: 'object (hva som ble endret)',
      ipAddress: 'string',
      userAgent: 'string',
      timestamp: 'timestamp',
      status: 'string (enum: "success", "failed")'
    },
    exampleDoc: {
      id: 'log-12345',
      action: 'loan_created',
      userId: 'admin-001',
      targetId: 'loan-2025-001',
      targetType: 'loan',
      changes: {
        equipmentId: 'eq-laptop-001',
        userId: 'user-12345',
        status: 'active'
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      timestamp: new Date('2025-12-08T10:30:00Z'),
      status: 'success'
    }
  }
};

/**
 * Firestore Indexes (kreves for optimale spørringer)
 * Opprett disse manuelt i Firebase Console
 */
export const firestoreIndexes = [
  {
    collection: 'loans',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'dueDate', order: 'ASCENDING' }
    ],
    description: 'For å hente overdue loans'
  },
  {
    collection: 'loans',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' }
    ],
    description: 'For å hente brukerens aktive utlån'
  },
  {
    collection: 'equipment',
    fields: [
      { fieldPath: 'category', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' }
    ],
    description: 'For å hente utstyr etter kategori og status'
  }
];

/**
 * Firestore Security Rules
 * Kopier dette til Firebase Console > Firestore > Rules
 */
export const firestoreSecurityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read on public collections
    match /categories/{document=**} {
      allow read;
    }
    
    match /shelves/{document=**} {
      allow read;
    }

    // Require authentication for protected collections
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || isAdmin());
    }

    match /equipment/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }

    match /loans/{document=**} {
      allow read: if request.auth != null && 
        (isAdmin() || getUserId() == resource.data.userId);
      allow create: if request.auth != null && isAdmin();
      allow update: if request.auth != null && isAdmin();
    }

    match /audit_logs/{document=**} {
      allow read, write: if request.auth != null && isAdmin();
    }

    // Helper functions
    function isAdmin() {
      return request.auth != null && 
        request.auth.token.get('admin', false) == true;
    }

    function getUserId() {
      return request.auth.uid;
    }
  }
}
`;