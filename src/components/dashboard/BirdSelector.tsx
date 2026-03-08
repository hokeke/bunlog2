"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bird } from "@/types/database";

interface BirdSelectorProps {
  birds: Bird[];
  selectedBird: Bird | null;
  onSelect: (bird: Bird) => void;
}

export function BirdSelector({
  birds,
  selectedBird,
  onSelect,
}: BirdSelectorProps) {
  return (
    <Select
      value={selectedBird?.id ?? ""}
      onValueChange={(value) => {
        const bird = birds.find((b) => b.id === value);
        if (bird) {
          onSelect(bird);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="文鳥を選択" />
      </SelectTrigger>
      <SelectContent>
        {birds.map((bird) => (
          <SelectItem key={bird.id} value={bird.id}>
            {bird.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
