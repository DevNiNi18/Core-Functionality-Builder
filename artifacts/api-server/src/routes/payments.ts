import { Router, type IRouter } from "express";
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
    req.log.warn({ errors: parsed.error.message }, "Invalid payment body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const payment = await createPayment(parsed.data);
  res.status(201).json(CreatePaymentResponse.parse(payment));
});

router.get(
  "/payments/standing/:matricNumber",
  async (req, res): Promise<void> => {
    const params = GetStandingParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const records = await findPaymentsByStudent(params.data.matricNumber);
    const studentName = records[0]?.studentName ?? "Student";
    const paidSessionNames = new Set(records.map((record) => record.session));
    const standing = {
      matricNumber: params.data.matricNumber,
      studentName,
      paidSessions: records.map((record) => ({
        session: record.session,
        amount: record.amount,
        code: record.code,
        timestamp: record.timestamp,
      })),
      outstandingSessions: EXPECTED_SESSIONS.filter(
        (session) => !paidSessionNames.has(session),
      ),
      totalPaid: records.reduce((total, record) => total + record.amount, 0),
      totalOwed: EXPECTED_SESSIONS.length * DUES_PER_SESSION,
    };

    res.json(GetStandingResponse.parse(standing));
  },
);

router.get("/payments/verify/:code", async (req, res): Promise<void> => {
  const params = VerifyPaymentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const payment = await findPaymentByCode(params.data.code);
  if (!payment) {
    res.status(404).json({ error: "Payment code not found or invalid" });
    return;
  }

  res.json(VerifyPaymentResponse.parse(payment));
});

export default router;