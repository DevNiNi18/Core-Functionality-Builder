import { Router, type IRouter, type Response } from "express";
import {
  CreatePaymentBody,
  CreatePaymentResponse,
  GetStandingParams,
  GetStandingResponse,
  VerifyPaymentParams,
  VerifyPaymentResponse,
} from "@workspace/api-zod";
import {
  createPayment,
  DUES_PER_SESSION,
  EXPECTED_SESSIONS,
  findPaymentByCode,
  findPaymentsByStudent,
} from "../lib/payments";

const router: IRouter = Router();

router.post("/payments", async (req, res): Promise<void> => {
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    console.warn("Invalid payment body:", parsed.error.message);
    res.status(400).json({ error: parsed.error.issues?.[0]?.message || parsed.error.message });
    return;
  }

  const existing = await findPaymentsByStudent(parsed.data.matricNumber);
  const alreadyPaid = existing.find((p) => p.session === parsed.data.session);
  if (alreadyPaid) {
    res.status(400).json({
      error: `Dues for session ${parsed.data.session} have already been recorded for ${parsed.data.matricNumber} with proof code ${alreadyPaid.code}.`,
    });
    return;
  }

  const payment = await createPayment(parsed.data);
  res.status(201).json(CreatePaymentResponse.parse(payment));
});

async function handleGetStanding(rawMatric: string, res: Response): Promise<void> {
  const cleanMatric = decodeURIComponent(rawMatric).trim();
  const params = GetStandingParams.safeParse({ matricNumber: cleanMatric });
  if (!params.success) {
    res.status(400).json({ error: params.error.issues?.[0]?.message || params.error.message });
    return;
  }

  const records = await findPaymentsByStudent(cleanMatric);
  const studentName = records[0]?.studentName ?? "Student";
  const paidSessionNames = new Set(records.map((record) => record.session));
  const outstandingSessions = EXPECTED_SESSIONS.filter(
    (session) => !paidSessionNames.has(session),
  );
  const totalPaid = records.reduce((total, record) => total + record.amount, 0);
  const totalOwed = outstandingSessions.length * DUES_PER_SESSION;

  const standing = {
    matricNumber: cleanMatric,
    studentName,
    paidSessions: records.map((record) => ({
      session: record.session,
      amount: record.amount,
      code: record.code,
      timestamp: record.timestamp,
    })),
    outstandingSessions,
    totalPaid,
    totalOwed,
  };

  res.json(GetStandingResponse.parse(standing));
}

// Support query parameter e.g. /payments/standing?matricNumber=2021/245678
router.get("/payments/standing", async (req, res): Promise<void> => {
  const matric = req.query.matricNumber as string;
  if (!matric) {
    res.status(400).json({ error: "Matric number is required" });
    return;
  }
  await handleGetStanding(matric, res);
});

// Support path parameter whether URL-encoded or containing raw slashes
router.get("/payments/standing/{*matricPath}", async (req, res): Promise<void> => {
  const raw = req.params.matricPath;
  const matric = Array.isArray(raw) ? raw.join("/") : String(raw || "");
  await handleGetStanding(matric, res);
});

async function handleVerify(rawCode: string, res: Response): Promise<void> {
  const cleanCode = decodeURIComponent(rawCode).trim();
  const params = VerifyPaymentParams.safeParse({ code: cleanCode });
  if (!params.success) {
    res.status(400).json({ error: params.error.issues?.[0]?.message || params.error.message });
    return;
  }

  const payment = await findPaymentByCode(cleanCode);
  if (!payment) {
    res.status(404).json({ error: "Payment code not found or invalid" });
    return;
  }

  res.json(VerifyPaymentResponse.parse(payment));
}

router.get("/payments/verify", async (req, res): Promise<void> => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: "Payment code is required" });
    return;
  }
  await handleVerify(code, res);
});

router.get("/payments/verify/{*codePath}", async (req, res): Promise<void> => {
  const raw = req.params.codePath;
  const code = Array.isArray(raw) ? raw.join("/") : String(raw || "");
  await handleVerify(code, res);
});

export default router;