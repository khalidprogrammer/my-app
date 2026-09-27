"use client";

import * as React from "react";

const subscribe = () => () => {};

/**
 * useMounted — SSR-safe "are we on the client" flag without
 * setState-in-effect (react-hooks/set-state-in-effect clean).
 * Use to gate portals (dialog, toaster) that must not render on the server.
 */
export function useMounted() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
