import "dotenv/config";
import request from "supertest";
import app, { server } from "../app.js";
import { dummyBody } from "./common.js";
import httpErrorsMessage from "../constants/error-messages.js";
import { prisma } from "../middleware/async.js";

let validToken = "";
const fakeId = "invalidId";
const dummyVoucher = {
  category: "Delivery",
  description: "For API testing only",
  discount: 10,
  minSpending: 10,
  promoCode: "APITEST10",
  startDate: "01-11-2024",
  expiryDate: "03-20-2024",
};

async function createVoucher(token: string) {
  return await request(app)
    .post("/api/v1/vouchers")
    .send(dummyVoucher)
    .set("Authorization", token);
}

afterAll(async () => {
  await prisma.user.delete({
    where: {
      email: dummyBody.email,
      name: dummyBody.name,
    },
  });
  await prisma.$disconnect();
  server.close();
});

describe("GET /api/v1/vouchers", () => {
  it("should return no voucher error when the offset or limit is out of bounds", async () => {
    const { body: getToken } = await request(app).post("/user").send(dummyBody);
    validToken = `Bearer ${getToken.token}`;

    const { body, notFound, statusCode } = await request(app)
      .get(`/api/v1/vouchers?offset=${Number.MAX_SAFE_INTEGER}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(notFound).toBeTruthy();
  });

  it("should return next and previous URLs when there is offset and limit", async () => {
    const { body, statusCode } = await request(app)
      .get("/api/v1/vouchers?offset=1&limit=1")
      .set("Authorization", validToken);
    expect(statusCode).toBe(200);
    expect(body).not.toBeNull();
    expect(body["_links"]).toHaveProperty("next");
    expect(body["_links"]).toHaveProperty("previous");
  });
});

describe("GET /api/v1/vouchers/:id", () => {
  it("should return an error when the id is invalid", async () => {
    const { body, notFound, statusCode } = await request(app)
      .get(`/api/v1/vouchers/${fakeId}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(notFound).toBeTruthy();
  });

  it("should return the voucher when the id is valid", async () => {
    await createVoucher(validToken);

    const { id } = await prisma.voucher.findUniqueOrThrow({
      where: {
        promoCode: dummyVoucher.promoCode,
      },
      select: {
        id: true,
      },
    });
    const { body, statusCode } = await request(app)
      .get(`/api/v1/vouchers/${id}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(200);
    expect(body.results).not.toBeUndefined();
    expect(body["X-Total-count"]).toEqual(1);

    await prisma.voucher.delete({
      where: { id, promoCode: dummyVoucher.promoCode },
    });
  });
});

describe("POST /api/v1/vouchers", () => {
  it("should return validation error when the request body is invalid", async () => {
    const { badRequest, statusCode } = await request(app)
      .post("/api/v1/vouchers")
      .send(dummyBody)
      .set("Authorization", validToken);
    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
  });

  it("should create a voucher when the request body is valid", async () => {
    const { body, statusCode } = await request(app)
      .post("/api/v1/vouchers")
      .send(dummyVoucher)
      .set("Authorization", validToken);

    await prisma.voucher.delete({
      where: {
        description: dummyVoucher.description,
        promoCode: dummyVoucher.promoCode,
      },
    });
    expect(statusCode).toBe(201);
    expect(body.msg).toBe("Voucher has been created");
  });
});

describe("PATCH /api/v1/vouchers", () => {
  it("should return not found when the id is missing", async () => {
    const { notFound, statusCode } = await request(app)
      .patch("/api/v1/vouchers")
      .send({})
      .set("Authorization", validToken);
    expect(statusCode).toBe(404);
    expect(notFound).toBeTruthy();
  });

  it("should return no voucher error when the id is invalid", async () => {
    const { body, notFound, statusCode } = await request(app)
      .patch(`/api/v1/vouchers/${fakeId}`)
      .send({ discount: 20 })
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(notFound).toBeTruthy();
  });

  it("should return validation error when the request body is empty", async () => {
    const { badRequest, body, statusCode } = await request(app)
      .patch(`/api/v1/vouchers/${fakeId}`)
      .send({})
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoBody.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoBody.message);
    expect(badRequest).toBeTruthy();
  });

  it("should return validation error when the request body is invalid", async () => {
    const { id } = await prisma.voucher.findFirstOrThrow({
      where: {
        category: "Delivery",
      },
      select: {
        id: true,
      },
    });

    const { badRequest, body, statusCode } = await request(app)
      .patch(`/api/v1/vouchers/${id}`)
      .send({ category: "not a category" })
      .set("Authorization", validToken);
    expect(statusCode).toBe(400);
    expect(body.msg).not.toBeNull();
    expect(badRequest).toBeTruthy();
  });

  it("should update the document when both id and body are valid", async () => {
    await createVoucher(validToken);

    const { id } = await prisma.voucher.findUniqueOrThrow({
      where: { promoCode: dummyVoucher.promoCode },
      select: { id: true },
    });
    const { noContent, statusCode } = await request(app)
      .patch(`/api/v1/vouchers/${id}`)
      .send({ category: "Pandago" })
      .set("Authorization", validToken);
    expect(statusCode).toBe(204);
    expect(noContent).toBeTruthy();

    await prisma.voucher.delete({ where: { id } });
  });
});

describe("DELETE /api/v1/vouchers/:id", () => {
  it("should return not found error when the id is not provided", async () => {
    const { body, notFound, statusCode } = await request(app)
      .delete("/api/v1/vouchers")
      .set("Authorization", validToken);
    expect(statusCode).toBe(404);
    expect(body.msg).toBe("Not Found");
    expect(notFound).toBeTruthy();
  });

  it("should return no voucher when the id is invalid", async () => {
    const { body, notFound, statusCode } = await request(app)
      .delete(`/api/v1/vouchers/${fakeId}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(httpErrorsMessage.NoVoucher.statusCode);
    expect(body.msg).toBe(httpErrorsMessage.NoVoucher.message);
    expect(notFound).toBeTruthy();
  });

  it("should delete voucher when the id is valid", async () => {
    await createVoucher(validToken);

    const { id } = await prisma.voucher.findUniqueOrThrow({
      where: { promoCode: dummyVoucher.promoCode },
      select: { id: true },
    });

    const { noContent, statusCode } = await request(app)
      .delete(`/api/v1/vouchers/${id}`)
      .set("Authorization", validToken);
    expect(statusCode).toBe(204);
    expect(noContent).toBeTruthy();
  });
});
