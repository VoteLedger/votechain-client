import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/lib/session";

export async function loader({ request }: ActionFunctionArgs) {
  // Get session and destroy it (if exists)
  const session = await getSession(request.headers.get("Cookie"));

  // Redirect to the login page
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
