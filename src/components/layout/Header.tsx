"use client";

import { useAuth } from "@/hooks/useAuth";
import { useBirds } from "@/hooks/useBirds";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bird } from "@/types/database";

type HeaderProps = {
  selectedBird: Bird | null;
  onSelectBird: (bird: Bird) => void;
};

export function Header({ selectedBird, onSelectBird }: HeaderProps) {
  const { signOut } = useAuth();
  const { birds } = useBirds();

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center px-4 gap-4">
        <h1 className="text-xl font-bold">Bunlog2</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={selectedBird?.photo_url ?? undefined} />
                <AvatarFallback>
                  {selectedBird?.name.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              {selectedBird?.name ?? "文鳥を選択"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {birds.map((bird) => (
              <DropdownMenuItem
                key={bird.id}
                onClick={() => onSelectBird(bird)}
              >
                {bird.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" onClick={signOut}>
          ログアウト
        </Button>
      </div>
    </header>
  );
}
