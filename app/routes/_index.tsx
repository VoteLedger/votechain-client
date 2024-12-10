import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { getSession, isSession } from "~/lib/session";
import {
  CreatePollDialog,
  PollFormFields,
} from "~/components/custom/createpolldialog.client";
import { useEthContext } from "~/providers/ethcontextprovider.client";
import { useEffect } from "react";
import { useToast } from "~/hooks/use-toast.client";
import { Button } from "~/components/ui/button";

type ActionData = {
  errors?: {
    [key in PollFormFields[number]]?: string;
  };
};

export default function Index() {
  const response: ActionData = {};
  const data = { polls: [], error: "" };

  // Load the eth context
  const { accounts, connectWallet } = useEthContext();

  const { toast } = useToast();

  useEffect(() => {
    if (!accounts.length) {
      console.log("No accounts found, connecting wallet");
      connectWallet();
    }
  });

  useEffect(() => {
    console.log("Accounts: ", accounts);
  }, [accounts]);

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold">Current Polls</h1>

      {/* Button to create a new poll */}
      <CreatePollDialog
        onPollCreated={() => {
          // Show a toast message
          toast({
            title: "Poll created",
            description: "The poll was created successfully.",
            variant: "default",
          });
        }}
      />

      {/* Divider */}
      <div className="border-b-2 border-gray-300 my-4" />

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
  return {};
};
