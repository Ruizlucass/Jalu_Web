import { reviews } from "../utils/siteData.js";

export default function Comentarios() {
  return (
    <section className="section reviews-section">
      <div className="section-header">
        <div>
          <span className="eyebrow">Reseñas</span>
          <h2 className="section-title">Lo que mas se repite</h2>
        </div>
        
      </div>

      <div className="review-grid">
        {reviews.map((review) => (
          <article className="review-card" key={review.quote}>
            <div className="review-card-top">
              <span className="review-rating">{review.rating}</span>
              <span className="review-tag">{review.tag}</span>
            </div>
            <strong>{review.quote}</strong>
            <p>{review.detail}</p>
            <div className="review-author">
              <span>{review.author}</span>
              <small>Cliente Jalu</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
