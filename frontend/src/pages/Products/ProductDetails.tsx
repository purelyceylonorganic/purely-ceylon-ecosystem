import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios"; // ✅ Q&A API அழைப்புகளுக்கு நேரடியாக இம்போர்ட் செய்யப்பட்டுள்ளது

import { productService } from "../../services/product.service";
import { cartService } from "../../services/cart.service";
import { wishlistService } from "../../services/wishlist.service"; 
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { reviewService } from "../../services/review.service"; 
import { useAuth } from "../../context/AuthContext"; 
import { setSEO } from "../../utils/seo";
import type { Product } from "../../types/product.types";

import ProductGallery from "../../components/product/ProductGallery";
import QuantitySelector from "../../components/product/QuantitySelector";
import StockBadge from "../../components/product/StockBadge";
import VariantSelector from "../../components/product/VariantSelector";

export default function ProductDetails() {
  const { id } = useParams();
  const { refreshCart } = useCart(); 
  const { refreshWishlist } = useWishlist();
  const { user } = useAuth(); 

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [addingWishlist, setAddingWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  // 📝 Reviews-க்கான ஸ்டேட்கள்
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // ✅ Review Edit செய்வதற்கான ஸ்டேட்கள்
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  // 🙋‍♂️ STEP 5: Q&A Section-க்கான புதிய ஸ்டேட்கள்
  const [questions, setQuestions] = useState<any[]>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [sellerAnswer, setSellerAnswer] = useState("");

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  async function loadProduct(productId: string) {
    try {
      setLoading(true);
      setError("");

      const productRes = await productService.getProductById(productId);
      setProduct(productRes);

      if(productRes.variants?.length > 0) {
        setSelectedVariant(productRes.variants[0]);
      }

      // Reviews லோட் செய்தல்
      try {
        const reviewRes = await reviewService.getProductReviews(productId);
        setReviews(reviewRes.reviews ?? []);
        setAverageRating(reviewRes.averageRating ?? 0);
        setTotalReviews(reviewRes.totalReviews ?? 0);
      } catch (reviewErr) {
        console.warn("Review API Error:", reviewErr);
        setReviews([]); 
      }

      // 🙋‍♂️ STEP 8: Q&A தரவுகளை ஆரம்பத்தில் லோட் செய்தல் (Live Refresh-ன் பகுதி)
      try {
        const questionRes = await api.get(`/questions/${productId}`);
        setQuestions(questionRes.data.questions ?? []);
      } catch (qErr) {
        console.warn("Questions failed to load:", qErr);
        setQuestions([]);
      }

    } catch (err) {
      console.error("Critical Product Load Error:", err);
      setError("Product load செய்ய முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  if (!product) return;

  setSEO({
    title: `${product.name} | Purely Ceylon Organic`,
    description:
      product.description?.slice(0, 155) ||
      `Buy premium ${product.name} from Purely Ceylon Organic. Authentic Sri Lankan organic products with complete traceability.`,
    image:
      product.images?.[0]?.url ||
      "/logo/pco-logo.png",
  });
}, [product]);


  // ==========================
  // 🛒 ADD TO CART
  // ==========================
  async function handleAddToCart() {
    if (!selectedVariant) {
      alert("Please select a variant.");
      return;
    }

    try {
      const response = await cartService.addToCart(selectedVariant.id, quantity);
      alert(response.message);
      await refreshCart();
    } catch (error: any) {
      console.error(error.response?.data);
      alert(error?.response?.data?.message || "Add to cart failed.");
    }
  }

  // ==========================
  // ❤️ ADD TO WISHLIST
  // ==========================
  async function handleWishlist() {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }

    try {
      setAddingWishlist(true);
      const response = await wishlistService.addToWishlist(selectedVariant.id);
      alert(response.message);
      await refreshWishlist(); 
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? "Failed to add wishlist");
    } finally {
      setAddingWishlist(false);
    }
  }

  // ==========================
  // ⭐ SUBMIT NEW REVIEW
  // ==========================
  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmittingReview(true);
      const res = await reviewService.createReview(id, userRating, userComment);
      alert(res.message || "Review added successfully!");
      
      setUserComment(""); 
      
      const reviewRes = await reviewService.getProductReviews(id);
      setReviews(reviewRes.reviews ?? []);
      setAverageRating(reviewRes.averageRating ?? 0);
      setTotalReviews(reviewRes.totalReviews ?? 0);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to add review. Make sure you are logged in.");
    } finally {
      setSubmittingReview(false);
    }
  }

  // ==========================
  // 🗑 DELETE REVIEW ACTION
  // ==========================
  async function handleDeleteReview(reviewId: string) {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      alert("Review Deleted");

      if (id) {
        const reviewRes = await reviewService.getProductReviews(id);
        setReviews(reviewRes.reviews ?? []);
        setAverageRating(reviewRes.averageRating ?? 0);
        setTotalReviews(reviewRes.totalReviews ?? 0);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Delete failed");
    }
  }

  // ==========================
  // ✏️ OPEN EDIT POPUP
  // ==========================
  function openEdit(review: any) {
    setEditingReviewId(review.id || review._id);
    setEditRating(review.rating);
    setEditComment(review.comment ?? "");
  }

  // ==========================
  // 💾 SAVE UPDATED REVIEW
  // ==========================
  async function handleUpdateReview() {
    if (!editingReviewId) return;

    try {
      await reviewService.updateReview(editingReviewId, editRating, editComment);
      alert("Review Updated");
      setEditingReviewId(null);

      if (id) {
        const reviewRes = await reviewService.getProductReviews(id);
        setReviews(reviewRes.reviews ?? []);
        setAverageRating(reviewRes.averageRating ?? 0);
        setTotalReviews(reviewRes.totalReviews ?? 0);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Update failed");
    }
  }

  // ==========================
  // 🙋‍♂️ STEP 6: ASK A QUESTION ACTION
  // ==========================
  async function handleQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!user) {
      alert("Please log in to ask a question.");
      return;
    }

    try {
      setSubmittingQuestion(true);
      await api.post(`/questions/${id}`, { question: userQuestion });
      alert("✅ Question posted successfully!");
      setUserQuestion("");

      // 🔄 STEP 8: Live Refresh Questions
      const res = await api.get(`/questions/${id}`);
      setQuestions(res.data.questions ?? []);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to post question.");
    } finally {
      setSubmittingQuestion(false);
    }
  }

  // ==========================
  // 🔑 STEP 7: SELLER SUBMIT ANSWER ACTION
  // ==========================
  async function handleAnswerSubmit(questionId: string) {
    if (!sellerAnswer.trim() || !id) return;

    try {
      await api.put(`/questions/answer/${questionId}`, { answer: sellerAnswer });
      alert("✅ Answer added successfully!");
      setAnsweringQuestionId(null);
      setSellerAnswer("");

      // 🔄 STEP 8: Live Refresh Questions
      const res = await api.get(`/questions/${id}`);
      setQuestions(res.data.questions ?? []);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to submit answer.");
    }
  }

  // ==========================
  // 🗑 Q&A DELETE ACTION
  // ==========================
  async function handleDeleteQuestion(questionId: string) {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await api.delete(`/questions/${questionId}`);
      alert("🗑 Question Deleted");

      // 🔄 STEP 8: Live Refresh Questions
      const res = await api.get(`/questions/${id}`);
      setQuestions(res.data.questions ?? []);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Delete failed");
    }
  }

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: "40px" }}>Loading Product...</h2>;
  }

  if (error) {
    return <h2 style={{ textAlign: "center", color: "red", marginTop: "40px" }}>{error}</h2>;
  }

  if (!product) {
    return <h2 style={{ textAlign: "center", marginTop: "40px" }}>Product கிடைக்கவில்லை.</h2>;
  }

  return (
    <div className="mx-auto w-full max-w-[1300px] overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      
      {/* PRODUCT DETAILS GRID */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
        {/* LEFT */}
        <ProductGallery images={product.images} />

        {/* RIGHT */}
        <div>
          <span className="inline-flex rounded-full bg-[#0E4B32]/10 px-3 py-1.5 text-sm font-bold text-[#0E4B32]">
  🌿 Organic Product
</span>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[#111111] sm:text-4xl lg:text-[42px]">
  {product.name}
</h1>

          <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base">
            {product.description}
          </p>

          <VariantSelector
            variants={product.variants ?? []}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
          />

          <hr style={{ margin: "20px 0" }} />

          <h2 className="mt-5 text-3xl font-extrabold text-[#0E4B32] sm:text-4xl">
  LKR{" "}
  {Number(
    selectedVariant?.price ??
      product?.basePrice ??
      0
  ).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</h2>

          <div className="mt-5 grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-3">
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
      Category
    </p>
    <p className="mt-1 text-sm font-semibold text-gray-800">
      {product.category?.name ?? "N/A"}
    </p>
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
      Weight
    </p>
    <p className="mt-1 text-sm font-semibold text-gray-800">
      {selectedVariant?.weight ??
        product.weight ??
        "N/A"}{" "}
      g
    </p>
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
      SKU
    </p>
    <p className="mt-1 break-all text-sm font-semibold text-gray-800">
      {selectedVariant?.sku ??
        product.sku ??
        "N/A"}
    </p>
  </div>
</div>

          <StockBadge stock={selectedVariant?.stock ?? product.stock} />

          <QuantitySelector quantity={quantity} setQuantity={setQuantity} />

          {/* BUTTON CONTAINER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            <button
              onClick={handleWishlist}
              disabled={addingWishlist}
              style={{
                width: "100%",
                padding: "14px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {addingWishlist ? "Adding to Wishlist..." : "❤️ Add To Wishlist"}
            </button>

            <button
              onClick={handleAddToCart}
              style={{
                width: "100%",
                padding: "15px",
                background: "#0E4B32",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              🛒 Add {quantity} To Cart
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🙋‍♂️ STEP 5 & 9: AMAZON STYLE CUSTOMER Q&A SECTION */}
      {/* ======================================================== */}
      <div className="mt-12 border-t border-gray-200 pt-8 sm:mt-16 sm:pt-10">
        <h2 style={{ fontSize: "24px", color: "#0E4B32", marginBottom: 20 }}>Customer Questions & Answers</h2>

        {/* WRITE A QUESTION FORM (Step 6) */}
        <form
  onSubmit={handleQuestionSubmit}
  className="mb-10 flex w-full flex-col gap-3 sm:flex-row"
>
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Have a question? Search or ask the seller about organic features..."
            style={{ flex: 1, padding: "14px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px" }}
            required
          />
          <button
  type="submit"
  disabled={submittingQuestion}
  className="min-h-[50px] w-full rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
>
  {submittingQuestion ? "Asking..." : "Ask"}
</button>
        </form>

        {/* QUESTIONS AND ANSWERS LIST */}
        <div className="flex flex-col gap-6">
          {questions.length === 0 ? (
            <p className="text-gray-500 italic">No questions asked yet. Be the first to ask!</p>
          ) : (
            questions.map((q: any) => (
              <div key={q.id} className="flex flex-col gap-2">
                
                {/* QUESTION DISPLAY ROW */}
                <div className="flex gap-3.5 items-start">
                  <span className="font-bold text-gray-600">Q:</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800" style={{ margin: 0, fontSize: "16px" }}>{q.question}</p>
                    <small className="text-gray-500">Asked by {q.user?.fullName ?? "Customer"}</small>
                  </div>

                  {/* DELETE QUESTION BUTTON */}
                  {(user?.id === q.userId || user?.role === "SELLER" || user?.role === "ADMIN") && (
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>

                {/* ANSWER DISPLAY ROW */}
                <div className="flex gap-3.5 items-start" style={{ paddingLeft: "5px" }}>
                  <span className="font-bold text-green-600" style={{ fontSize: "16px" }}>A:</span>
                  <div className="flex-1">
                    {q.answer ? (
                      <div>
                        <p style={{ margin: 0, color: "#444", lineHeight: "1.6" }}>{q.answer}</p>
                        <small style={{ color: "#0E4B32", fontWeight: "500" }}>🌿 Verified Seller Answer</small>
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: 0, color: "#888", fontStyle: "italic" }}>No answer yet from the seller.</p>
                        
                        {/* SELLER ANSWER INPUT FORM (Step 7) */}
                        {(user?.role === "SELLER" || user?.role === "ADMIN") && (
                          <div style={{ marginTop: "10px" }}>
                            {answeringQuestionId === q.id ? (
                              <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                                <input
                                  type="text"
                                  value={sellerAnswer}
                                  onChange={(e) => setSellerAnswer(e.target.value)}
                                  placeholder="Type your official response..."
                                  style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #999" }}
                                />
                                <button
                                  onClick={() => handleAnswerSubmit(q.id)}
                                  style={{ background: "#0E4B32", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                                >
                                  Submit
                                </button>
                                <button
                                  onClick={() => setAnsweringQuestionId(null)}
                                  style={{ background: "#e5e7eb", color: "#333", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAnsweringQuestionId(q.id)}
                                style={{ background: "#f3f4f6", border: "1px solid #ccc", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                              >
                                ✍️ Answer this question
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <hr style={{ border: 0, borderTop: "1px dashed #eee", marginTop: "15px" }} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* ⭐ REVIEWS & RATINGS SECTION */}
      {/* ======================================================== */}
      <div className="mt-12 border-t border-gray-200 pt-8 sm:mt-16 sm:pt-10">
        <h2 className="text-xl font-bold text-gray-800">Customer Reviews & Ratings</h2>

        {/* RATING OVERVIEW */}
        <div className="flex items-center gap-3.5 mb-7">
          <span className="text-3xl font-bold" style={{ color: "#f59e0b" }}>
            {"⭐".repeat(Math.round(averageRating))}
          </span>
          <div>
            <h2 style={{ margin: 0 }}>{averageRating} / 5</h2>
            <p style={{ margin: 0, color: "#666" }}>{totalReviews} Reviews</p>
          </div>
        </div>

        {/* WRITE A REVIEW FORM */}
        <form
  onSubmit={handleReviewSubmit}
  className="mb-10 rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm sm:p-6"
>
          <h3 className="mb-4 text-lg font-bold text-gray-800">Write a Review</h3>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Rating:</label>
            <select 
              value={userRating} 
              onChange={(e) => setUserRating(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10 sm:w-auto"
            >
              <option value="5">5 ⭐⭐⭐⭐⭐ (Excellent)</option>
              <option value="4">4 ⭐⭐⭐⭐ (Good)</option>
              <option value="3">3 ⭐⭐⭐ (Average)</option>
              <option value="2">2 ⭐⭐ (Poor)</option>
              <option value="1">1 ⭐ (Very Bad)</option>
            </select>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", color: "#555" }}>Your Comment:</label>
            <textarea
              rows={4}
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Share your genuine experience with this purely organic product..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0E4B32] focus:ring-2 focus:ring-[#0E4B32]/10"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={submittingReview}
            className="min-h-[48px] w-full rounded-xl bg-[#0E4B32] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {/* REVIEWS LIST */}
        <div>
          {reviews.length === 0 ? (
            <p style={{ color: "#777", fontStyle: "italic" }}>No reviews yet for this product. Be the first to review!</p>
          ) : (
            reviews.map((rev: any) => (
              <div key={rev.id || rev._id} style={{ borderBottom: "1px solid #eee", padding: "20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4>👤 {rev.user?.fullName || rev.user?.name || "Verified Buyer"}</h4>
                    <div style={{ color: "#f59e0b", fontSize: "20px" }}>
                      {"⭐".repeat(rev.rating)}
                    </div>
                  </div>
                </div>
                
                <p style={{ marginTop: 15, color: "#555", lineHeight: "1.6" }}>{rev.comment}</p>
                <small style={{ color: "#999" }}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </small>

                {user?.id === rev.userId && (
                  <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                    <button
                      onClick={() => openEdit(rev)}
                      style={{ background: "#e0e0e0", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(rev.id || rev._id)}
                      style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* EDIT REVIEW POPUP MODAL */}
      {editingReviewId && (
        <div
  className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
>
          <div className="max-h-[90vh] w-full max-w-[450px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <h2 className="mb-4 text-lg font-bold text-gray-800">Edit Review</h2>

            <label className="mb-2 block text-sm font-semibold text-gray-700">Rating:</label>
            <select
              value={editRating}
              onChange={(e) => setEditRating(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#0E4B32]"
            >
              <option value={5}>⭐⭐⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={1}>⭐</option>
            </select>

            <label className="mb-2 block text-sm font-semibold text-gray-700" style={{ marginTop: 20 }}>
              Comment:
            </label>
            <textarea
              rows={5}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#0E4B32]"
            />

            <div
              className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
            >
              <button
                onClick={() => setEditingReviewId(null)}
                style={{ background: "#6b7280", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateReview}
                style={{ background: "#0E4B32", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}