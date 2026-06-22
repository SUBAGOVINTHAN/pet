import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star, ImageOff } from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { resolveImage } from "../utils/resolveImage";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const imageUrl = resolveImage(product.image);
  const [inWishlist, setInWishlist] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const discount = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : null;

  useEffect(() => {
    if (!user) return;
    api.get("/wishlist").then((r) => {
      const ids = r.data.map((w) => w.product_id);
      setInWishlist(ids.includes(product.id));
    }).catch(() => {});
  }, [user, product.id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please login first"); return; }
    if (inWishlist) {
      try {
        await api.delete(`/wishlist/${product.id}`);
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } catch { toast.error("Failed to remove"); }
    } else {
      try {
        await api.post("/wishlist", { product_id: product.id });
        setInWishlist(true);
        toast.success("Added to wishlist!");
      } catch { toast.error("Failed to add"); }
    }
  };

  return (
    <div
      className="card"
      style={{
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(249,115,22,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <Link to={`/products/${product.slug}`} style={{ display: "block", position: "relative" }}>

        {/* ── Image ── */}
        {imageUrl ? (
          <div style={{
            width: "100%",
            height: isMobile ? 150 : 200,
            backgroundColor: "#FFFFFF",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }} />
        ) : (
          <div style={{
            width: "100%",
            height: isMobile ? 150 : 200,
            background: "#FFF7F0",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "#F97316",
          }}>
            <ImageOff size={40} style={{ opacity: 0.4 }} />
            <p style={{ fontSize: 12, marginTop: 8, color: "#9CA3AF" }}>No image</p>
          </div>
        )}

        {/* ── Discount badge ── */}
        {discount && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: "#F97316", color: "#fff",
            borderRadius: 6,
            padding: isMobile ? "1px 5px" : "2px 8px",
            fontSize: isMobile ? 10 : 12,
            fontWeight: 700,
          }}>
            -{discount}%
          </span>
        )}

        {/* ── Wishlist button ── */}
        <button
          onClick={toggleWishlist}
          style={{
            position: "absolute", top: 8, right: 8,
            background: inWishlist ? "#FEE2E2" : "rgba(255,255,255,0.9)",
            border: "none", borderRadius: "50%",
            width: isMobile ? 28 : 34,
            height: isMobile ? 28 : 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: inWishlist ? "#EF4444" : "#F97316",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <Heart size={isMobile ? 13 : 16} fill={inWishlist ? "#EF4444" : "none"} />
        </button>
      </Link>

      {/* ── Card Info ── */}
      <div style={{ padding: isMobile ? "10px" : "16px" }}>

        {/* Category */}
        <p style={{
          fontSize: 10,
          color: "#F97316", fontWeight: 600,
          textTransform: "uppercase", marginBottom: 3,
        }}>
          {product.category_name || product.pet_type}
        </p>

        {/* Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 600, marginBottom: 6,
            lineHeight: 1.3, color: "#1C1C1C",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {product.name}
          </h3>
        </Link>

        {/* ── Stars ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: isMobile ? 8 : 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i} size={10}
              fill={i <= Math.round(product.rating || 0) ? "#F59E0B" : "none"}
              color="#F59E0B"
            />
          ))}
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>
            ({product.reviews_count || 0})
          </span>
        </div>

        {/* ── Price + Add button ── */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 6,
        }}>
          <div style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 3 }}>
            
            {/* Main price */}
            <span style={{
              fontWeight: 700,
              fontSize: isMobile ? 13 : 16,
              color: "#1C1C1C",
              whiteSpace: "nowrap",
            }}>
              <span style={{ fontFamily: "Arial, sans-serif" }}>₹</span>
              {(product.discount_price || product.price).toLocaleString()}
            </span>

            {/* Strikethrough price - full show, no ellipsis */}
            {product.discount_price && (
              <span style={{
                fontSize: isMobile ? 10 : 12,
                color: "#9CA3AF",
                textDecoration: "line-through",
                whiteSpace: "nowrap",
              }}>
                <span style={{ fontFamily: "Arial, sans-serif" }}>₹</span>
                {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add button */}
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.preventDefault(); addToCart(product.id); }}
            disabled={product.stock === 0}
            style={{
              padding: isMobile ? "5px 8px" : "6px 12px",
              fontSize: isMobile ? 11 : 12,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {product.stock === 0
              ? "Out"
              : <><ShoppingCart size={isMobile ? 11 : 13} /> Add</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}