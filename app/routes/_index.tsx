import type { MetaFunction } from "@remix-run/node";
import { VStack, HStack } from "~/components/util/stack";

export const meta: MetaFunction = () => {
  return [
    { title: "VoteChain" },
    {
      name: "description",
      content: "VoteChain - A blockchain based voting system",
    },
  ];
};

export default function Index() {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold">Current Polls</h1>
      {/* Divider */}
      <div className="border-b-2 border-gray-300 my-4"></div>

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
