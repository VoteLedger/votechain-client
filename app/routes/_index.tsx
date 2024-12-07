import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import { VStack } from "~/components/util/stack";
import { getPolls } from "~/services/polls";
import { commitSession, getSession, isSession } from "~/lib/session";
import { Poll } from "~/types/services";
import { Badge } from "~/components/ui/badge";
import { ErrorWithStatus } from "~/lib/api";
import { getErrorMessageForStatusCode } from "~/lib/error";

type LoaderData = {
  polls: Poll[];
  error?: string;
};

export default function Index() {
  // retrieve the polls from the loader data
  const data = useLoaderData<LoaderData>();

  console.log("[Index] Polls: ", data);

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold">Current Polls</h1>

      {/* Display number of loaded polls */}
      {data.polls.length > 0 && (
        <Badge className="mt-2">
          {data.polls.length} poll{data.polls.length > 1 ? "s" : ""} available
        </Badge>
      )}

      {/* Divider */}
      <div className="border-b-2 border-gray-300 my-4"></div>

      {/* Display error message if any */}
      {data.error && (
        <div className="p-4 bg-red-200 mx-4">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{data.error}</p>
        </div>
      )}

      {/* Display the polls */}
      <VStack spacing="16px" align="center">
        {data.polls.map((poll) => (
          <div key={poll.id} className="p-4 bg-gray-200">
            <h2 className="text-xl font-bold">{poll.title}</h2>
            <p>{poll.description}</p>
          </div>
        ))}
      </VStack>

      {/* Display a message if no polls are available */}
      {data.polls.length === 0 && !data.error && (
        <div className="p-4 bg-yellow-200 mx-4">
          <h2 className="text-xl font-bold">No Polls</h2>
          <p>There are no polls available at the moment.</p>
        </div>
      )}
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "VoteChain" },
    {
      name: "description",
      content: "VoteChain - A blockchain based voting system",
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  // First of all, fetch the session
  const session = await getSession(request.headers.get("Cookie"));

  if (!isSession(session)) {
    return redirect("/login");
  }

  // Fetch polls from database
  try {
    const polls = await getPolls(session);

    // Return polls
    return {
      polls: polls || [],
    };
  } catch (error) {
    console.warn(
      "An error occurred while loading polls from API:",
      (error as Error).message
    );

    let msg = "Failed to fetch polls";

    // If error with status, access status code
    if (error instanceof ErrorWithStatus) {
      if (error.statusCode === 401) {
        return redirect("/login");
      } else if (error.statusCode == 498) {
        // Save the error inside the session
        session.flash("error", msg);

        // If token expired, redirect to logout
        return redirect("/login", {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        });
      } else {
        // Use our custom utility to get a user-friendly error message
        msg = getErrorMessageForStatusCode(error.statusCode, "Poll");
      }
    }

    // Return empty polls with an error message
    return {
      polls: [],
      error: msg,
    };
  }
};
