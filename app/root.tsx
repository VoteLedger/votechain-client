import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";

import tailwind_style from "./tailwind.css?url";
import { Navbar } from "./components/ui/navbar";
import { Providers } from "./providers";
import { getSession, isSession } from "./lib/session";
import { Toaster } from "./components/ui/toaster";
import { ClientOnly } from "remix-utils/client-only";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  // Stylesheet for the Tailwind CSS framework
  { rel: "stylesheet", href: tailwind_style },
];

export const loader: LoaderFunction = async ({ request }) => {
  // Check if we have an error
  // extract the session cookie from the request headers
  const session = await getSession(request.headers.get("Cookie"));

  return Response.json({ isAuthenticated: isSession(session) });
};

export function Layout({ children }: { children: React.ReactNode }) {
  // retrieve the session data from the loader
  const data = useLoaderData<{ isAuthenticated: boolean }>();
  console.log(data);

  // return the layout
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar isAuthenticated={(data && data.isAuthenticated) || false} />
        <main>{children}</main>
        <ScrollRestoration />
        <Scripts />
        <ClientOnly>{() => <Toaster />}</ClientOnly>
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}
