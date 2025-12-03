import * as SQLite from 'expo-sqlite';
import { Client, Loan, Installment, ClientScore, LoanStatus, InstallmentStatus, PaymentFrequency } from '@/types';

const db = SQLite.openDatabaseSync('agecred.db');

// ==================== DATABASE INITIALIZATION ====================

export const initDatabase = async () => {
  try {
    // Tabela de Clientes
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        address_street TEXT,
        address_number TEXT,
        address_complement TEXT,
        address_neighborhood TEXT,
        address_city TEXT,
        address_state TEXT,
        address_zip_code TEXT,
        photo_uri TEXT,
        score TEXT DEFAULT 'BOM',
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Tabela de Empréstimos
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS loans (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        principal_amount REAL NOT NULL,
        interest_rate REAL NOT NULL,
        late_interest_rate REAL NOT NULL,
        payment_frequency TEXT NOT NULL,
        total_installments INTEGER NOT NULL,
        installment_amount REAL NOT NULL,
        total_amount REAL NOT NULL,
        start_date INTEGER NOT NULL,
        end_date INTEGER NOT NULL,
        status TEXT DEFAULT 'ATIVO',
        notes TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      );
    `);

    // Tabela de Parcelas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS installments (
        id TEXT PRIMARY KEY,
        loan_id TEXT NOT NULL,
        installment_number INTEGER NOT NULL,
        due_date INTEGER NOT NULL,
        original_amount REAL NOT NULL,
        paid_amount REAL,
        interest_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'PENDENTE',
        paid_at INTEGER,
        payment_proof_uri TEXT,
        notes TEXT,
        FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
      );
    `);

    // Índices para melhor performance
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_loans_client_id ON loans(client_id);
      CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
      CREATE INDEX IF NOT EXISTS idx_installments_loan_id ON installments(loan_id);
      CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
      CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// ==================== CLIENT OPERATIONS ====================

export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  const id = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO clients (
      id, name, cpf, phone, whatsapp,
      address_street, address_number, address_complement,
      address_neighborhood, address_city, address_state, address_zip_code,
      photo_uri, score, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      client.name,
      client.cpf,
      client.phone,
      client.whatsapp,
      client.address.street,
      client.address.number,
      client.address.complement || null,
      client.address.neighborhood,
      client.address.city,
      client.address.state,
      client.address.zipCode,
      client.photoUri || null,
      client.score,
      client.notes || null,
      now,
      now,
    ]
  );

  return {
    ...client,
    id,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
};

export const getClients = async (): Promise<Client[]> => {
  const result = await db.getAllAsync<any>('SELECT * FROM clients ORDER BY name ASC');

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    cpf: row.cpf,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: {
      street: row.address_street,
      number: row.address_number,
      complement: row.address_complement,
      neighborhood: row.address_neighborhood,
      city: row.address_city,
      state: row.address_state,
      zipCode: row.address_zip_code,
    },
    photoUri: row.photo_uri,
    score: row.score as ClientScore,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
};

export const getClientById = async (id: string): Promise<Client | null> => {
  const result = await db.getFirstAsync<any>('SELECT * FROM clients WHERE id = ?', [id]);

  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    cpf: result.cpf,
    phone: result.phone,
    whatsapp: result.whatsapp,
    address: {
      street: result.address_street,
      number: result.address_number,
      complement: result.address_complement,
      neighborhood: result.address_neighborhood,
      city: result.address_city,
      state: result.address_state,
      zipCode: result.address_zip_code,
    },
    photoUri: result.photo_uri,
    score: result.score as ClientScore,
    notes: result.notes,
    createdAt: new Date(result.created_at),
    updatedAt: new Date(result.updated_at),
  };
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<void> => {
  const now = Date.now();
  const updates: string[] = [];
  const values: any[] = [];

  if (client.name) {
    updates.push('name = ?');
    values.push(client.name);
  }
  if (client.phone) {
    updates.push('phone = ?');
    values.push(client.phone);
  }
  if (client.whatsapp) {
    updates.push('whatsapp = ?');
    values.push(client.whatsapp);
  }
  if (client.address) {
    updates.push('address_street = ?', 'address_number = ?', 'address_complement = ?',
      'address_neighborhood = ?', 'address_city = ?', 'address_state = ?', 'address_zip_code = ?');
    values.push(
      client.address.street,
      client.address.number,
      client.address.complement || null,
      client.address.neighborhood,
      client.address.city,
      client.address.state,
      client.address.zipCode
    );
  }
  if (client.photoUri !== undefined) {
    updates.push('photo_uri = ?');
    values.push(client.photoUri || null);
  }
  if (client.score) {
    updates.push('score = ?');
    values.push(client.score);
  }
  if (client.notes !== undefined) {
    updates.push('notes = ?');
    values.push(client.notes || null);
  }

  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteClient = async (id: string): Promise<void> => {
  await db.runAsync('DELETE FROM clients WHERE id = ?', [id]);
};

// ==================== LOAN OPERATIONS ====================

export const createLoan = async (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'installments'>): Promise<Loan> => {
  const id = `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO loans (
      id, client_id, principal_amount, interest_rate, late_interest_rate,
      payment_frequency, total_installments, installment_amount, total_amount,
      start_date, end_date, status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      loan.clientId,
      loan.principalAmount,
      loan.interestRate,
      loan.lateInterestRate,
      loan.paymentFrequency,
      loan.totalInstallments,
      loan.installmentAmount,
      loan.totalAmount,
      loan.startDate.getTime(),
      loan.endDate.getTime(),
      loan.status,
      loan.notes || null,
      now,
      now,
    ]
  );

  return {
    ...loan,
    id,
    installments: [],
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
};

export const getLoans = async (): Promise<Loan[]> => {
  const result = await db.getAllAsync<any>('SELECT * FROM loans ORDER BY created_at DESC');

  return result.map((row) => ({
    id: row.id,
    clientId: row.client_id,
    principalAmount: row.principal_amount,
    interestRate: row.interest_rate,
    lateInterestRate: row.late_interest_rate,
    paymentFrequency: row.payment_frequency as PaymentFrequency,
    totalInstallments: row.total_installments,
    installmentAmount: row.installment_amount,
    totalAmount: row.total_amount,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    status: row.status as LoanStatus,
    installments: [],
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
};

export const getLoanById = async (id: string): Promise<Loan | null> => {
  const result = await db.getFirstAsync<any>('SELECT * FROM loans WHERE id = ?', [id]);

  if (!result) return null;

  const installments = await getInstallmentsByLoanId(id);

  return {
    id: result.id,
    clientId: result.client_id,
    principalAmount: result.principal_amount,
    interestRate: result.interest_rate,
    lateInterestRate: result.late_interest_rate,
    paymentFrequency: result.payment_frequency as PaymentFrequency,
    totalInstallments: result.total_installments,
    installmentAmount: result.installment_amount,
    totalAmount: result.total_amount,
    startDate: new Date(result.start_date),
    endDate: new Date(result.end_date),
    status: result.status as LoanStatus,
    installments,
    notes: result.notes,
    createdAt: new Date(result.created_at),
    updatedAt: new Date(result.updated_at),
  };
};

export const getLoansByClientId = async (clientId: string): Promise<Loan[]> => {
  const result = await db.getAllAsync<any>(
    'SELECT * FROM loans WHERE client_id = ? ORDER BY created_at DESC',
    [clientId]
  );

  return Promise.all(
    result.map(async (row) => {
      const installments = await getInstallmentsByLoanId(row.id);
      return {
        id: row.id,
        clientId: row.client_id,
        principalAmount: row.principal_amount,
        interestRate: row.interest_rate,
        lateInterestRate: row.late_interest_rate,
        paymentFrequency: row.payment_frequency as PaymentFrequency,
        totalInstallments: row.total_installments,
        installmentAmount: row.installment_amount,
        totalAmount: row.total_amount,
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        status: row.status as LoanStatus,
        installments,
        notes: row.notes,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    })
  );
};

export const updateLoan = async (id: string, loan: Partial<Loan>): Promise<void> => {
  const now = Date.now();
  const updates: string[] = [];
  const values: any[] = [];

  if (loan.status) {
    updates.push('status = ?');
    values.push(loan.status);
  }
  if (loan.notes !== undefined) {
    updates.push('notes = ?');
    values.push(loan.notes || null);
  }

  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE loans SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteLoan = async (id: string): Promise<void> => {
  await db.runAsync('DELETE FROM loans WHERE id = ?', [id]);
};

// ==================== INSTALLMENT OPERATIONS ====================

export const createInstallment = async (installment: Omit<Installment, 'id'>): Promise<Installment> => {
  const id = `installment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.runAsync(
    `INSERT INTO installments (
      id, loan_id, installment_number, due_date, original_amount,
      paid_amount, interest_amount, total_amount, status,
      paid_at, payment_proof_uri, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      installment.loanId,
      installment.installmentNumber,
      installment.dueDate.getTime(),
      installment.originalAmount,
      installment.paidAmount || null,
      installment.interestAmount,
      installment.totalAmount,
      installment.status,
      installment.paidAt?.getTime() || null,
      installment.paymentProofUri || null,
      installment.notes || null,
    ]
  );

  return {
    ...installment,
    id,
  };
};

export const getInstallmentsByLoanId = async (loanId: string): Promise<Installment[]> => {
  const result = await db.getAllAsync<any>(
    'SELECT * FROM installments WHERE loan_id = ? ORDER BY installment_number ASC',
    [loanId]
  );

  return result.map((row) => ({
    id: row.id,
    loanId: row.loan_id,
    installmentNumber: row.installment_number,
    dueDate: new Date(row.due_date),
    originalAmount: row.original_amount,
    paidAmount: row.paid_amount,
    interestAmount: row.interest_amount,
    totalAmount: row.total_amount,
    status: row.status as InstallmentStatus,
    paidAt: row.paid_at ? new Date(row.paid_at) : undefined,
    paymentProofUri: row.payment_proof_uri,
    notes: row.notes,
  }));
};

export const updateInstallment = async (id: string, installment: Partial<Installment>): Promise<void> => {
  const updates: string[] = [];
  const values: any[] = [];

  if (installment.paidAmount !== undefined) {
    updates.push('paid_amount = ?');
    values.push(installment.paidAmount);
  }
  if (installment.interestAmount !== undefined) {
    updates.push('interest_amount = ?');
    values.push(installment.interestAmount);
  }
  if (installment.totalAmount !== undefined) {
    updates.push('total_amount = ?');
    values.push(installment.totalAmount);
  }
  if (installment.status) {
    updates.push('status = ?');
    values.push(installment.status);
  }
  if (installment.paidAt !== undefined) {
    updates.push('paid_at = ?');
    values.push(installment.paidAt ? installment.paidAt.getTime() : null);
  }
  if (installment.paymentProofUri !== undefined) {
    updates.push('payment_proof_uri = ?');
    values.push(installment.paymentProofUri || null);
  }
  if (installment.notes !== undefined) {
    updates.push('notes = ?');
    values.push(installment.notes || null);
  }

  values.push(id);

  await db.runAsync(
    `UPDATE installments SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteInstallment = async (id: string): Promise<void> => {
  await db.runAsync('DELETE FROM installments WHERE id = ?', [id]);
};

// ==================== STATISTICS ====================

export const getDashboardStats = async () => {
  const totalClients = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM clients'
  );

  const activeLoans = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM loans WHERE status = 'ATIVO'"
  );

  const totalLent = await db.getFirstAsync<{ sum: number }>(
    "SELECT SUM(principal_amount) as sum FROM loans WHERE status != 'CANCELADO'"
  );

  const totalReceived = await db.getFirstAsync<{ sum: number }>(
    "SELECT SUM(paid_amount) as sum FROM installments WHERE status = 'PAGO'"
  );

  const totalPending = await db.getFirstAsync<{ sum: number }>(
    "SELECT SUM(total_amount) as sum FROM installments WHERE status = 'PENDENTE'"
  );

  const totalOverdue = await db.getFirstAsync<{ sum: number }>(
    "SELECT SUM(total_amount) as sum FROM installments WHERE status = 'ATRASADO'"
  );

  return {
    totalClients: totalClients?.count || 0,
    activeLoans: activeLoans?.count || 0,
    totalLent: totalLent?.sum || 0,
    totalReceived: totalReceived?.sum || 0,
    totalPending: totalPending?.sum || 0,
    totalOverdue: totalOverdue?.sum || 0,
  };
};
