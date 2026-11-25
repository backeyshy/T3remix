import { T } from "gt-react";
import { cn } from "~/lib/utils";

import { CommandBlock } from "./CommandBlock";

export function InstallT3Commands({
  command,
  className,
}: {
  readonly command: string;
  readonly className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <a
        className="text-xs underline"
        href="https://github.com/backeyshy/T3remix"
        target="_blank"
        rel="noreferrer noopener"
      >
        <T>Installation instructions</T>
      </a>
      <CommandBlock command={command} />
    </div>
  );
}
