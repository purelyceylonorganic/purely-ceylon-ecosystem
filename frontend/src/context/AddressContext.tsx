import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import {
  addressService,
  type Address,
} from "../services/address.service";

// 1. Context-க்கான தெளிவான TypeScript வகைகளை (Types) வரையறுத்தல்
type AddressContextType = {
  addresses: Address[];
  selectedAddressId: string;      // தற்போதைய தேர்வு செய்யப்பட்ட முகவரியின் ID
  setSelectedAddressId: (id: string) => void; // முகவரியை மாற்றும் ஃபங்ஷன்
  defaultAddress: Address | null;  // டீஃபால்ட் முகவரியின் தரவு
  loadAddresses: () => Promise<void>; // முகவரிகளை ரெஃப்ரெஷ் செய்யும் ஃபங்ஷன்
  fetchAddresses: () => Promise<void>; // பழைய கோப்பின் ஆதரவிற்கான அலையாஸ் (Alias)
  loading: boolean;
};

const AddressContext = createContext({} as AddressContextType);

export function AddressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 2. அனைத்து முகவரிகளையும் லோடு செய்யும் முதன்மை ஃபங்ஷன்
  async function loadAddresses() {
  try {
    setLoading(true);

    const response =
      await addressService.getMyAddresses();

    const addrList: Address[] =
      response.data ?? response ?? [];

    setAddresses(addrList);

    const foundDefault =
      addrList.find(
        (a: Address) => a.isDefault
      ) || null;

    setDefaultAddress(foundDefault);

    if (foundDefault) {
      setSelectedAddressId(
        foundDefault.id ||
          (foundDefault as any)._id
      );
    } else if (addrList.length > 0) {
      setSelectedAddressId(
        addrList[0].id ||
          (addrList[0] as any)._id
      );
    }
  } catch (error) {
    console.error(
      "முகவரிகளை லோடு செய்வதில் பிழை:",
      error
    );
  } finally {
    setLoading(false);
  }
}

  // பழைய கோப்பில் இருந்த பெயருக்கும் ஆதரவு வழங்குதல் (Alias)
  const fetchAddresses = loadAddresses;

  // முதலில் அப்ளிகேஷன் லோடு ஆகும்போது முகவரிகளை எடுக்க
  useEffect(() => {
    loadAddresses();
  }, []);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        defaultAddress,
        loadAddresses,
        fetchAddresses, // பழைய கம்போனன்ட்டுகளின் பயன்பாட்டிற்காக
        loading,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

// 3. பிற காம்போனன்ட்களில் எளிதாகப் பயன்படுத்த கஸ்டம் ஹுக் (Custom Hook)
export function useAddress() {
  return useContext(AddressContext);
}