import * as React from "react"

import { ToastProps } from "./toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & { 
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action = 
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

interface State { 
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action

      // ! Side effects ! - This is not typical in a reducer, but we need to expose
      // the dismiss function to the outside world. We use a queue to defer
      // executing this side effect until after the reducer has finished.
      // We'll call this in an effect after the reducer runs.
      addToastQueue.add(toastId)

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    }
}

const listeners: ((state: State) => void)[] = []

const dispatch = (action: Action) => {
  state = reducer(state, action)
  listeners.forEach((listener) => listener(state))
}

const createToast = ({ ...props }: ToastProps) => {
  const id = genId()

  const update = (props: Partial<ToasterToast>) =>
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { id, ...props } })
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({ type: actionTypes.ADD_TOAST, toast: { id, ...props, open: true } })

  return { 
    id: id,
    update,
    dismiss,
  }
}

let addToastQueue: Set<string | undefined> = new Set()

let state: State = { toasts: [] }

function genId() {
  return Math.random().toString(36).substring(2, 9)
}

type Toast = (props: ToastProps) => { id: string; update: (props: Partial<ToasterToast>) => void; dismiss: () => void; };

function useToast() {
  const [toasts, setToasts] = React.useState(state.toasts);

  React.useEffect(() => {
    const listener = (state: State) => setToasts(state.toasts);
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [toasts]);

  return {
    toasts,
    toast: createToast as Toast,
  };
}

export { useToast, createToast }