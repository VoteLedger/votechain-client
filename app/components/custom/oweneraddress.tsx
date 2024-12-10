import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";

interface OwnerAddressProps {
  ownerAddress: string;
}

const OwnerAddress = ({ ownerAddress }: OwnerAddressProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ownerAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Errore durante la copia negli appunti:", err);
    }
  };

  // Funzione per truncare il testo
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  return (
    <div className="flex items-center justify-start gap-x-4 text-md text-black mt-4">
      <div className="relative">
        <div>
          <p
            className="cursor-pointer hover:underline hover:bg-gray-100 px-1 rounded transition-colors duration-200"
            onClick={handleCopy}
            title="Click to copy the account address"
          >
            {truncateText(ownerAddress, 20)}
          </p>
        </div>
        {copied && (
          <div className="absolute top-0 left-full ml-2 flex items-center bg-green-100 text-green-800 px-2 py-1 rounded shadow-lg">
            <FaCheck className="mr-1" />
            Copied!
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerAddress;
