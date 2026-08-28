import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

const paymentRepository = vi.hoisted(() => ({
  createIntent: vi.fn(async (intent) => intent),
  getIntent: vi.fn(),
}));
const getResult = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "anon_owner" }) })),
}));
vi.mock("@/lib/payment/paymentProvider", () => ({ getPaymentRepository: () => paymentRepository }));
vi.mock("@/lib/repository/repositoryProvider", () => ({ getSoulRepository: () => ({ getResult }) }));

describe("/api/payment/intents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_TOSS_CLIENT_KEY", "test_gck_client");
    vi.stubEnv("TOSS_SECRET_KEY", "test_gsk_secret");
    getResult.mockResolvedValue({ profile: { id: "sp_test" } });
  });

  it("creates an owner-bound intent with the configured pack amount", async () => {
    const response = await POST(new Request("http://localhost/api/payment/intents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: "sp_test", packId: "soul_3", amount: 1 }),
    }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({ profileId: "sp_test", packId: "soul_3", amountKrw: 2490, souls: 3 });
    expect(paymentRepository.createIntent).toHaveBeenCalledWith(expect.objectContaining({ amountKrw: 2490 }));
  });

  it("does not create an intent for a result the session cannot access", async () => {
    getResult.mockResolvedValue(null);
    const response = await POST(new Request("http://localhost/api/payment/intents", {
      method: "POST",
      body: JSON.stringify({ profileId: "sp_other", packId: "soul_1" }),
    }));

    expect(response.status).toBe(404);
    expect(paymentRepository.createIntent).not.toHaveBeenCalled();
  });

  it("returns an order only to its owning session", async () => {
    paymentRepository.getIntent.mockResolvedValue({
      orderId: "soul_order", soulProfileId: "sp_test", packId: "soul_1",
      amountKrw: 990, souls: 1, status: "pending",
    });
    const response = await GET(new Request("http://localhost/api/payment/intents?orderId=soul_order"));

    expect(response.status).toBe(200);
    expect(paymentRepository.getIntent).toHaveBeenCalledWith("soul_order", "anon_owner");
  });
});
