
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FolderPlus,
  RefreshCw,
  Folder,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { categoryService } from "../../../services/category.service";
import type { Category } from "../../../types/category";

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    setLoading(true);

    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
      toast.error("Categories-ஐப் பெற முடியவில்லை");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  function handleNameChange(value: string) {
    setName(value);

    // English names can generate a URL slug automatically.
    // For Tamil/Sinhala names, enter an English slug manually.
    const generatedSlug = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setSlug(generatedSlug);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanSlug = slug.trim().toLowerCase();

    if (!cleanName) {
      toast.error("Category பெயரை உள்ளிடவும்");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      toast.error("சரியான English URL slug-ஐ உள்ளிடவும்");
      return;
    }

    setSaving(true);

    try {
      await categoryService.createCategory({
        name: cleanName,
        slug: cleanSlug,
      });

      toast.success("Category உருவாக்கப்பட்டது");
      setName("");
      setSlug("");
      await loadCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Category உருவாக்க முடியவில்லை"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
      {/* Page Heading */}
      <header>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0E4B32] text-[#D4AF37]">
            <Folder size={22} />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-[#0E4B32] sm:text-2xl">
              Category Management
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              உங்கள் Purely Ceylon products-ஐ category அடிப்படையில்
              நிர்வகிக்கவும்.
            </p>
          </div>
        </div>
      </header>

      {/* Create Category Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="border-b border-gray-100 pb-3">
          <h3 className="font-bold text-gray-900">
            Add New Category
          </h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            புதிய product category ஒன்றை உருவாக்கவும்.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="min-w-0">
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Category Name
            </label>
            <input
              id="category-name"
              value={name}
              onChange={(event) =>
                handleNameChange(event.target.value)
              }
              placeholder="e.g. Ceylon Spices"
              required
              maxLength={100}
              className="min-h-12 w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="category-slug"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              URL Slug
            </label>
            <input
              id="category-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="ceylon-spices"
              required
              maxLength={120}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              title="Use lowercase English letters, numbers and hyphens."
              className="min-h-12 w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Lowercase English letters, numbers மற்றும் hyphens மட்டும்.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B32] px-5 py-3 font-bold text-white transition hover:bg-[#093b27] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <FolderPlus size={19} />
          {saving ? "Saving..." : "Add Category"}
        </button>
      </form>

      {/* Category List */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900">
              Existing Categories
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {categories.length} categories
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadCategories()}
            disabled={loading}
            aria-label="Refresh categories"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-[#0E4B32] transition hover:bg-[#FFF8EE] disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500">
            <RefreshCw size={17} className="animate-spin" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Folder
              size={32}
              className="mx-auto text-gray-300"
            />
            <p className="mt-3 font-semibold text-gray-700">
              No categories yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              முதலில் ஒரு category உருவாக்கவும்.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
              {categories.map((category) => (
                <article
                  key={category.id}
                  className="min-w-0 rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF8EE] text-[#0E4B32]">
                      <Folder size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="break-words font-bold text-gray-900">
                        {category.name}
                      </h4>

                      <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                        <Hash
                          size={15}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />
                        <span className="break-all">
                          {category.slug}
                        </span>
                      </div>

                      <p className="mt-2 break-all text-xs leading-5 text-gray-400">
                        ID: {category.id}
                      </p>
                    </div>

                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-[#0E4B32]"
                    />
                  </div>
                </article>
              ))}
            </div>

            {/* Tablet and Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FFF8EE] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Category Name</th>
                    <th className="px-5 py-4">URL Slug</th>
                    <th className="px-5 py-4">Category ID</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {category.name}
                      </td>
                      <td className="break-all px-5 py-4 text-gray-600">
                        {category.slug}
                      </td>
                      <td className="max-w-xs break-all px-5 py-4 text-xs text-gray-400">
                        {category.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
