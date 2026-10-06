import { useEffect, useState } from "react";
import { newsletterService } from "../../../services/newsletter.service";
import { toast } from "react-hot-toast";

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

      const response =
        await newsletterService.getSubscribers();

      setSubscribers(response.data || []);
    } catch (error: any) {
      console.error(
        "Failed to load newsletter subscribers:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load subscribers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Newsletter Subscribers
          </h1>

          <p className="text-gray-500 mt-1">
            Manage customers who subscribed to your newsletter.
          </p>
        </div>

        <button
          onClick={loadSubscribers}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Total Subscribers
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {subscribers.length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Active Subscribers
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              subscribers.filter(
                (subscriber) =>
                  subscriber.isActive !== false
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Search Results
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {filteredSubscribers.length}
          </h2>
        </div>

      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <input
          type="text"
          placeholder="Search subscriber email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading subscribers...
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="p-10 text-center">

            <div className="text-5xl mb-3">
              📧
            </div>

            <h3 className="text-lg font-semibold text-gray-700">
              No subscribers found
            </h3>

            <p className="text-gray-500 mt-1">
              Newsletter subscribers will appear here.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    #
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Email
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Subscribed Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {filteredSubscribers.map(
                  (subscriber, index) => (
                    <tr
                      key={
                        subscriber.id ||
                        subscriber.email
                      }
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                            📧
                          </div>

                          <span className="font-medium text-gray-800">
                            {subscriber.email}
                          </span>

                        </div>
                      </td>

                      <td className="px-6 py-4">

                        {subscriber.isActive !== false ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ● Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            ● Inactive
                          </span>
                        )}

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">

                        {subscriber.createdAt
                          ? new Date(
                              subscriber.createdAt
                            ).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"}

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
}