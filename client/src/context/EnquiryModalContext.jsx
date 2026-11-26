import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const ContactEnquiryModal = lazy(
  () => import('@/components/contact/ContactEnquiryModal'),
);

const EnquiryModalContext = createContext(null);

const initialState = {
  isOpen: false,
  enquiryType: 'contact',
  productName: '',
  formSource: '',
};

export function EnquiryModalProvider({ children }) {
  const [modalState, setModalState] = useState(initialState);

  const openEnquiryModal = useCallback(
    ({ enquiryType = 'contact', productName = '', formSource = '' } = {}) => {
      setModalState({
        isOpen: true,
        enquiryType,
        productName: productName.trim(),
        formSource,
      });
    },
    [],
  );

  const closeEnquiryModal = useCallback(() => {
    setModalState((current) => ({ ...current, isOpen: false }));
  }, []);

  const value = useMemo(
    () => ({
      openEnquiryModal,
      closeEnquiryModal,
      isOpen: modalState.isOpen,
    }),
    [closeEnquiryModal, modalState.isOpen, openEnquiryModal],
  );

  return (
    <EnquiryModalContext.Provider value={value}>
      {children}
      {modalState.isOpen && (
        <Suspense fallback={null}>
          <ContactEnquiryModal
            isOpen={modalState.isOpen}
            enquiryType={modalState.enquiryType}
            productName={modalState.productName}
            formSource={modalState.formSource}
            onClose={closeEnquiryModal}
          />
        </Suspense>
      )}
    </EnquiryModalContext.Provider>
  );
}

export function useEnquiryModal() {
  const context = useContext(EnquiryModalContext);

  if (!context) {
    throw new Error('useEnquiryModal must be used within EnquiryModalProvider');
  }

  return context;
}
