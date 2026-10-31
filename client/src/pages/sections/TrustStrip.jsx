
import "./TrustStrip.css";

const benefits = [
  "🎓 Student community",
  "🤝 Learn from peers",
  "💡 Skills over money",
  "🌱 Grow together",
];

export default function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="container trust-inner">
        <p>LEARNING IS BETTER TOGETHER</p>

        <div className="trust-items">
          {benefits.map((benefit) => (
            <span key={benefit}>{benefit}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
