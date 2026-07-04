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
      setProduct(productRes.data);

      if (productRes.data.variants?.length > 0) {
        setSelectedVariant(productRes.data.variants[0]);
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
    <div style={{ maxWidth: "1300px", margin: "40px auto", padding: "20px" }}>
      
      {/* PRODUCT DETAILS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "50px",
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <ProductGallery images={product.images} />

        {/* RIGHT */}
        <div>
          <span style={{ color: "#0E4B32", fontWeight: "bold", fontSize: "22px" }}>
            🌿 Organic Product
          </span>

          <h1 style={{ marginTop: "10px", fontSize: "38px" }}>
            {product.name}
          </h1>

          <p style={{ color: "#666", lineHeight: 1.8, marginTop: "20px" }}>
            {product.description}
          </p>

          <VariantSelector
            variants={product.variants ?? []}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
          />

          <hr style={{ margin: "20px 0" }} />

          <h2 style={{ color: "#b12704", fontSize: "34px" }}>
            LKR {(selectedVariant?.price ?? product?.basePrice ?? 0).toFixed(2)}
          </h2>

          <div style={{ marginTop: "15px" }}>
            <p><strong>Category :</strong> {product.category?.name ?? "N/A"}</p>
            <p>
              <strong>Weight :</strong>{" "}
              {selectedVariant?.weight ?? product.weight ?? "N/A"} g
            </p>
            <p><strong>SKU :</strong> {selectedVariant?.sku ?? product.sku}</p>
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
      <div style={{ marginTop: 60, borderTop: "1px solid #eee", paddingTop: 40 }}>
        <h2 style={{ fontSize: "24px", color: "#0E4B32", marginBottom: 20 }}>Customer Questions & Answers</h2>

        {/* WRITE A QUESTION FORM (Step 6) */}
        <form onSubmit={handleQuestionSubmit} style={{ display: "flex", gap: "10px", marginBottom: "40px" }}>
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
            style={{ padding: "0 30px", background: "#0E4B32", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
          >
            {submittingQuestion ? "Asking..." : "Ask"}
          </button>
        </form>

        {/* QUESTIONS AND ANSWERS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {questions.length === 0 ? (
            <p style={{ color: "#777", fontStyle: "italic" }}>No questions asked yet. Be the first to ask!</p>
          ) : (
            questions.map((q: any) => (
              <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                
                {/* QUESTION DISPLAY ROW */}
                <div style={{ display: "flex", gap: "15px", alignItems: "start" }}>
                  <span style={{ fontWeight: "bold", color: "#666", fontSize: "16px" }}>Q:</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: "bold", color: "#333", fontSize: "16px" }}>{q.question}</p>
                    <small style={{ color: "#999" }}>Asked by {q.user?.fullName ?? "Customer"}</small>
                  </div>

                  {/* DELETE QUESTION BUTTON */}
                  {(user?.id === q.userId || user?.role === "SELLER" || user?.role === "ADMIN") && (
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "14px" }}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>

                {/* ANSWER DISPLAY ROW */}
                <div style={{ display: "flex", gap: "15px", alignItems: "start", paddingLeft: "5px" }}>
                  <span style={{ fontWeight: "bold", color: "#0E4B32", fontSize: "16px" }}>A:</span>
                  <div style={{ flex: 1 }}>
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
      <div style={{ marginTop: 60, borderTop: "1px solid #eee", paddingTop: 40 }}>
        <h2 style={{ fontSize: "24px", color: "#0E4B32", marginBottom: 20 }}>Customer Reviews & Ratings</h2>

        {/* RATING OVERVIEW */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
          <span style={{ fontSize: "30px", color: "#f59e0b", fontWeight: "bold" }}>
            {"⭐".repeat(Math.round(averageRating))}
          </span>
          <div>
            <h2 style={{ margin: 0 }}>{averageRating} / 5</h2>
            <p style={{ margin: 0, color: "#666" }}>{totalReviews} Reviews</p>
          </div>
        </div>

        {/* WRITE A REVIEW FORM */}
        <form onSubmit={handleReviewSubmit} style={{ background: "#f9f9f9", padding: 25, borderRadius: 12, marginBottom: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#333" }}>Write a Review</h3>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", color: "#555" }}>Rating:</label>
            <select 
              value={userRating} 
              onChange={(e) => setUserRating(Number(e.target.value))}
              style={{ padding: "10px 15px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", fontSize: "14px" }}
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
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", boxSizing: "border-box", fontSize: "14px", resize: "vertical" }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={submittingReview}
            style={{ padding: "12px 28px", background: "#0E4B32", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 10,
              width: 450,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
            }}
          >
            <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Edit Review</h2>

            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", color: "#555" }}>Rating:</label>
            <select
              value={editRating}
              onChange={(e) => setEditRating(Number(e.target.value))}
              style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", fontSize: "14px" }}
            >
              <option value={5}>⭐⭐⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={1}>⭐</option>
            </select>

            <label style={{ display: "block", marginTop: 20, marginBottom: 5, fontWeight: "bold", color: "#555" }}>Comment:</label>
            <textarea
              rows={5}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box", fontSize: "14px", resize: "none" }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
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