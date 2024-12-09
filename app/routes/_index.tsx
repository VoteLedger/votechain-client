import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect, useActionData, useLoaderData } from "@remix-run/react";
import { VStack } from "~/components/util/stack";
import { createPoll, getPolls } from "~/services/polls";
import { commitSession, getSession, isSession } from "~/lib/session";
import { CreatePoll, Poll } from "~/types/services";
import { Badge } from "~/components/ui/badge";
import { ErrorWithStatus } from "~/lib/api";
import { getErrorMessageForStatusCode } from "~/lib/error";
import {
  CreatePollDialog,
  PollFormFields,
} from "~/components/custom/createpolldialog";

type LoaderData = {
  polls: Poll[];
  error?: string;
};

type ActionData = {
  errors?: {
    [key in PollFormFields[number]]?: string;
  };
};

export default function Index() {
  // retrieve the polls from the loader data
  const data = useLoaderData<LoaderData>();

  // load the response of the action function
  const response = useActionData<ActionData>();

  console.log("[Index] Errors: ", response?.errors);
  console.log("[Index] Polls: ", data);

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold">Current Polls</h1>

      {/* Button to create a new poll */}
      <CreatePollDialog errors={response?.errors} />

      {/* Display number of loaded polls */}
      {data.polls.length > 0 && (
        <Badge className="mt-2">
          {data.polls.length} poll{data.polls.length > 1 ? "s" : ""} available
        </Badge>
      )}

      {/* Divider */}
      <div className="border-b-2 border-gray-300 my-4" />

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
            <h2 className="text-xl font-bold">{poll.name}</h2>
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

export const action: ActionFunction = async ({ request }) => {
  // **1. Restrict to POST Method**
  if (request.method !== "POST") {
    return Response.json(
      { errors: { method: "Method Not Allowed" } },
      { status: 405, headers: { Allow: "POST" } }
    );
  }

  // **2. Session Validation**
  const session = await getSession(request.headers.get("Cookie"));
  if (!isSession(session)) {
    return redirect("/login");
  }

  // **3. Parse Form Data**
  const formData = await request.formData();

  // **4. Initialize Errors Object**
  const errors: Record<string, string> = {};

  // **5. Extract and Validate Required Fields**
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const startTimeStr = formData.get("startTime") as string;
  const endTimeStr = formData.get("endTime") as string;
  const optionsRaw = formData.getAll("options[]") as string[];

  // **6. Validate 'name' Field**
  if (!name) {
    errors.name = "Name is required and cannot be empty.";
  }

  // **7. Validate 'description' Field**
  if (!description) {
    errors.description = "Description is required.";
  }

  // **8. Validate 'options' Field**
  const options = optionsRaw
    .map((opt) => opt.trim())
    .filter((opt) => opt !== "");
  if (options.length < 2) {
    errors.options = "At least two options are required.";
  }

  // **9. Validate 'startTime' and 'endTime' Fields**
  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  if (!startTimeStr) {
    errors.startTime = "Start time is required.";
  } else if (isNaN(startTime.getTime())) {
    errors.startTime = "Start time must be a valid date and time.";
  }

  if (!endTimeStr) {
    errors.endTime = "End time is required.";
  } else if (isNaN(endTime.getTime())) {
    errors.endTime = "End time must be a valid date and time.";
  }

  if (
    startTimeStr &&
    endTimeStr &&
    !isNaN(startTime.getTime()) &&
    !isNaN(endTime.getTime())
  ) {
    if (endTime <= startTime) {
      errors.endTime = "End time must be after start time.";
    }
  }

  // **10. Check for Validation Errors**
  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  // **11. Sanitize and Prepare Data**
  const sanitizedOptions = Array.from(new Set(options)); // Remove duplicates
  const sanitizedName = name!;
  const sanitizedDescription = description!;

  // **12. Create Poll Object**
  const poll: CreatePoll = {
    name: sanitizedName,
    description: sanitizedDescription,
    options: sanitizedOptions,
    start_time: Math.floor(startTime.getTime() / 1000),
    end_time: Math.floor(endTime.getTime() / 1000),
  };

  // **13. Create Poll in Database**
  try {
    await createPoll(session, poll);
  } catch (error) {
    if (error instanceof ErrorWithStatus) {
      console.warn("An error occurred while creating a poll:", error.message);
      if (error.statusCode === 401) {
        return redirect("/login");
      }
      return Response.json(
        { errors: { server: error.message } },
        { status: error.statusCode }
      );
    }
    // Handle unexpected errors
    console.error("Unexpected error:", error);
    return Response.json(
      { errors: { server: "An unexpected error occurred." } },
      { status: 500 }
    );
  }

  // **14. Redirect on Success**
  return redirect("/polls");
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

    // Return the response
    return Response.json(
      {
        polls: polls || [],
      },
      {
        // If the session has been modified, update the cookie
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
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
    return Response.json(
      {
        polls: [],
        error: msg,
      },
      {
        // If the session has been modified, update the cookie
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }
};
