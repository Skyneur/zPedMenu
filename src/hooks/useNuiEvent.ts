import { MutableRefObject, useEffect, useRef } from "react";
import { noop } from "./misc";

interface NuiMessageData<T = unknown> {
  action: string;
  data: T;
}

type NuiHandlerSignature<T> = (data: T) => void;

/**
 * A hook that manage events listeners for receiving data from the client scripts
 * @param action The specific `action` that should be listened for.
 * @param handler The callback function that will handle data relayed by this hook
 *
 * @example
 * useNuiEvent<{visibility: true, wasVisible: 'something'}>('setVisible', (data) => {
 *   // whatever logic you want
 * })
 *
 **/

const useNuiEvent = <T = unknown>(
  action: string,
  handler: (data: T) => void
) => {
  const savedHandler: MutableRefObject<NuiHandlerSignature<T>> = useRef(noop);

  // Make sure we handle for a reactive handler
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: MessageEvent<NuiMessageData<T>>) => {
      console.log('NUI Event received:', event.data); // Debug log
      const { action: eventAction, data } = event.data;

      if (savedHandler.current) {
        if (eventAction === action) {
          console.log(`Handling NUI event: ${action}`, data); // Debug log
          savedHandler.current(data);
        }
      }
    };

    console.log(`Registering NUI event listener for: ${action}`); // Debug log
    window.addEventListener("message", eventListener);
    return () => {
      console.log(`Unregistering NUI event listener for: ${action}`); // Debug log
      window.removeEventListener("message", eventListener);
    };
  }, [action]);
};

export default useNuiEvent;
