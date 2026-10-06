import { useState } from "react";
import { customerService } from "../../services/customer.service";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react"; 

export function QuickCreateCustomer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await customerService.quickCreate({
  fullName: formData.fullName.trim(),
  phone: formData.phone.trim(),
});

const customerId =
  response?.data?.customer?.id;

const temporaryPassword =
  response?.data?.temporaryPassword;

if (customerId) {

  if (temporaryPassword) {
    alert(
      `Customer created successfully!\n\nTemporary Password: ${temporaryPassword}\n\nCustomer must change this password after login.`
    );
  }

  navigate(
    `/admin/customers/${customerId}/add-address`
  );

} else {
  throw new Error(
    "Customer ID not found in response"
  );
}
    } catch (error: unknown) {
      console.error("Failed to create customer:", error);
      
      let errorMessage = "Customer creation failed. Please try again.";
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        errorMessage = err.response?.data?.message || errorMessage;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

 return (
  <div className="mx-auto max-w-md">
    
    {/* Back to Customer Management */}
    <button
      type="button"
      onClick={() => navigate("/admin/customers")}
      className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      ← Back to Customer Management
    </button>

    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Quick Create Customer</h2>
        <p className="text-sm text-slate-500">Enter basic details to get started quickly.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1.5 transition-all"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Phone Number</label>
          <input
            type="tel"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1.5 transition-all"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Customer"
          )}
        </button>
      </form>
      </div>
      </div>
  );
}

export default QuickCreateCustomer;