import { createEffect } from "solid-js";
import { createSignal, Accessor, Setter } from "solid-js";
import { createStore, SetStoreFunction, Store} from "solid-js/store";

function createLocalStore<T extends object>(
    name: string,
    init: T
  ): [Store<T>, SetStoreFunction<T>] {
    const localState = localStorage.getItem(name);
    const [state, setState] = createStore<T>(
      localState ? JSON.parse(localState) : init
    );
    createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
    return [state, setState];
  }

function createLocalSignal<T extends object>(
  name: string,
  init: T
): [Accessor<T>, Setter<T>] {
  const localState = localStorage.getItem(name);
  const [state, setState] = createSignal<T>(
    localState ? JSON.parse(localState) : init
  );
  createEffect(() => localStorage.setItem(name, JSON.stringify(state())));
  return [state, setState];
}
export { createLocalStore, createLocalSignal};
