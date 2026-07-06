import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// ✅ சரிசெய்யப்பட்டது: 'type' கீவேர்டை Address-க்கு முன்னால் சேர்த்துள்ளோம்
import {
  addressService,
  type Address,
} from "../services/address.service";

import type { ReactNode } from "react";

type AddressContextType = {
  addresses: Address[];
  loadAddresses: () => Promise<void>;
};

const AddressContext =
  createContext({} as AddressContextType);

export function AddressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);

  async function loadAddresses() {
    try {
      const response =
        await addressService.getMyAddresses();

      setAddresses(response.data ?? response ?? []);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loadAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  return useContext(AddressContext);
}