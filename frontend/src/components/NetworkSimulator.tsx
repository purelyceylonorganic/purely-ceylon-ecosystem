import { useDispatch, useSelector } from "react-redux";
import { setNetworkStatus } from "../store/slices/commerceSlice";

export default function NetworkSimulator() {
  const dispatch = useDispatch();

  const { isOnline, offlineOrderQueue } = useSelector(
    (state: any) => state.commerce || { isOnline: true, offlineOrderQueue: [] }
  );

  const toggleNetwork = () => {
    dispatch(setNetworkStatus(!isOnline));
  };

  return (
    <div className="fixed bottom-4 right-4 bg-[#111111] border border-[#D4AF37] text-white p-4 rounded-lg shadow-xl z-50 max-w-xs font-mono text-xs">
      <div className="flex justify-between items-center mb-2">
        <span>System Status:</span>
        <span
          className={`px-2 py-0.5 rounded text-black font-bold ${
            isOnline ? "bg-green-400" : "bg-red-400"
          }`}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>
      </div>

      <p className="text-gray-400 mb-3">
        Offline Synced Queue: {offlineOrderQueue?.length ?? 0} Orders Pending
      </p>

      <button
        onClick={toggleNetwork}
        className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black py-1 px-2 font-sans font-bold rounded transition-all"
      >
        Simulate Network Toggle
      </button>
    </div>
  );
}