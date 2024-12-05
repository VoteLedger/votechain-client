import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/lib/session";

//
// FIXME: This should not be done as it would open users to
// Cross-Site Request Forgery (CSRF) attacks.
//
// Read documentation: https://remix.run/docs/ja/main/utils/sessions#createcookiesessionstorage

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
