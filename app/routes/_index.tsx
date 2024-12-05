import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import { VStack, HStack } from "~/components/util/stack";
import { getPolls } from "~/services/polls";
import { getSession, isSession } from "~/lib/session";

// type LoaderData = {
//   polls: Poll[];
//   error?: string;
// };

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
  console.log("[Index] Session: ", session.data);
  if (!isSession(session)) {
    return redirect("/login");
  }

  // Fetch polls from database
  try {
    const polls = await getPolls(session);

    // return polls
    return {
      polls: polls,
    };
  } catch (error) {
    //
    console.warn(
      "An error occurred while loading polls from API: ",
      (error as Error).message
    );

    // return empty polls
    return {
      polls: [],
      error: "Failed to fetch polls - " + error,
    };
  }
};

export default function Index() {
  // retrieve the polls from the loader data
  const data = useLoaderData<typeof loader>();

  console.log("[Index] Polls: ", data);

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold">Current Polls</h1>
      {/* Divider */}
      <div className="border-b-2 border-gray-300 my-4"></div>

      {/* Display error message if any */}
      {data.error && (
        <div className="p-4 bg-red-200">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{data.error}</p>
        </div>
      )}

      {/* Display the polls */}
      <VStack spacing="16px" align="center">
        {/* {data.polls.map((poll) => ( */}
        {/*   <div key={poll.id} className="p-4 bg-gray-200"> */}
        {/*     <h2 className="text-xl font-bold">{poll.title}</h2> */}
        {/*     <p>{poll.description}</p> */}
        {/*   </div> */}
        {/* ))} */}
      </VStack>

      <VStack spacing="16px" align="center">
        <div className="p-6 bg-gray-200">Item 1</div>
        <div className="p-4 bg-gray-300">Item 2</div>
        <div className="p-4 bg-gray-400">Item 3</div>
      </VStack>
      <HStack spacing="16px" justify="center">
        <div className="p-4 bg-blue-200">Item A</div>
        <div className="p-4 bg-blue-300">Item B</div>
        <div className="p-4 bg-blue-400">Item C</div>
      </HStack>
    </div>
  );
}
