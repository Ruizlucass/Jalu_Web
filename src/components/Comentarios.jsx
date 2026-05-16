import { reviews } from "../utils/siteData.js";

export default function Comentarios() {
  return (
    <section className="section">
      <div className="review-grid">
        {reviews.map((review) => (
          <article className="review-card" key={review.quote}>
            <strong>"{review.quote}"</strong>
            <p>{review.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
