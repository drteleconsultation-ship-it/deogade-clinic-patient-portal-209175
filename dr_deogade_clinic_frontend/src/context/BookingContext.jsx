import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

/**
 * Booking context and provider for managing multi-step booking flow state.
 * Stores patient details, selected slot, uploaded documents, and current step.
 */
const BookingContext = createContext(null);

const initialState = {
  isOpen: false,
  step: 0,
  patient: {
    fullName: '',
    phone: '',
    email: '',
    visitType: 'in-clinic', // 'in-clinic' | 'online'
    notes: '',
  },
  slot: null, // { date: 'YYYY-MM-DD', time: 'HH:mm' }
  documents: [], // File[] (or metadata objects)
};

function bookingReducer(state, action) {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true, step: 0 };
    case 'CLOSE':
      return { ...initialState, isOpen: false };
    case 'RESET':
      return { ...initialState, isOpen: false };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_PATIENT':
      return { ...state, patient: { ...state.patient, ...action.patient } };
    case 'SET_SLOT':
      return { ...state, slot: action.slot };
    case 'ADD_DOCUMENTS':
      return { ...state, documents: [...state.documents, ...action.files] };
    case 'REMOVE_DOCUMENT':
      return { ...state, documents: state.documents.filter((_, i) => i !== action.index) };
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function BookingProvider({ children }) {
  /**
   * PUBLIC INTERFACE: Provide booking state and actions to consumers.
   */
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const open = useCallback(() => dispatch({ type: 'OPEN' }), []);
  const close = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setStep = useCallback((step) => dispatch({ type: 'SET_STEP', step }), []);
  const setPatient = useCallback((patient) => dispatch({ type: 'SET_PATIENT', patient }), []);
  const setSlot = useCallback((slot) => dispatch({ type: 'SET_SLOT', slot }), []);
  const addDocuments = useCallback((files) => dispatch({ type: 'ADD_DOCUMENTS', files }), []);
  const removeDocument = useCallback((index) => dispatch({ type: 'REMOVE_DOCUMENT', index }), []);

  const value = useMemo(
    () => ({
      state,
      actions: { open, close, reset, setStep, setPatient, setSlot, addDocuments, removeDocument },
    }),
    [state, open, close, reset, setStep, setPatient, setSlot, addDocuments, removeDocument]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

// PUBLIC_INTERFACE
export function useBooking() {
  /** Hook to access booking context */
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider');
  return ctx;
}
