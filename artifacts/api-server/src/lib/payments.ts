import Client from "@replit/database";
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

const database = new Client();
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
  await database.setMultiple({
    [paymentKey(record.code)]: record,
    [studentKey(record.matricNumber)]: Array.from(
      new Set([...existingCodes, record.code]),
    ),
  });
}

async function makeCode(): Promise<string> {
  for (;;) {
    const code = randomBytes(4).toString("hex").toUpperCase();
    if (!(await getValue<PaymentRecord>(paymentKey(code)))) {
      return code;
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
  return getValue<PaymentRecord>(paymentKey(code.toUpperCase()));
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