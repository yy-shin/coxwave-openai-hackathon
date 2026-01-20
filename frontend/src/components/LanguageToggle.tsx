import clsx from "clsx";
import { useAppStore } from "../store/useAppStore";

const buttonBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-medium transition-colors duration-200";

export function LanguageToggle() {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/60 p-1 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
      <button
        type="button"
        onClick={() => setLanguage("ko")}
        className={clsx(
          buttonBase,
          language === "ko"
            ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        )}
        aria-label="Use Korean"
        aria-pressed={language === "ko"}
      >
        KO
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={clsx(
          buttonBase,
          language === "en"
            ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        )}
        aria-label="Use English"
        aria-pressed={language === "en"}
      >
        EN
      </button>
    </div>
  );
}
