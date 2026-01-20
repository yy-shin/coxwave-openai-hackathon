import clsx from "clsx";
import type { ReactNode } from "react";

type PanelLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function PanelLayout({ children, className }: PanelLayoutProps) {
  return (
    <div className={clsx("flex h-full w-full flex-col", className)}>
      {children}
    </div>
  );
}

type PanelHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PanelHeader({ title, description, actions }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-700/60">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

type PanelContentProps = {
  children: ReactNode;
  className?: string;
};

export function PanelContent({ children, className }: PanelContentProps) {
  return (
    <div className={clsx("flex-1 overflow-y-auto p-6", className)}>
      {children}
    </div>
  );
}

type PanelFooterProps = {
  children: ReactNode;
  className?: string;
};

export function PanelFooter({ children, className }: PanelFooterProps) {
  return (
    <div
      className={clsx(
        "border-t border-slate-200/80 px-6 py-4 dark:border-slate-700/60",
        className
      )}
    >
      {children}
    </div>
  );
}

// Empty state component
type EmptyStateProps = {
  icon?: ReactNode;
  title?: string;
  description?: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        {icon && (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            {icon}
          </div>
        )}
        {title && (
          <p className="text-slate-500 dark:text-slate-400">{title}</p>
        )}
        {description && (
          <p className="text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
    </div>
  );
}

// Loading state component
type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = "로딩 중...",
  description,
}: LoadingStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-200" />
        <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
          {title}
        </p>
        {description && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
