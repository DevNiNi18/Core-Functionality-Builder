import { randomBytes } from "node:crypto";

export const DUES_PER_SESSION = 2000;
export const EXPECTED_SESSIONS = [
  "2022/2023",
  "2023/2024",
  "2024/2025",
  "2025/2026",
] as const;

export type PaymentRecord = {
  matricNumber: string;
  studentName: string;
  session: string;
  amount: number;
  code: string;
  timestamp: string;
};

class InMemoryDbClient {
  private store = new Map<string, any>();

  async get(key: string): Promise<{ ok: boolean; value: any }> {
    if (this.store.has(key)) {
      return { ok: true, value: this.store.get(key) };
    }
    return { ok: false, value: undefined };
  }

  async set(key: string, value: any): Promise<void> {
    this.store.set(key, value);
  }

  async setMultiple(entries: Record<string, any>): Promise<void> {
    for (const [k, v] of Object.entries(entries)) {
      this.store.set(k, v);
    }
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

const database = new InMemoryDbClient();
let initialization: Promise<void> | undefined;

function paymentKey(code: string): string {
  return `payment:${code}`;
}

function studentKey(matricNumber: string): string {
  return `student:${matricNumber}`;
}

async function getValue<T>(key: string): Promise<T | undefined> {
  const result = await database.get(key);
  if (!result.ok || result.value == null) {
    return undefined;
  }
  return result.value as T;
}

async function saveRecord(record: PaymentRecord): Promise<void> {
  const existingCodes =
    (await getValue<string[]>(studentKey(record.matricNumber))) ?? [];
  const normalizedCode = record.code.replace(/[^A-Z0-9]/g, "").toUpperCase();
  await database.setMultiple({
    [paymentKey(record.code)]: record,
    [paymentKey(normalizedCode)]: record,
    [studentKey(record.matricNumber)]: Array.from(
      new Set([...existingCodes, record.code]),
    ),
  });
}

async function makeCode(): Promise<string> {
  for (;;) {
    const raw = randomBytes(4).toString("hex").toUpperCase();
    const formatted = `NAC-${raw.slice(0, 4)}-${raw.slice(4)}`;
    if (!(await getValue<PaymentRecord>(paymentKey(formatted)))) {
      return formatted;
    }
  }
}

async function seedDemoRecords(): Promise<void> {
  const seeded = await getValue<boolean>("dues-track:seeded");
  if (seeded) {
    return;
  }

  const demoPayments: Array<Omit<PaymentRecord, "code" | "timestamp"> & {
    code: string;
    timestamp: string;
  }> = [
    {
      matricNumber: "2021/119842",
      studentName: "Chinedu Okafor",
      session: "2024/2025",
      amount: 2500,
      code: "NAC-7F2K-91QX",
      timestamp: "2024-11-04T10:20:00.000Z",
    },
    {
      matricNumber: "2021/245678",
      studentName: "Ada Okafor",
      session: "2025/2026",
      amount: DUES_PER_SESSION,
      code: "NACOS241",
      timestamp: "2025-10-06T09:30:00.000Z",
    },
    {
      matricNumber: "2021/245678",
      studentName: "Ada Okafor",
      session: "2024/2025",
      amount: DUES_PER_SESSION,
      code: "NACOS242",
      timestamp: "2024-10-11T11:15:00.000Z",
    },
    {
      matricNumber: "2022/310944",
      studentName: "Chinedu Eze",
      session: "2025/2026",
      amount: DUES_PER_SESSION,
      code: "NACOS243",
      timestamp: "2025-10-13T08:45:00.000Z",
    },
    {
      matricNumber: "2023/418205",
      studentName: "Fatima Bello",
      session: "2025/2026",
      amount: DUES_PER_SESSION,
      code: "NACOS244",
      timestamp: "2025-10-18T14:10:00.000Z",
    },
    {
      matricNumber: "2023/418205",
      studentName: "Fatima Bello",
      session: "2024/2025",
      amount: DUES_PER_SESSION,
      code: "NACOS245",
      timestamp: "2024-10-21T10:05:00.000Z",
    },
  ];

  for (const record of demoPayments) {
    await saveRecord(record);
  }
  await database.set("dues-track:seeded", true);
}

export async function ensurePaymentStore(): Promise<void> {
  initialization ??= seedDemoRecords();
  await initialization;
}

export async function createPayment(
  input: Omit<PaymentRecord, "code" | "timestamp">,
): Promise<PaymentRecord> {
  await ensurePaymentStore();
  const record: PaymentRecord = {
    ...input,
    code: await makeCode(),
    timestamp: new Date().toISOString(),
  };
  await saveRecord(record);
  return record;
}

export async function findPaymentByCode(
  code: string,
): Promise<PaymentRecord | undefined> {
  await ensurePaymentStore();
  const trimmed = code.trim().toUpperCase();
  // 1. Direct match with exact uppercase code
  let record = await getValue<PaymentRecord>(paymentKey(trimmed));
  if (record) return record;

  // 2. Normalized match (without non-alphanumeric chars, e.g. hyphens or spaces)
  const stripped = trimmed.replace(/[^A-Z0-9]/g, "");
  record = await getValue<PaymentRecord>(paymentKey(stripped));
  if (record) return record;

  // 3. Match with NAC- prefix added if missing
  if (!trimmed.startsWith("NAC-") && stripped.length === 8) {
    const formatted = `NAC-${stripped.slice(0, 4)}-${stripped.slice(4)}`;
    record = await getValue<PaymentRecord>(paymentKey(formatted));
    if (record) return record;
  }

  return undefined;
}

export async function findPaymentsByStudent(
  matricNumber: string,
): Promise<PaymentRecord[]> {
  await ensurePaymentStore();
  const codes =
    (await getValue<string[]>(studentKey(matricNumber.trim()))) ?? [];
  const records = await Promise.all(
    codes.map((code) => getValue<PaymentRecord>(paymentKey(code))),
  );
  return records
    .filter((record): record is PaymentRecord => Boolean(record))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}