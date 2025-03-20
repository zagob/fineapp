import { signOut } from "@/lib/auth";
import { Button } from "./ui/button";
import { Power } from "lucide-react";

export const SignOut = async () => {
  return (
    <Button
      onClick={async () => {
        "use server";
        await signOut();
      }}
      size="sm"
      variant="secondary"
    >
      <Power size={16} />
    </Button>
  );
};
