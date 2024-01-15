import express, { type CookieOptions } from "express";

declare global {
  namespace Express {
    interface Request {
      expires?: string;
      token?: string;
      options?: CookieOptions;
    }
  }
}
