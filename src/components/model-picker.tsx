import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { KERNEL_MODELS, MODEL_FAMILY_META, resolveModel, type ModelFamily } from "@/lib/models";
import { cn } from "@/lib/utils";

/** Small identity dot for a provider — keeps the list scannable at a glance. */
function ProviderDot({ family }: { family: ModelFamily }) {
  return (
    <span
      aria-hidden="true"
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: MODEL_FAMILY_META[family].accent }}
    />
  );
}

export function ModelPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = resolveModel(value);

  const groups = useMemo(() => {
    const order: ModelFamily[] = ["anthropic", "openai", "google", "meta", "thinkingmachines"];
    return order
      .map((family) => ({
        family,
        label: MODEL_FAMILY_META[family].label,
        models: KERNEL_MODELS.filter((model) => model.family === family),
      }))
      .filter((group) => group.models.length > 0);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="max-w-[16rem] justify-between gap-2 rounded-full bg-background/60 text-sm"
        >
          <span className="flex min-w-0 items-center gap-2">
            <ProviderDot family={active.family} />
            <span className="truncate">{active.label}</span>
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[21rem] p-0">
        <Command>
          <CommandInput placeholder="Search models…" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.family} heading={group.label}>
                {group.models.map((model) => (
                  <CommandItem
                    key={model.id}
                    value={`${model.label} ${model.id} ${group.label}`}
                    onSelect={() => {
                      onChange(model.id);
                      setOpen(false);
                    }}
                    className="items-start gap-2"
                  >
                    <Check
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        model.id === active.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <ProviderDot family={model.family} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm">
                        {model.label}
                        {model.id === "openai/gpt-5.6-sol" && (
                          <Sparkles className="size-3 text-muted-foreground" />
                        )}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {model.blurb}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
