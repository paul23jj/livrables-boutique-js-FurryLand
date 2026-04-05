(() => {
    const configuredApiBase = document.body.dataset.apiBase || document.documentElement.dataset.apiBase;
    const fallbackApiBase = `${window.location.origin}/api`;
    const API_BASE = configuredApiBase || fallbackApiBase;
    const CART_STORAGE_KEY = 'furryland-cart';
    const currencyFormatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });

    const state = {
        categories: [],
        products: [],
        selectedCategory: 'all',
        searchTerm: '',
        sortBy: 'featured',
        cart: loadCart(),
        isLoading: true,
        statusText: 'Chargement du catalogue...',
        statusType: 'info',
        carouselIndices: {}
    };

    const refs = {};

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        cacheRefs();
        if (!refs.root) {
            return;
        }
        bindEvents();
        renderAll();
        void loadCatalogue();
    }

    function cacheRefs() {
        const root = document.getElementById('app');

        refs.root = root;
        if (!root) {
            return;
        }
        refs.searchInput = root.querySelector('#search-input');
        refs.categorySelect = root.querySelector('#category-select');
        refs.sortSelect = root.querySelector('#sort-select');
        refs.statusMessage = root.querySelector('#status-message');
        refs.resultsCount = root.querySelector('#results-count');
        refs.productsGrid = root.querySelector('#products-grid');
        refs.cartItems = root.querySelector('#cart-items');
        refs.cartTotal = root.querySelector('#cart-total');
        refs.cartCount = root.querySelector('#cart-count');
        refs.clearCartButton = root.querySelector('#clear-cart-button');
        refs.statProducts = root.querySelector('#stat-products');
        refs.statCategories = root.querySelector('#stat-categories');
        refs.statStock = root.querySelector('#stat-stock');
        refs.statCart = root.querySelector('#stat-cart');
    }

    function updateSliderPosition (productId) {
        const currentIndex = state.carouselIndices[productId] || 0;

        const card = document.querySelector(`[data-product-id="${productId}"]`);
        const slider = card.querySelector('.product-slider');

        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function bindEvents() {
        refs.searchInput.addEventListener('input', (event) => {
            state.searchTerm = event.target.value.trim();
            renderProducts();
        });

        refs.categorySelect.addEventListener('change', (event) => {
            state.selectedCategory = event.target.value;
            renderProducts();
        });

        refs.sortSelect.addEventListener('change', (event) => {
            state.sortBy = event.target.value;
            renderProducts();
        });

        refs.clearCartButton.addEventListener('click', () => {
            if (state.cart.length === 0) {
                setStatus('Le panier est deja vide.', 'info');
                return;
            }

            state.cart = [];
            persistCart();
            setStatus('Le panier a ete vide.', 'success');
            renderAll();
        });

        refs.root.addEventListener('click', (event) => {
            const sliderBtn = event.target.closest('[data-slider-action]');
            if (sliderBtn) {
                const action = sliderBtn.dataset.sliderAction; // "prev" ou "next"
                const productId = Number(sliderBtn.closest('[data-product-id]').dataset.productId);
                const product = state.products.find(p => p.id === productId);

                // On initialise l'index si c'est le premier clic
                if (state.carouselIndices[productId] === undefined) {
                    state.carouselIndices[productId] = 0;
                }

                if (action === 'next') {
                    // On avance, mais on ne dépasse pas la dernière image
                    if (state.carouselIndices[productId] < product.gallery.length - 1) {
                        state.carouselIndices[productId]++;
                    } else {
                        state.carouselIndices[productId] = 0; // Optionnel : boucle au début
                    }
                } else {
                    // On recule, mais on ne descend pas en dessous de 0
                    if (state.carouselIndices[productId] > 0) {
                        state.carouselIndices[productId]--;
                    } else {
                        state.carouselIndices[productId] = product.gallery.length - 1; // Optionnel : boucle à la fin
                    }
                }

                updateSliderPosition(productId);
            }
            const addButton = event.target.closest('[data-add-to-cart]');
            if (addButton) {
                addToCart(Number(addButton.dataset.addToCart));
                return;
            }

            const cartActionButton = event.target.closest('[data-cart-action]');
            if (!cartActionButton) {
                return;
            }

            const productId = Number(cartActionButton.dataset.productId);
            const action = cartActionButton.dataset.cartAction;

            if (action === 'increase') {
                updateCartQuantity(productId, 1);
                return;
            }

            if (action === 'decrease') {
                updateCartQuantity(productId, -1);
                return;
            }

            if (action === 'remove') {
                removeFromCart(productId);
            }
        });
    }

    async function loadCatalogue() {
        state.isLoading = true;
        setStatus('Chargement du catalogue...', 'info');
        renderAll();

        const [categoriesResult, productsResult] = await Promise.allSettled([
            fetchJson(`${API_BASE}/categories`),
            fetchJson(`${API_BASE}/products`)
        ]);

        if (productsResult.status === 'rejected') {
            state.isLoading = false;
            state.products = [];
            state.categories = [];
            setStatus(
                "Impossible de charger l'API. Lance le backend sur http://localhost:8080 et sers le frontend depuis la meme origine.",
                'error'
            );
            renderAll();
            return;
        }

        state.products = productsResult.value.map(normalizeProduct);
        state.categories = categoriesResult.status === 'fulfilled'
            ? categoriesResult.value.map(normalizeCategory)
            : [];
        syncCartWithProducts();
        state.isLoading = false;

        if (categoriesResult.status === 'rejected') {
            setStatus('Produits charges, mais les categories sont indisponibles.', 'warning');
        } else {
            setStatus('', 'info');
        }

        renderAll();
    }

    async function fetchJson(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur API ${response.status}`);
        }

        return response.json();
    }

    function normalizeCategory(category) {
        return {
            id: Number(category.id),
            name: cleanText(category.name || 'Sans categorie')
        };
    }

    function normalizeProduct(product) {
        return {
            id: Number(product.id),
            categoryId: Number(product.category_id),
            name: cleanText(product.name || 'Produit sans nom'),
            description: cleanText(product.description || ''),
            price: Number(product.price) || 0,
            stock: Number(product.stock) || 0,
            imageUrl: product.image_url_1 || product.image_url_2 || product.image_url_3 || '',
            gallery: [product.image_url_1, product.image_url_2, product.image_url_3].filter(Boolean)
        };
    }

    function cleanText(value) {
        const text = typeof value === 'string' ? value.trim() : '';

        if (!text || !/[\u00C3\u00C2\u00E2]/.test(text) || typeof TextDecoder === 'undefined') {
            return text;
        }

        try {
            const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
            return new TextDecoder('utf-8').decode(bytes);
        } catch {
            return text;
        }
    }

    function renderAll() {
        renderFilters();
        renderStatus();
        renderStats();
        renderProducts();
        renderCart();
    }

    function renderFilters() {
        const categoryOptions = [
            '<option value="all">Toutes les categories</option>',
            ...state.categories.map((category) => `
                <option value="${category.id}">${escapeHtml(category.name)}</option>
            `)
        ];

        refs.categorySelect.innerHTML = categoryOptions.join('');
        refs.categorySelect.value = state.selectedCategory;
        refs.sortSelect.value = state.sortBy;
        refs.searchInput.value = state.searchTerm;
    }

    function renderStatus() {
        refs.statusMessage.textContent = state.statusText;
        refs.statusMessage.dataset.state = state.statusType;
        refs.statusMessage.hidden = state.statusText.length === 0;
    }

    function renderStats() {
        refs.statProducts.textContent = String(state.products.length);
        refs.statCategories.textContent = String(state.categories.length);
        refs.statStock.textContent = String(state.products.reduce((total, product) => total + product.stock, 0));
        refs.statCart.textContent = String(getCartQuantityTotal());
    }

    function renderProducts() {
        const visibleProducts = getVisibleProducts();
        refs.resultsCount.textContent = `${visibleProducts.length} ${pluralize(visibleProducts.length, 'resultat', 'resultats')}`;

        // --- BLOCS DE SÉCURITÉ (Skeletons, Erreurs, Vide) ---
        if (state.isLoading) {
            refs.productsGrid.innerHTML = Array.from({ length: 6 }, () => `
            <article class="product-card skeleton-card" aria-hidden="true">
                <div class="skeleton-media"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
            </article>
        `).join('');
            return;
        }

        if (state.products.length === 0) {
            refs.productsGrid.innerHTML = `<article class="empty-state"><h3>Aucun produit chargé</h3>...</article>`;
            return;
        }

        if (visibleProducts.length === 0) {
            refs.productsGrid.innerHTML = `<article class="empty-state"><h3>Aucun résultat</h3>...</article>`;
            return;
        }

        // --- ÉTAPE 1 : ON DESSINE TOUT D'UN COUP ---
        // On génère TOUT le HTML et on l'injecte une seule fois.
        refs.productsGrid.innerHTML = visibleProducts.map((product) => createProductCard(product)).join('');

        // --- ÉTAPE 2 : ON AJUSTE LES POSITIONS ---
        // Maintenant que les cartes existent dans le DOM, on peut les manipuler.
        visibleProducts.forEach(product => {
            if (state.carouselIndices[product.id]) {
                updateSliderPosition(product.id);
            }
        });
    }

    function createProductCard(product) {
        const quantityInCart = getCartItemQuantity(product.id);
        const isOutOfStock = product.stock <= 0;
        const reachedStockLimit = quantityInCart >= product.stock && product.stock > 0;
        const buttonLabel = isOutOfStock
            ? 'Rupture de stock'
            : reachedStockLimit
                ? 'Stock deja reserve'
                : 'Ajouter au panier';

        // On vérifie s'il y a plusieurs images pour afficher les contrôles
        const hasMultipleImages = product.gallery.length > 1;

        return `
        <article class="product-card" data-product-id="${product.id}">
            <div class="product-media">
                <div class="product-slider">
                    ${product.gallery.length > 0
            ? product.gallery.map(url =>
                `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(product.name)}">`
            ).join('')
            : '<div class="product-placeholder">Image indisponible</div>'
        }
                </div>
                
                <span class="product-badge">${escapeHtml(getCategoryName(product.categoryId))}</span>

                ${hasMultipleImages ? `
                    <button class="slider-btn prev" aria-label="Image précédente" data-slider-action="prev">❮</button>
                    <button class="slider-btn next" aria-label="Image suivante" data-slider-action="next">❯</button>
                ` : ''}
            </div>

            <div class="product-content">
                <div class="product-heading">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="product-price">${formatPrice(product.price)}</p>
                </div>

                <p class="product-description">${escapeHtml(truncateText(product.description, 150))}</p>

                <div class="product-meta">
                    <span>${product.stock} ${pluralize(product.stock, 'piece', 'pieces')} restantes</span>
                    <span>${quantityInCart} dans le panier</span>
                </div>
            </div>

            <button
                class="primary-button"
                type="button"
                data-add-to-cart="${product.id}"
                ${isOutOfStock || reachedStockLimit ? 'disabled' : ''}
            >
                ${buttonLabel}
            </button>
        </article>
    `;
    }

    function renderCart() {
        const cartItems = getDetailedCartItems();
        const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = cartItems.reduce((total, item) => total + (item.quantity * item.product.price), 0);

        refs.cartCount.textContent = `${totalQuantity} ${pluralize(totalQuantity, 'article', 'articles')}`;
        refs.cartTotal.textContent = formatPrice(totalPrice);
        refs.clearCartButton.disabled = cartItems.length === 0;

        if (cartItems.length === 0) {
            refs.cartItems.innerHTML = `
                <article class="empty-state compact">
                    <h3>Panier vide</h3>
                    <p>Ajoute quelques produits pour tester les interactions du front.</p>
                </article>
            `;
            return;
        }

        refs.cartItems.innerHTML = cartItems.map(({ product, quantity }) => `
            <article class="cart-item">
                <div class="cart-item-copy">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${formatPrice(product.price)} l'unite</p>
                </div>

                <div class="cart-item-controls">
                    <button type="button" data-cart-action="decrease" data-product-id="${product.id}">-</button>
                    <span>${quantity}</span>
                    <button
                        type="button"
                        data-cart-action="increase"
                        data-product-id="${product.id}"
                        ${quantity >= product.stock ? 'disabled' : ''}
                    >
                        +
                    </button>
                    <button type="button" data-cart-action="remove" data-product-id="${product.id}">
                        Supprimer
                    </button>
                </div>
            </article>
        `).join('');
    }

    function getVisibleProducts() {
        const selectedCategoryId = state.selectedCategory === 'all'
            ? null
            : Number(state.selectedCategory);
        const normalizedSearch = state.searchTerm.toLowerCase();

        const filteredProducts = state.products.filter((product) => {
            const matchesCategory = selectedCategoryId === null || product.categoryId === selectedCategoryId;
            const searchableContent = `${product.name} ${product.description} ${getCategoryName(product.categoryId)}`.toLowerCase();
            const matchesSearch = normalizedSearch.length === 0 || searchableContent.includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });

        return filteredProducts.sort((firstProduct, secondProduct) => {
            switch (state.sortBy) {
            case 'price-asc':
                return firstProduct.price - secondProduct.price;
            case 'price-desc':
                return secondProduct.price - firstProduct.price;
            case 'stock-desc':
                return secondProduct.stock - firstProduct.stock;
            case 'name-asc':
                return firstProduct.name.localeCompare(secondProduct.name, 'fr');
            default:
                return firstProduct.id - secondProduct.id;
            }
        });
    }

    function getCategoryName(categoryId) {
        const category = state.categories.find((item) => item.id === categoryId);
        return category ? category.name : 'Sans categorie';
    }

    function addToCart(productId) {
        const product = state.products.find((item) => item.id === productId);

        if (!product) {
            setStatus('Produit introuvable.', 'error');
            return;
        }

        const existingItem = state.cart.find((item) => item.productId === productId);
        const currentQuantity = existingItem ? existingItem.quantity : 0;

        if (currentQuantity >= product.stock) {
            setStatus(`Le stock disponible pour "${product.name}" est deja atteint.`, 'warning');
            return;
        }

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            state.cart.push({ productId, quantity: 1 });
        }

        persistCart();
        setStatus(`"${product.name}" a ete ajoute au panier.`, 'success');
        renderAll();
    }

    function updateCartQuantity(productId, delta) {
        const item = state.cart.find((entry) => entry.productId === productId);
        const product = state.products.find((entry) => entry.id === productId);

        if (!item || !product) {
            return;
        }

        const nextQuantity = item.quantity + delta;

        if (nextQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (nextQuantity > product.stock) {
            setStatus(`Stock maximal atteint pour "${product.name}".`, 'warning');
            return;
        }

        item.quantity = nextQuantity;
        persistCart();
        renderAll();
    }

    function removeFromCart(productId) {
        const product = state.products.find((entry) => entry.id === productId);
        state.cart = state.cart.filter((entry) => entry.productId !== productId);
        persistCart();
        setStatus(product ? `"${product.name}" a ete retire du panier.` : 'Article retire du panier.', 'info');
        renderAll();
    }

    function getDetailedCartItems() {
        return state.cart
            .map((item) => ({
                quantity: item.quantity,
                product: state.products.find((product) => product.id === item.productId)
            }))
            .filter((item) => item.product);
    }

    function getCartItemQuantity(productId) {
        const item = state.cart.find((entry) => entry.productId === productId);
        return item ? item.quantity : 0;
    }

    function syncCartWithProducts() {
        const availableProducts = new Map(state.products.map((product) => [product.id, product]));

        state.cart = state.cart.reduce((nextCart, item) => {
            const product = availableProducts.get(item.productId);

            if (!product || product.stock <= 0) {
                return nextCart;
            }

            nextCart.push({
                productId: item.productId,
                quantity: Math.min(item.quantity, product.stock)
            });

            return nextCart;
        }, []);

        persistCart();
    }

    function getCartQuantityTotal() {
        return state.cart.reduce((total, item) => total + item.quantity, 0);
    }

    function loadCart() {
        try {
            const rawCart = localStorage.getItem(CART_STORAGE_KEY);
            const parsedCart = rawCart ? JSON.parse(rawCart) : [];

            if (!Array.isArray(parsedCart)) {
                return [];
            }

            return parsedCart
                .map((item) => ({
                    productId: Number(item.productId),
                    quantity: Number(item.quantity)
                }))
                .filter((item) => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0);
        } catch {
            return [];
        }
    }

    function persistCart() {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
        } catch {
            setStatus('Impossible de sauvegarder le panier dans le navigateur.', 'warning');
        }
    }

    function setStatus(text, type = 'info') {
        state.statusText = text;
        state.statusType = type;
        renderStatus();
    }

    function formatPrice(value) {
        return currencyFormatter.format(value);
    }

    function pluralize(value, singular, plural) {
        return value > 1 || value === 0 ? plural : singular;
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }

        return `${text.slice(0, maxLength - 1).trim()}...`;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }
})();
