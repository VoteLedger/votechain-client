import { redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/lib/session";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export default function Logout() {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Logging out...</h1>
      <p>You are being redirected to the login page.</p>
    </div>
  );
}
