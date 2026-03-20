import { useEffect, useMemo, useState } from "react";

import { createSnapbackLayer } from "@snapback/core";

export type {
  CreateSnapbackLayerOptions,
  Entity,
  EntityId,
  SnapbackQueue,
  SnapbackStore,
  SnapbackUpdate,
} from "@snapback/core";

export default function useSnapbackLayer<T>() {
  const store = useMemo(() => createSnapbackLayer<T>(), []);
  const [, setVersion] = useState(0);

  useEffect(() => {
    return store.subscribe(() => {
      setVersion((version) => version + 1);
    });
  }, [store]);

  return store;
}
