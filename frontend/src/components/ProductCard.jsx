import './ProductCard.css';

export default function ProductCard({ product, onAddToCart, isAdmin }) {
  return (
    <div className="product-card">
      <div className="product-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-image-placeholder">No Image</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {!isAdmin && product.stock > 0 && (
            <button
              className="btn-add-to-cart"
              onClick={() => onAddToCart(product)}
            >
              Add to Cart
            </button>
          )}
          {!isAdmin && product.stock === 0 && (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
        {product.stock > 0 && product.stock <= 10 && (
          <p className="stock-warning">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
}
