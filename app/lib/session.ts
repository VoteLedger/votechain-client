import { createCookieSessionStorage } from "@remix-run/node";
import { UserSession } from "~/types/auth";

type SessionFlashData = {
  error: string;
};

if (!process.env.REMIX_COOKIE_DOMAIN) {
  throw new Error(
    "REMIX_COOKIE_DOMAIN is not defined. Please define it in .env file"
  );
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<UserSession, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__votechain_session",

      // all of these are optional
      domain: process.env.REMIX_COOKIE_DOMAIN,
      // Expires can also be set (although maxAge overrides it when used in combination).
      // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
      //
      // expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 60,
      path: "/",
      sameSite: "lax",
      secrets: ["s3cret1"],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
