import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

interface AccountAvatarProps {
  address: string;
  className?: string;
}

const API_URL = "https://api.dicebear.com/9.x/pixel-art/svg?seed=";

export const AccountAvatar = ({ address, className }: AccountAvatarProps) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={`${API_URL}${address}`} />
      <AvatarFallback>{address.slice(-2)}</AvatarFallback>
    </Avatar>
  );
};
