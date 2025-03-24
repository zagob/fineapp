import { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export const Profile = ({ session }: { session: Session }) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar>
        {session.user?.image && <AvatarImage src={session.user?.image} />}
        <AvatarFallback>{session.user?.name}</AvatarFallback>
      </Avatar>
      <div>{session.user?.name}</div>
    </div>
  );
};
