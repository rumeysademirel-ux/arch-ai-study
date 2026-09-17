"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FeedbackRetry() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  return (
    <button
      onClick={() => {
        setRetrying(true);
        router.refresh();
        setRetrying(false);
      }}
      disabled={retrying}
      className="mt-6 w-full rounded bg-accent px-4 py-2 text-sm font-medium text-accent-contrast disabled:opacity-50"
    >
      Tekrar Dene
    </button>
  );
}
