import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

interface AuthSwitchProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  className?: string;
}

export function AuthSwitch({ mode, onModeChange, className }: AuthSwitchProps) {
  return (
    <div
      className={cn(
        "relative inline-flex h-11 w-full rounded-lg bg-muted p-1",
        className
      )}
    >
      {/* Sliding pill */}
      <div
        className={cn(
          "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-background shadow-sm transition-all duration-300 ease-in-out",
          mode === "login" ? "left-1" : "left-[calc(50%+2px)]"
        )}
      />

      <button
        type="button"
        onClick={() => onModeChange("login")}
        className={cn(
          "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
          mode === "login"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground/80"
        )}
      >
        Accedi
      </button>

      <button
        type="button"
        onClick={() => onModeChange("register")}
        className={cn(
          "relative z-10 flex-1 rounded-md text-sm font-medium transition-colors duration-200",
          mode === "register"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground/80"
        )}
      >
        Registrati
      </button>
    </div>
  );
}
