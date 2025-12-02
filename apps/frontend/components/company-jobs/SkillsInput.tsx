"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SkillsInputProps {
  skills: string[];
  skillInput: string;
  onSkillInputChange: (value: string) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export function SkillsInput({
  skills,
  skillInput,
  onSkillInputChange,
  onAddSkill,
  onRemoveSkill,
}: SkillsInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = skillInput.trim();
      if (!value || skills.includes(value)) return;
      onAddSkill(value);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="skills">Skills (press enter to add)</Label>
      <Input
        id="skills"
        name="skills"
        placeholder="React"
        value={skillInput}
        onChange={(event) => onSkillInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onRemoveSkill(skill)}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80"
            >
              {skill} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

