import './ProductCard.css';

export default function ProductCard({ product, onAddToCart, isAdmin }) {
  const inStock = product.stock > 0;

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <div className="product-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} loading="lazy" />
          ) : (
            <div className="product-image-placeholder">No Image</div>
          )}
        </div>
        {product.category && (
          <div className="product-category">{product.category}</div>
        )}
        {!inStock && (
          <div className="product-badge-outofstock">Out of Stock</div>
        )}
        {inStock && product.stock <= 10 && (
          <div className="product-badge-warning">Only {product.stock} left</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        {product.specifications && (
          <div className="product-specs">
            <div className="specs-row">
              {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                <span key={key} className="spec-item">
                  <small>{key}:</small> {value}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="product-footer">
          <div className="price-section">
            <span className="product-price">${product.price.toFixed(2)}</span>
            <span className="stock-info">{inStock ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>
          {!isAdmin && inStock && (
            <button
              className="btn-add-to-cart"
              onClick={() => onAddToCart(product)}
            >
              🛒 Add to Cart
            </button>
          )}
          {!isAdmin && !inStock && (
            <button className="btn-add-to-cart disabled" disabled>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
