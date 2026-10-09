import { useEffect, useState } from "react";
import { newsletterService } from "../../../services/newsletter.service";
import { toast } from "react-hot-toast";
import {
  Search,
  RefreshCw,
  Mail,
  Users,
  UserCheck,
  Filter,
} from "lucide-react";

interface Subscriber {
  id?: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadSubscribers = async () => {
    try {
      setLoading(true);

      const response = await newsletterService.getSubscribers();
      setSubscribers(response?.data || []);
    } catch (error: any) {
      console.error("Failed to load newsletter subscribers:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load subscribers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter((subscriber) =>
    (subscriber.email || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const activeCount = subscribers.filter(
    (subscriber) => subscriber.isActive !== false
  ).length;

  return (
    <div className="w-full min-w-0 space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">

      {/* HEADER */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Newsletter Subscribers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customers who subscribed to your newsletter.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadSubscribers()}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0E4B32] px-4 py-3 font-semibold text-white transition hover:bg-[#0b3d29] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Total Subscribers
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {subscribers.length}
              </h2>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={23} />
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Active Subscribers
              </p>
              <h2 className="mt-2 text-3xl font-bold text-green-700">
                {activeCount}
              </h2>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <UserCheck size={23} />
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Search Results
              </p>
              <h2 className="mt-2 text-3xl font-bold text-blue-600">
                {filteredSubscribers.length}
              </h2>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Filter size={23} />
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label
          htmlFor="subscriber-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Search Subscribers
        </label>

        <div className="relative min-w-0">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="subscriber-search"
            type="search"
            placeholder="Search by subscriber email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-w-0 rounded-lg border border-slate-300 py-3 pl-10 pr-3 outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* SUBSCRIBERS */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="font-bold text-slate-900">
            Subscriber List
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredSubscribers.length} subscriber(s) found
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            <RefreshCw
              size={24}
              className="mx-auto mb-3 animate-spin text-[#0E4B32]"
            />
            Loading subscribers...
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Mail
              size={40}
              className="mx-auto mb-3 text-slate-300"
            />

            <h3 className="text-lg font-semibold text-slate-700">
              No subscribers found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try another email search or refresh the subscriber list.
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* MOBILE CARDS */}
            <div className="space-y-3 p-3 md:hidden">
              {filteredSubscribers.map((subscriber, index) => (
                <div
                  key={subscriber.id || subscriber.email}
                  className="min-w-0 rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                      <Mail size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-all font-semibold text-slate-900">
                        {subscriber.email}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Subscriber #{index + 1}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    {subscriber.isActive !== false ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        Inactive
                      </span>
                    )}

                    <span className="text-right text-xs text-slate-500">
                      Subscribed:{" "}
                      {subscriber.createdAt
                        ? new Date(
                            subscriber.createdAt
                          ).toLocaleDateString("en-GB")
                        : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[650px] text-left">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-600">
                      #
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                      Email
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-600">
                      Subscribed Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSubscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber.id || subscriber.email}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                            <Mail size={17} />
                          </div>

                          <span className="break-all font-medium text-slate-800">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {subscriber.isActive !== false ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {subscriber.createdAt
                          ? new Date(
                              subscriber.createdAt
                            ).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
