import { AlertIcon, CloseIcon } from "./icons";

interface ErrorAlertProps {
  title: string;
  message: string;
  onDismiss?: () => void;
}

export default function ErrorAlert({ title, message, onDismiss }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3.5 py-3 text-sm"
    >
      <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-red-200">{title}</p>
        {message && message !== title && (
          <p className="mt-0.5 break-words text-xs leading-5 text-red-300/80">
            {message}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 rounded-md p-1 text-red-300/60 transition hover:bg-red-500/10 hover:text-red-200 focus-visible:outline-2 focus-visible:outline-red-400"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
