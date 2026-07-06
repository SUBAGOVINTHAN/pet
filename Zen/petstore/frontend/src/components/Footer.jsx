import { Link } from "react-router-dom";
import { Heart, Phone, Mail, MapPin } from "lucide-react";
import msmeLogo from '../assets/footer.png';
import gstLogo from '../assets/gst.png';

export default function Footer() {
  return (
    <footer style={{ background: "#1C1C1C", color: "#ccc", marginTop: 64 }}>
      <div className="container" style={{ padding: "48px 24px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 40,
          }}
        >
          <div>
            <h3
              style={{
                color: "#F97316",
                fontFamily: "Playfair Display, serif",
                fontSize: 24,
                marginBottom: 12,
              }}
            >
              🐾 PetStore
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.8 }}>
              A pet store with everything you need. From daily nutrition to
              playful essentials, we've got it all.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: 16, fontWeight: 600 }}>
              Quick Links
            </h4>
            {[
              ["/", "Home"],
              ["/products", "Shop All"],
              ["/products?featured=true", "Featured"],
              ["/products?pet_type=dog", "Dogs"],
              ["/products?pet_type=cat", "Cats"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                style={{
                  display: "block",
                  color: "#aaa",
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: 16, fontWeight: 600 }}>
              My Account
            </h4>
            {[
              ["/profile", "Profile"],
              ["/orders", "Orders"],
              ["/wishlist", "Wishlist"],
              ["/cart", "Cart"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                style={{
                  display: "block",
                  color: "#aaa",
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: 16, fontWeight: 600 }}>
              Contact Us
            </h4>
            <p
              style={{
                fontSize: 14,
                marginBottom: 8,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                lineHeight: 1.6,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 2 }}>
                <MapPin size={15} color="#F97316" />
              </span>
              Bharathinagar, Keelakarai,
              <br /> Ramanathapuram ,<br /> Pin code - 623517
            </p>
            <p
              style={{
                fontSize: 14,
                marginBottom: 8,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span style={{ flexShrink: 0 }}>
                <Phone size={15} color="#F97316" />
              </span>
              +91 6369614154
            </p>
            <p
              style={{
                fontSize: 14,
                display: "flex",
                gap: 8,
                alignItems: "center",
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Mail size={15} color="#F97316" />
              </span>

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=dotpetfoods@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  cursor: "pointer",
                  lineHeight: "15px",
                }}
              >
                dotpetfoods@gmail.com
              </a>
            </p>
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid #333',
            paddingTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: '#666' }}>
            © 2025 PetStore. Made with{' '}
            <Heart size={12} color="#F97316" style={{ display: 'inline', margin: '0 3px' }} />{' '}
            for pets everywhere.
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={gstLogo}
                alt="GST"
                style={{
                  height: 32,
                  width: 'auto',
                  opacity: 0.9,
                }}
              />
              <span style={{ fontSize: 13, color: '#999' }}>
                GST No: 33FYWPR1378M1ZD
              </span>
            </div>

            <img
              src={msmeLogo}
              alt="Ministry of MSME, Govt. of India"
              style={{
                height: 44,
                width: 'auto',
                opacity: 0.7,
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}