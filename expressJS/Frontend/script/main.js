(() => {
    const PAGE = document.body.dataset.page || 'catalog';
    const API_BASE = document.body.dataset.apiBase || `${window.location.origin}/api`;
    const CART_STORAGE_KEY = 'furryland-cart-v2';
    const FAVORITES_STORAGE_KEY = 'furryland-favorites';
    const USER_STORAGE_KEY = 'furryland-user';
    const SHIPPING_STORAGE_KEY = 'furryland-shipping';
    const ORDER_DRAFT_STORAGE_KEY = 'furryland-order-drafts';

    const DEFAULT_SHIPPING = {
        fullName: '',
        line1: '',
        line2: '',
        city: '',
        postalCode: '',
        country: 'France',
        notes: ''
    };

    const COLOR_LIBRARY = [
        { id: 'gris', label: 'Gris', swatch: '#8a8f98', tokens: ['gris', 'grey', 'gray'] },
        { id: 'rose', label: 'Rose', swatch: '#ef98b3', tokens: ['rose', 'pink'] },
        { id: 'bleu', label: 'Bleu', swatch: '#5c81f1', tokens: ['bleu', 'blue', 'glacier', 'azur'] },
        { id: 'noir', label: 'Noir', swatch: '#23242a', tokens: ['noir', 'black'] },
        { id: 'blanc', label: 'Blanc', swatch: '#f7f4ed', tokens: ['blanc', 'white', 'ivoire'] },
        { id: 'vert', label: 'Vert', swatch: '#50a16c', tokens: ['vert', 'green', 'foret', 'emeraude'] },
        { id: 'rouge', label: 'Rouge', swatch: '#c84f47', tokens: ['rouge', 'red', 'corail', 'infernal'] },
        { id: 'orange', label: 'Orange', swatch: '#db7b41', tokens: ['orange', 'dor', 'gold', 'solaire'] },
        { id: 'violet', label: 'Violet', swatch: '#8b71d9', tokens: ['violet', 'purple', 'cosmique'] },
        { id: 'jaune', label: 'Jaune', swatch: '#e5bf4c', tokens: ['jaune', 'yellow'] },
        { id: 'turquoise', label: 'Turquoise', swatch: '#45b7ba', tokens: ['turquoise', 'cyber', 'aquatique'] },
        { id: 'beige', label: 'Beige', swatch: '#d7b894', tokens: ['beige', 'sable', 'arctique'] }
    ];

    const CATEGORY_COLOR_FALLBACKS = {
        1: ['gris', 'rose', 'orange'],
        2: ['noir', 'bleu', 'vert']
    };

    const currencyFormatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });

    const refs = {};

    const state = {
        categories: [],
        products: [],
        selectedCategory: 'all',
        searchTerm: '',
        sortBy: 'featured',
        cart: loadCart(),
        favorites: loadFavorites(),
        user: loadUser(),
        shipping: loadShipping(),
        selectedColors: {},
        detailProductId: getDetailProductId(),
        detailImageIndex: 0,
        detailDescriptionExpanded: false,
        authMode: 'login',
        authMessage: '',
        authMessageType: 'info',
        isLoading: true,
        statusText: PAGE === 'catalog' ? 'Chargement du catalogue...' : '',
        statusType: 'info'
    };

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        cacheRefs();
        bindEvents();
        renderAll();

        if (PAGE === 'product' && !state.detailProductId) {
            state.isLoading = false;
            setStatus('Produit introuvable. Retourne au catalogue et rouvre une fiche valide.', 'error');
            renderAll();
            return;
        }

        void loadCatalogue();
    }

    function cacheRefs() {
        refs.statusMessage = document.getElementById('status-message');
        refs.headerCartCount = document.getElementById('header-cart-count');
        refs.headerFavoritesCount = document.getElementById('header-favorites-count');
        refs.topbarAccountSlot = document.getElementById('topbar-account-slot');
        refs.heroAuthButton = document.getElementById('hero-auth-button');
        refs.accountSummary = document.getElementById('account-summary');
        refs.favoritesCount = document.getElementById('favorites-count');
        refs.favoritesGrid = document.getElementById('favorites-grid');
        refs.searchInput = document.getElementById('search-input');
        refs.categorySelect = document.getElementById('category-select');
        refs.sortSelect = document.getElementById('sort-select');
        refs.resultsCount = document.getElementById('results-count');
        refs.productsGrid = document.getElementById('products-grid');
        refs.cartItems = document.getElementById('cart-items');
        refs.cartCount = document.getElementById('cart-count');
        refs.cartTotal = document.getElementById('cart-total');
        refs.clearCartButton = document.getElementById('clear-cart-button');
        refs.checkoutButton = document.getElementById('checkout-button');
        refs.checkoutHint = document.getElementById('checkout-hint');
        refs.shippingForm = document.getElementById('shipping-form');
        refs.shippingFullName = document.getElementById('shipping-full-name');
        refs.shippingCountry = document.getElementById('shipping-country');
        refs.shippingLine1 = document.getElementById('shipping-line1');
        refs.shippingLine2 = document.getElementById('shipping-line2');
        refs.shippingCity = document.getElementById('shipping-city');
        refs.shippingPostalCode = document.getElementById('shipping-postal-code');
        refs.shippingNotes = document.getElementById('shipping-notes');
        refs.statProducts = document.getElementById('stat-products');
        refs.statCategories = document.getElementById('stat-categories');
        refs.statStock = document.getElementById('stat-stock');
        refs.statCart = document.getElementById('stat-cart');
        refs.authModal = document.getElementById('auth-modal');
        refs.authFeedback = document.getElementById('auth-feedback');
        refs.authTabs = Array.from(document.querySelectorAll('[data-auth-mode]'));
        refs.loginForm = document.getElementById('login-form');
        refs.registerForm = document.getElementById('register-form');
        refs.productDetailView = document.getElementById('product-detail-view');
        refs.detailBreadcrumbName = document.getElementById('detail-breadcrumb-name');
        refs.similarProducts = document.getElementById('similar-products');
    }

    function bindEvents() {
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeydown);

        if (refs.searchInput) {
            refs.searchInput.addEventListener('input', (event) => {
                state.searchTerm = event.target.value.trim();
                renderProducts();
            });
        }

        if (refs.categorySelect) {
            refs.categorySelect.addEventListener('change', (event) => {
                state.selectedCategory = event.target.value;
                renderProducts();
            });
        }

        if (refs.sortSelect) {
            refs.sortSelect.addEventListener('change', (event) => {
                state.sortBy = event.target.value;
                renderProducts();
            });
        }

        if (refs.loginForm) {
            refs.loginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                void handleLoginSubmit();
            });
        }

        if (refs.registerForm) {
            refs.registerForm.addEventListener('submit', (event) => {
                event.preventDefault();
                void handleRegisterSubmit();
            });
        }

        if (refs.shippingForm) {
            refs.shippingForm.addEventListener('input', handleShippingInput);
        }
    }

    function handleClick(event) {
        const authOpenButton = event.target.closest('[data-open-auth]');
        if (authOpenButton) {
            openAuthModal();
            return;
        }

        const authCloseButton = event.target.closest('[data-close-modal]');
        if (authCloseButton) {
            closeAuthModal();
            return;
        }

        const authTabButton = event.target.closest('[data-auth-mode]');
        if (authTabButton) {
            setAuthMode(authTabButton.dataset.authMode);
            return;
        }

        const logoutButton = event.target.closest('[data-logout]');
        if (logoutButton) {
            logout();
            return;
        }

        const favoriteButton = event.target.closest('[data-toggle-favorite]');
        if (favoriteButton) {
            toggleFavorite(Number(favoriteButton.dataset.toggleFavorite));
            return;
        }

        const addButton = event.target.closest('[data-add-to-cart]');
        if (addButton) {
            addToCart(Number(addButton.dataset.addToCart), addButton.dataset.colorId || '');
            return;
        }

        const cartActionButton = event.target.closest('[data-cart-action]');
        if (cartActionButton) {
            updateCartItem(
                Number(cartActionButton.dataset.productId),
                cartActionButton.dataset.colorId || '',
                cartActionButton.dataset.cartAction
            );
            return;
        }

        const colorButton = event.target.closest('[data-color-option]');
        if (colorButton) {
            const [productId, colorId] = colorButton.dataset.colorOption.split(':');
            setSelectedColor(Number(productId), colorId);
            return;
        }

        const galleryButton = event.target.closest('[data-gallery-action]');
        if (galleryButton) {
            changeDetailImage(galleryButton.dataset.galleryAction === 'next' ? 1 : -1);
            return;
        }

        const thumbButton = event.target.closest('[data-thumb-index]');
        if (thumbButton) {
            state.detailImageIndex = Number(thumbButton.dataset.thumbIndex) || 0;
            renderProductDetail();
            return;
        }

        const descriptionButton = event.target.closest('[data-toggle-description]');
        if (descriptionButton) {
            state.detailDescriptionExpanded = !state.detailDescriptionExpanded;
            renderProductDetail();
            return;
        }

        if (event.target.closest('#checkout-button')) {
            void placeOrder();
            return;
        }

        if (event.target.closest('#clear-cart-button')) {
            clearCart();
        }
    }

    function handleKeydown(event) {
        if (event.key === 'Escape' && refs.authModal && !refs.authModal.hidden) {
            closeAuthModal();
        }
    }

    async function loadCatalogue() {
        state.isLoading = true;
        if (PAGE === 'catalog') {
            setStatus('Chargement du catalogue...', 'info');
        }
        renderAll();

        const [categoriesResult, productsResult] = await Promise.allSettled([
            fetchJson(`${API_BASE}/categories`),
            fetchJson(`${API_BASE}/products`)
        ]);

        state.isLoading = false;

        if (productsResult.status === 'rejected') {
            state.products = [];
            state.categories = [];
            setStatus('Impossible de charger les produits. Verifie le backend sur http://localhost:8080.', 'error');
            renderAll();
            return;
        }

        state.products = productsResult.value.map(normalizeProduct);
        state.categories = categoriesResult.status === 'fulfilled'
            ? categoriesResult.value.map(normalizeCategory)
            : [];

        syncFavoritesWithProducts();
        syncCartWithProducts();
        initSelectedColors();

        if (PAGE === 'product' && !getDetailProduct()) {
            setStatus('Ce produit n existe pas ou n est plus disponible.', 'error');
        } else if (categoriesResult.status === 'rejected') {
            setStatus('Produits charges, mais les categories ne repondent pas.', 'warning');
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

    async function postJson(url, payload) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        const data = text ? tryParseJson(text) : null;

        if (!response.ok) {
            throw new Error(data && data.message ? data.message : `Erreur API ${response.status}`);
        }

        return data;
    }

    function normalizeCategory(category) {
        return {
            id: Number(category.id),
            name: cleanText(category.name || 'Sans categorie')
        };
    }

    function normalizeProduct(product) {
        const images = [product.image_url_1, product.image_url_2, product.image_url_3]
            .map((image) => cleanText(image || ''))
            .filter(Boolean);

        return {
            id: Number(product.id),
            categoryId: Number(product.category_id),
            name: cleanText(product.name || 'Produit sans nom'),
            description: cleanText(product.description || ''),
            price: Number(product.price) || 0,
            stock: Number(product.stock) || 0,
            images,
            mainImage: images[0] || '',
            hoverImage: images[1] || images[0] || '',
            colors: getProductColors(product)
        };
    }

    function getProductColors(product) {
        const apiColors = [product.colors, product.color_options, product.available_colors].find(Array.isArray);

        if (apiColors) {
            return apiColors.map((entry, index) => {
                if (typeof entry === 'string') {
                    const match = COLOR_LIBRARY.find((color) => {
                        return color.id === slugify(entry) || color.label.toLowerCase() === entry.toLowerCase();
                    });

                    return {
                        id: match ? match.id : `${slugify(entry)}-${index}`,
                        label: cleanText(entry),
                        swatch: match ? match.swatch : '#cccccc'
                    };
                }

                const label = cleanText(entry.label || entry.name || `Coloris ${index + 1}`);

                return {
                    id: slugify(entry.id || label),
                    label,
                    swatch: entry.swatch || entry.hex || '#cccccc'
                };
            });
        }

        const text = `${cleanText(product.name || '')} ${cleanText(product.description || '')}`.toLowerCase();
        const matches = COLOR_LIBRARY.filter((color) => color.tokens.some((token) => text.includes(token)));
        const fallbacks = (CATEGORY_COLOR_FALLBACKS[Number(product.category_id)] || ['gris', 'rose', 'bleu'])
            .map((colorId) => COLOR_LIBRARY.find((color) => color.id === colorId))
            .filter(Boolean);

        const pickedColors = matches.length > 0 ? matches : fallbacks;
        const uniqueColors = [];

        pickedColors.forEach((color) => {
            if (!uniqueColors.find((entry) => entry.id === color.id)) {
                uniqueColors.push(color);
            }
        });

        return uniqueColors.slice(0, 4).map((color) => ({
            id: color.id,
            label: color.label,
            swatch: color.swatch
        }));
    }

    function initSelectedColors() {
        state.products.forEach((product) => {
            if (!state.selectedColors[product.id]) {
                state.selectedColors[product.id] = product.colors[0] ? product.colors[0].id : 'default';
            }
        });
    }

    function renderAll() {
        renderStatus();
        renderHeaderAccount();
        renderHeroButton();
        renderAccountSummary();
        renderAuthModal();
        renderStats();
        renderFavoritesCount();

        if (PAGE === 'catalog') {
            renderFavorites();
            renderFilters();
            renderProducts();
            renderShippingForm();
            renderCart();
            renderCheckoutHint();
        } else {
            renderProductDetail();
            renderSimilarProducts();
        }
    }

    function renderStatus() {
        if (!refs.statusMessage) {
            return;
        }

        refs.statusMessage.textContent = state.statusText;
        refs.statusMessage.dataset.state = state.statusType;
        refs.statusMessage.hidden = state.statusText.length === 0;
    }

    function renderHeaderAccount() {
        if (refs.headerCartCount) {
            refs.headerCartCount.textContent = String(getCartCount());
        }

        if (!refs.topbarAccountSlot) {
            return;
        }

        if (state.user) {
            refs.topbarAccountSlot.innerHTML = `
                <span class="user-chip">${escapeHtml(state.user.username)}</span>
                <button class="topbar-button topbar-button-muted" type="button" data-logout>
                    Deconnexion
                </button>
            `;
            return;
        }

        refs.topbarAccountSlot.innerHTML = `
            <button class="topbar-button" type="button" data-open-auth>
                Connexion
            </button>
        `;
    }

    function renderHeroButton() {
        if (!refs.heroAuthButton) {
            return;
        }

        refs.heroAuthButton.textContent = state.user
            ? `Compte connecte : ${state.user.username}`
            : 'Connexion / inscription';
        refs.heroAuthButton.disabled = Boolean(state.user);
    }

    function renderAccountSummary() {
        if (!refs.accountSummary) {
            return;
        }

        if (state.user) {
            refs.accountSummary.innerHTML = `
                <div class="account-copy">
                    <p class="section-overline">Compte actif</p>
                    <h2>${escapeHtml(state.user.username)}</h2>
                    <p>${escapeHtml(state.user.email)}</p>
                </div>
                <div class="account-actions">
                    <span class="mini-note">user_id pret pour les commandes.</span>
                    <button class="secondary-button" type="button" data-logout>
                        Deconnexion
                    </button>
                </div>
            `;
            return;
        }

        refs.accountSummary.innerHTML = `
            <div class="account-copy">
                <p class="section-overline">Compte</p>
                <h2>Aucun utilisateur connecte</h2>
                <p>Connecte-toi pour relier panier, livraison et commande a un user_id cote frontend.</p>
            </div>
            <div class="account-actions">
                <button class="secondary-button" type="button" data-open-auth>
                    Ouvrir le compte
                </button>
            </div>
        `;
    }

    function renderAuthModal() {
        if (!refs.loginForm || !refs.registerForm) {
            return;
        }

        refs.loginForm.hidden = state.authMode !== 'login';
        refs.registerForm.hidden = state.authMode !== 'register';

        refs.authTabs.forEach((button) => {
            button.dataset.state = button.dataset.authMode === state.authMode ? 'active' : 'idle';
        });

        if (!refs.authFeedback) {
            return;
        }

        refs.authFeedback.textContent = state.authMessage;
        refs.authFeedback.dataset.state = state.authMessageType;
        refs.authFeedback.hidden = state.authMessage.length === 0;
    }

    function renderStats() {
        if (refs.statProducts) {
            refs.statProducts.textContent = String(state.products.length);
        }

        if (refs.statCategories) {
            refs.statCategories.textContent = String(state.categories.length);
        }

        if (refs.statStock) {
            refs.statStock.textContent = String(state.products.reduce((total, product) => total + product.stock, 0));
        }

        if (refs.statCart) {
            refs.statCart.textContent = String(getCartCount());
        }
    }

    function renderFavoritesCount() {
        if (refs.headerFavoritesCount) {
            refs.headerFavoritesCount.textContent = String(state.favorites.length);
        }

        if (refs.favoritesCount) {
            refs.favoritesCount.textContent = `${state.favorites.length} ${pluralize(state.favorites.length, 'favori', 'favoris')}`;
        }
    }

    function renderFavorites() {
        if (!refs.favoritesGrid) {
            return;
        }

        if (state.isLoading) {
            refs.favoritesGrid.innerHTML = createSkeletonCards(2);
            return;
        }

        if (state.products.length === 0) {
            refs.favoritesGrid.innerHTML = `
                <article class="empty-state compact">
                    <h3>Favoris indisponibles</h3>
                    <p>Le catalogue doit etre charge avant d afficher les favoris.</p>
                </article>
            `;
            return;
        }

        const favoriteProducts = state.products.filter((product) => isFavorite(product.id));

        if (favoriteProducts.length === 0) {
            refs.favoritesGrid.innerHTML = `
                <article class="empty-state compact">
                    <h3>Aucun favori</h3>
                    <p>Appuie sur le coeur en haut a droite d un article pour le garder ici.</p>
                </article>
            `;
            return;
        }

        refs.favoritesGrid.innerHTML = favoriteProducts.map(createProductCard).join('');
    }

    function renderFilters() {
        if (!refs.categorySelect || !refs.sortSelect || !refs.searchInput) {
            return;
        }

        refs.categorySelect.innerHTML = [
            '<option value="all">Toutes les categories</option>',
            ...state.categories.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
        ].join('');

        refs.categorySelect.value = state.selectedCategory;
        refs.sortSelect.value = state.sortBy;
        refs.searchInput.value = state.searchTerm;
    }

    function renderProducts() {
        if (!refs.productsGrid) {
            return;
        }

        const products = getVisibleProducts();

        if (refs.resultsCount) {
            refs.resultsCount.textContent = `${products.length} ${pluralize(products.length, 'resultat', 'resultats')}`;
        }

        if (state.isLoading) {
            refs.productsGrid.innerHTML = createSkeletonCards(6);
            return;
        }

        if (state.products.length === 0) {
            refs.productsGrid.innerHTML = `
                <article class="empty-state">
                    <h3>Aucun produit charge</h3>
                    <p>Le frontend attend la reponse de l API catalogue.</p>
                </article>
            `;
            return;
        }

        if (products.length === 0) {
            refs.productsGrid.innerHTML = `
                <article class="empty-state">
                    <h3>Aucun resultat</h3>
                    <p>Essaie une autre recherche ou une autre categorie.</p>
                </article>
            `;
            return;
        }

        refs.productsGrid.innerHTML = products.map(createProductCard).join('');
    }

    function createProductCard(product) {
        const quantityInCart = getQuantityInCart(product.id);
        const selectedColor = getSelectedColor(product);
        const disabled = product.stock <= 0 || quantityInCart >= product.stock;
        const favoriteActive = isFavorite(product.id);

        return `
            <article class="product-card">
                <div class="product-media">
                    ${product.mainImage ? `
                        <div class="product-media-stack ${product.hoverImage && product.hoverImage !== product.mainImage ? 'has-hover' : ''}">
                            <img class="product-media-image is-primary" src="${escapeAttribute(product.mainImage)}" alt="${escapeAttribute(product.name)}">
                            ${product.hoverImage && product.hoverImage !== product.mainImage ? `
                                <img class="product-media-image is-hover" src="${escapeAttribute(product.hoverImage)}" alt="${escapeAttribute(product.name)} vue detail">
                            ` : ''}
                        </div>
                    ` : `
                        <div class="product-placeholder">Image indisponible</div>
                    `}
                    <span class="product-badge">${escapeHtml(getCategoryName(product.categoryId))}</span>
                    <button
                        class="favorite-button ${favoriteActive ? 'is-active' : ''}"
                        type="button"
                        data-toggle-favorite="${product.id}"
                        aria-label="${favoriteActive ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
                        aria-pressed="${favoriteActive ? 'true' : 'false'}"
                    >
                        &#9829;
                    </button>
                </div>

                <div class="product-content">
                    <div class="product-heading">
                        <h3>${escapeHtml(product.name)}</h3>
                        <p class="product-price">${formatPrice(product.price)}</p>
                    </div>

                    <p class="product-description">${escapeHtml(truncateText(product.description, 145))}</p>

                    <div class="product-meta">
                        <span>${product.stock} ${pluralize(product.stock, 'piece', 'pieces')} restantes</span>
                        <span>${quantityInCart} dans le panier</span>
                        <span>${product.colors.length} coloris</span>
                    </div>
                </div>

                <div class="product-actions">
                    <a class="detail-link" href="product.html?id=${product.id}">Voir plus</a>
                    <button
                        class="primary-button primary-button-compact"
                        type="button"
                        data-add-to-cart="${product.id}"
                        data-color-id="${escapeAttribute(selectedColor.id)}"
                        ${disabled ? 'disabled' : ''}
                    >
                        ${product.stock <= 0 ? 'Rupture de stock' : quantityInCart >= product.stock ? 'Stock reserve' : 'Ajouter au panier'}
                    </button>
                </div>
            </article>
        `;
    }

    function renderShippingForm() {
        if (!refs.shippingForm) {
            return;
        }

        refs.shippingFullName.value = state.shipping.fullName;
        refs.shippingCountry.value = state.shipping.country;
        refs.shippingLine1.value = state.shipping.line1;
        refs.shippingLine2.value = state.shipping.line2;
        refs.shippingCity.value = state.shipping.city;
        refs.shippingPostalCode.value = state.shipping.postalCode;
        refs.shippingNotes.value = state.shipping.notes;
    }

    function renderCart() {
        if (!refs.cartItems || !refs.cartCount || !refs.cartTotal) {
            return;
        }

        const items = getDetailedCart();
        const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

        refs.cartCount.textContent = `${totalQuantity} ${pluralize(totalQuantity, 'article', 'articles')}`;
        refs.cartTotal.textContent = formatPrice(totalPrice);

        if (refs.clearCartButton) {
            refs.clearCartButton.disabled = items.length === 0;
        }

        if (refs.checkoutButton) {
            refs.checkoutButton.disabled = items.length === 0;
        }

        if (items.length === 0) {
            refs.cartItems.innerHTML = `
                <article class="empty-state compact">
                    <h3>Panier vide</h3>
                    <p>Ajoute quelques produits pour tester la commande front.</p>
                </article>
            `;
            return;
        }

        refs.cartItems.innerHTML = items.map((item) => `
            <article class="cart-item">
                <div class="cart-item-copy">
                    <h3>${escapeHtml(item.product.name)}</h3>
                    <p>${formatPrice(item.product.price)} l unite</p>
                    <p>Coloris : ${escapeHtml(item.color.label)}</p>
                </div>

                <div class="cart-item-controls">
                    <button type="button" data-cart-action="decrease" data-product-id="${item.product.id}" data-color-id="${escapeAttribute(item.color.id)}">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-cart-action="increase" data-product-id="${item.product.id}" data-color-id="${escapeAttribute(item.color.id)}" ${getQuantityInCart(item.product.id) >= item.product.stock ? 'disabled' : ''}>+</button>
                    <button type="button" data-cart-action="remove" data-product-id="${item.product.id}" data-color-id="${escapeAttribute(item.color.id)}">Supprimer</button>
                </div>
            </article>
        `).join('');
    }

    function renderCheckoutHint() {
        if (!refs.checkoutHint) {
            return;
        }

        const items = getDetailedCart();

        if (items.length === 0) {
            refs.checkoutHint.textContent = 'Ajoute des articles pour lancer la commande.';
            return;
        }

        if (!state.user) {
            refs.checkoutHint.textContent = 'Connecte-toi avant d envoyer la commande au backend.';
            return;
        }

        refs.checkoutHint.textContent = `Commande preparee pour ${state.user.username}. Adresse locale prete a etre envoyee.`;
    }

    function renderProductDetail() {
        if (!refs.productDetailView) {
            return;
        }

        if (state.isLoading) {
            refs.productDetailView.innerHTML = `
                <article class="empty-state">
                    <h3 id="detail-page-title">Chargement du produit</h3>
                    <p>La fiche detaillee se construit a partir du catalogue.</p>
                </article>
            `;
            return;
        }

        const product = getDetailProduct();

        if (!product) {
            refs.productDetailView.innerHTML = `
                <article class="empty-state">
                    <h3 id="detail-page-title">Produit introuvable</h3>
                    <p>Retourne au catalogue pour ouvrir une fiche valide.</p>
                </article>
            `;
            if (refs.detailBreadcrumbName) {
                refs.detailBreadcrumbName.textContent = 'Produit';
            }
            return;
        }

        const images = product.images.length > 0 ? product.images : [''];
        const currentIndex = clamp(state.detailImageIndex, 0, images.length - 1);
        const selectedColor = getSelectedColor(product);
        const canExpand = product.description.length > 260;
        const text = state.detailDescriptionExpanded
            ? product.description
            : truncateText(product.description, 260);

        state.detailImageIndex = currentIndex;

        refs.productDetailView.innerHTML = `
            <article class="detail-card">
                <div class="detail-gallery">
                    <div class="detail-main-media">
                        ${product.mainImage ? `
                            <img class="detail-main-image" src="${escapeAttribute(images[currentIndex])}" alt="${escapeAttribute(product.name)}">
                        ` : `
                            <div class="product-placeholder">Image indisponible</div>
                        `}

                        ${images.length > 1 ? `
                            <button class="gallery-nav prev" type="button" data-gallery-action="prev" aria-label="Image precedente">&#10094;</button>
                            <button class="gallery-nav next" type="button" data-gallery-action="next" aria-label="Image suivante">&#10095;</button>
                        ` : ''}
                    </div>

                    <div class="detail-thumbnails">
                        ${images.map((image, index) => `
                            <button class="thumb-button ${index === currentIndex ? 'is-active' : ''}" type="button" data-thumb-index="${index}" aria-label="Voir l image ${index + 1}">
                                <img src="${escapeAttribute(image)}" alt="">
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-content">
                    <p class="section-overline">${escapeHtml(getCategoryName(product.categoryId))}</p>
                    <h1 id="detail-page-title">${escapeHtml(product.name)}</h1>
                    <p class="detail-price">${formatPrice(product.price)}</p>

                    <div class="detail-meta">
                        <span>${product.stock} ${pluralize(product.stock, 'piece', 'pieces')} restantes</span>
                        <span>${getQuantityInCart(product.id)} dans le panier</span>
                        <span>${product.colors.length} coloris front</span>
                    </div>

                    <section class="detail-block">
                        <div class="detail-block-head">
                            <h2>Coloris</h2>
                            <strong>${escapeHtml(selectedColor.label)}</strong>
                        </div>
                        <div class="color-options">
                            ${product.colors.map((color) => `
                                <button class="color-option ${color.id === selectedColor.id ? 'is-active' : ''}" type="button" data-color-option="${product.id}:${escapeAttribute(color.id)}">
                                    <span class="color-swatch" style="--swatch:${escapeAttribute(color.swatch)}"></span>
                                    ${escapeHtml(color.label)}
                                </button>
                            `).join('')}
                        </div>
                    </section>

                    <section class="detail-block">
                        <div class="detail-block-head">
                            <h2>Description</h2>
                        </div>
                        <p class="detail-description">${escapeHtml(text)}</p>
                        ${canExpand ? `
                            <button class="detail-link" type="button" data-toggle-description>
                                ${state.detailDescriptionExpanded ? 'Voir moins' : 'Voir plus'}
                            </button>
                        ` : ''}
                    </section>

                    <div class="detail-cta">
                        <button class="primary-button" type="button" data-add-to-cart="${product.id}" data-color-id="${escapeAttribute(selectedColor.id)}" ${product.stock <= 0 || getQuantityInCart(product.id) >= product.stock ? 'disabled' : ''}>
                            ${product.stock <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                        </button>
                        <a class="secondary-link" href="index.html#cart-panel">Voir le panier</a>
                    </div>
                </div>
            </article>
        `;

        if (refs.detailBreadcrumbName) {
            refs.detailBreadcrumbName.textContent = product.name;
        }

        document.title = `${product.name} | FurryLand`;
    }

    function renderSimilarProducts() {
        if (!refs.similarProducts) {
            return;
        }

        if (state.isLoading) {
            refs.similarProducts.innerHTML = createSkeletonCards(3);
            return;
        }

        const detailProduct = getDetailProduct();

        if (!detailProduct) {
            refs.similarProducts.innerHTML = `
                <article class="empty-state">
                    <h3>Aucune suggestion</h3>
                    <p>Le produit principal n est pas disponible.</p>
                </article>
            `;
            return;
        }

        const products = state.products
            .filter((product) => product.id !== detailProduct.id && product.categoryId === detailProduct.categoryId)
            .slice(0, 3);

        refs.similarProducts.innerHTML = products.length > 0
            ? products.map(createProductCard).join('')
            : `
                <article class="empty-state">
                    <h3>Aucun produit similaire</h3>
                    <p>Ajoute d autres produits dans cette categorie pour enrichir la fiche.</p>
                </article>
            `;
    }

    function createSkeletonCards(count) {
        return Array.from({ length: count }, () => `
            <article class="product-card skeleton-card" aria-hidden="true">
                <div class="skeleton-media"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
            </article>
        `).join('');
    }

    function getVisibleProducts() {
        const categoryId = state.selectedCategory === 'all' ? null : Number(state.selectedCategory);
        const searchText = state.searchTerm.toLowerCase();

        return state.products
            .filter((product) => {
                const matchCategory = categoryId === null || product.categoryId === categoryId;
                const fullText = `${product.name} ${product.description} ${getCategoryName(product.categoryId)}`.toLowerCase();
                const matchSearch = searchText.length === 0 || fullText.includes(searchText);
                return matchCategory && matchSearch;
            })
            .sort((first, second) => {
                switch (state.sortBy) {
                case 'price-asc':
                    return first.price - second.price;
                case 'price-desc':
                    return second.price - first.price;
                case 'stock-desc':
                    return second.stock - first.stock;
                case 'name-asc':
                    return first.name.localeCompare(second.name, 'fr');
                default:
                    return first.id - second.id;
                }
            });
    }

    function getCategoryName(categoryId) {
        const category = state.categories.find((entry) => entry.id === categoryId);
        return category ? category.name : 'Sans categorie';
    }

    function getDetailProduct() {
        return state.products.find((product) => product.id === state.detailProductId) || null;
    }

    function getSelectedColor(product) {
        return product.colors.find((color) => color.id === state.selectedColors[product.id]) || product.colors[0] || {
            id: 'default',
            label: 'Coloris standard',
            swatch: '#cccccc'
        };
    }

    function setSelectedColor(productId, colorId) {
        state.selectedColors[productId] = colorId;
        renderAll();
    }

    function addToCart(productId, colorId) {
        const product = state.products.find((entry) => entry.id === productId);

        if (!product) {
            setStatus('Produit introuvable.', 'error');
            return;
        }

        if (getQuantityInCart(productId) >= product.stock) {
            setStatus(`Le stock disponible pour "${product.name}" est deja atteint.`, 'warning');
            return;
        }

        const color = product.colors.find((entry) => entry.id === colorId) || getSelectedColor(product);
        const item = state.cart.find((entry) => entry.productId === productId && entry.selectedColorId === color.id);

        if (item) {
            item.quantity += 1;
        } else {
            state.cart.push({
                productId,
                selectedColorId: color.id,
                quantity: 1
            });
        }

        persistCart();
        setStatus(`"${product.name}" a ete ajoute au panier (${color.label}).`, 'success');
        renderAll();
    }

    function updateCartItem(productId, colorId, action) {
        if (action === 'remove') {
            removeFromCart(productId, colorId);
            return;
        }

        const item = state.cart.find((entry) => entry.productId === productId && entry.selectedColorId === colorId);
        const product = state.products.find((entry) => entry.id === productId);

        if (!item || !product) {
            return;
        }

        const nextQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
        const otherQuantity = getQuantityInCart(productId) - item.quantity;

        if (nextQuantity <= 0) {
            removeFromCart(productId, colorId);
            return;
        }

        if (otherQuantity + nextQuantity > product.stock) {
            setStatus(`Stock maximal atteint pour "${product.name}".`, 'warning');
            return;
        }

        item.quantity = nextQuantity;
        persistCart();
        renderAll();
    }

    function removeFromCart(productId, colorId) {
        const product = state.products.find((entry) => entry.id === productId);

        state.cart = state.cart.filter((entry) => !(entry.productId === productId && entry.selectedColorId === colorId));

        persistCart();
        setStatus(product ? `"${product.name}" a ete retire du panier.` : 'Article retire du panier.', 'info');
        renderAll();
    }

    function clearCart() {
        if (state.cart.length === 0) {
            setStatus('Le panier est deja vide.', 'info');
            return;
        }

        state.cart = [];
        persistCart();
        setStatus('Le panier a ete vide.', 'success');
        renderAll();
    }

    function getDetailedCart() {
        return state.cart
            .map((item) => {
                const product = state.products.find((entry) => entry.id === item.productId);
                if (!product) {
                    return null;
                }

                const color = product.colors.find((entry) => entry.id === item.selectedColorId) || product.colors[0];
                return {
                    product,
                    color: color || { id: 'default', label: 'Coloris standard', swatch: '#cccccc' },
                    quantity: item.quantity
                };
            })
            .filter(Boolean);
    }

    function toggleFavorite(productId) {
        if (!Number.isInteger(productId) || productId <= 0) {
            return;
        }

        const product = state.products.find((entry) => entry.id === productId);

        if (isFavorite(productId)) {
            state.favorites = state.favorites.filter((id) => id !== productId);
            persistFavorites();
            setStatus(product ? `"${product.name}" a ete retire des favoris.` : 'Article retire des favoris.', 'info');
            renderAll();
            return;
        }

        state.favorites.push(productId);
        persistFavorites();
        setStatus(product ? `"${product.name}" a ete ajoute aux favoris.` : 'Article ajoute aux favoris.', 'success');
        renderAll();
    }

    function isFavorite(productId) {
        return state.favorites.includes(productId);
    }

    function getQuantityInCart(productId) {
        return state.cart.reduce((total, item) => item.productId === productId ? total + item.quantity : total, 0);
    }

    function getCartCount() {
        return state.cart.reduce((total, item) => total + item.quantity, 0);
    }

    function syncCartWithProducts() {
        const productsById = new Map(state.products.map((product) => [product.id, product]));
        const usedQuantities = new Map();
        const nextCart = [];

        state.cart.forEach((item) => {
            const product = productsById.get(item.productId);
            if (!product || product.stock <= 0) {
                return;
            }

            const color = product.colors.find((entry) => entry.id === item.selectedColorId) || product.colors[0];
            const alreadyUsed = usedQuantities.get(product.id) || 0;
            const allowedQuantity = Math.min(item.quantity, product.stock - alreadyUsed);

            if (allowedQuantity <= 0) {
                return;
            }

            nextCart.push({
                productId: product.id,
                selectedColorId: color ? color.id : 'default',
                quantity: allowedQuantity
            });

            usedQuantities.set(product.id, alreadyUsed + allowedQuantity);
        });

        state.cart = nextCart;
        persistCart();
    }

    function syncFavoritesWithProducts() {
        if (state.products.length === 0) {
            return;
        }

        const availableIds = new Set(state.products.map((product) => product.id));
        const nextFavorites = state.favorites.filter((productId) => availableIds.has(productId));

        if (nextFavorites.length !== state.favorites.length) {
            state.favorites = nextFavorites;
            persistFavorites();
        }
    }

    function handleShippingInput() {
        state.shipping = {
            fullName: refs.shippingFullName.value.trim(),
            country: refs.shippingCountry.value.trim(),
            line1: refs.shippingLine1.value.trim(),
            line2: refs.shippingLine2.value.trim(),
            city: refs.shippingCity.value.trim(),
            postalCode: refs.shippingPostalCode.value.trim(),
            notes: refs.shippingNotes.value.trim()
        };

        persistShipping();
    }

    async function handleLoginSubmit() {
        const formData = new FormData(refs.loginForm);
        const payload = {
            email: String(formData.get('email') || '').trim(),
            password: String(formData.get('password') || '').trim()
        };

        if (!payload.email || !payload.password) {
            setAuthMessage('Remplis email et mot de passe.', 'warning');
            return;
        }

        try {
            setAuthMessage('Connexion en cours...', 'info');
            const user = normalizeUser(await postJson(`${API_BASE}/login`, payload));

            if (!user) {
                throw new Error('Reponse login incomplete.');
            }

            state.user = user;
            persistUser(user);
            closeAuthModal();
            setAuthMessage('', 'info');
            setStatus(`Connecte en tant que ${user.username}.`, 'success');
            renderAll();
        } catch (error) {
            setAuthMessage(error.message || 'Connexion impossible.', 'error');
        }
    }

    async function handleRegisterSubmit() {
        const formData = new FormData(refs.registerForm);
        const payload = {
            username: String(formData.get('username') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            password: String(formData.get('password') || '').trim()
        };

        if (!payload.username || !payload.email || !payload.password) {
            setAuthMessage('Remplis tous les champs du formulaire.', 'warning');
            return;
        }

        try {
            setAuthMessage('Creation du compte...', 'info');
            const registerResponse = await postJson(`${API_BASE}/register`, payload);
            let user = normalizeUser(registerResponse, payload);

            if (!user) {
                const loginResponse = await postJson(`${API_BASE}/login`, {
                    email: payload.email,
                    password: payload.password
                });
                user = normalizeUser(loginResponse, payload);
            }

            if (!user) {
                throw new Error('Compte cree, mais aucune session exploitable n a ete retournee.');
            }

            state.user = user;
            persistUser(user);
            refs.registerForm.reset();
            closeAuthModal();
            setAuthMessage('', 'info');
            setStatus(`Compte cree pour ${user.username}.`, 'success');
            renderAll();
        } catch (error) {
            setAuthMessage(error.message || 'Inscription impossible.', 'error');
        }
    }

    function normalizeUser(data, fallback = {}) {
        const id = data && (data.id || data.user_id || data.insertId || fallback.id);
        const username = cleanText(data && data.username ? data.username : fallback.username || '');
        const email = cleanText(data && data.email ? data.email : fallback.email || '');

        if (!id || !username || !email) {
            return null;
        }

        return { id, username, email };
    }

    async function placeOrder() {
        const items = getDetailedCart();

        if (items.length === 0) {
            setStatus('Ajoute des articles avant de passer commande.', 'warning');
            return;
        }

        if (!state.user) {
            setStatus('Connecte-toi avant d envoyer une commande.', 'warning');
            openAuthModal();
            return;
        }

        const shippingError = validateShipping();
        if (shippingError) {
            setStatus(shippingError, 'warning');
            focusMissingShippingField();
            return;
        }

        const payload = {
            user_id: state.user.id,
            total_price: Number(items.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)),
            shipping_address: { ...state.shipping },
            items: items.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.product.price,
                selected_color: item.color.label
            }))
        };

        try {
            setStatus('Envoi de la commande...', 'info');
            await postJson(`${API_BASE}/orders`, payload);
            saveOrderDraft({ ...payload, created_at: new Date().toISOString(), source: 'api' });
            state.cart = [];
            persistCart();
            setStatus('Commande envoyee a l API avec succes.', 'success');
            renderAll();
        } catch {
            saveOrderDraft({ ...payload, created_at: new Date().toISOString(), source: 'front-draft' });
            setStatus('Le front a prepare la commande, mais l endpoint /api/orders ne repond pas encore. Brouillon garde en local.', 'warning');
        }
    }

    function validateShipping() {
        if (!state.shipping.fullName) return 'Le nom complet est requis pour la livraison.';
        if (!state.shipping.country) return 'Le pays de livraison est requis.';
        if (!state.shipping.line1) return 'L adresse de livraison est requise.';
        if (!state.shipping.city) return 'La ville de livraison est requise.';
        if (!state.shipping.postalCode) return 'Le code postal est requis.';
        return '';
    }

    function focusMissingShippingField() {
        const fields = [
            ['fullName', refs.shippingFullName],
            ['country', refs.shippingCountry],
            ['line1', refs.shippingLine1],
            ['city', refs.shippingCity],
            ['postalCode', refs.shippingPostalCode]
        ];

        const missingField = fields.find(([key]) => !state.shipping[key]);
        if (missingField && missingField[1]) {
            missingField[1].focus();
        }
    }

    function openAuthModal() {
        if (!refs.authModal) {
            return;
        }

        refs.authModal.hidden = false;
        document.body.classList.add('is-modal-open');
    }

    function closeAuthModal() {
        if (!refs.authModal) {
            return;
        }

        refs.authModal.hidden = true;
        document.body.classList.remove('is-modal-open');
    }

    function setAuthMode(mode) {
        state.authMode = mode === 'register' ? 'register' : 'login';
        setAuthMessage('', 'info');
        renderAuthModal();
    }

    function setAuthMessage(text, type = 'info') {
        state.authMessage = text;
        state.authMessageType = type;
        renderAuthModal();
    }

    function logout() {
        state.user = null;
        localStorage.removeItem(USER_STORAGE_KEY);
        closeAuthModal();
        setStatus('Utilisateur deconnecte. Le panier local reste disponible.', 'info');
        renderAll();
    }

    function changeDetailImage(step) {
        const product = getDetailProduct();

        if (!product || product.images.length <= 1) {
            return;
        }

        let nextIndex = state.detailImageIndex + step;

        if (nextIndex < 0) {
            nextIndex = product.images.length - 1;
        }

        if (nextIndex >= product.images.length) {
            nextIndex = 0;
        }

        state.detailImageIndex = nextIndex;
        renderProductDetail();
    }

    function getDetailProductId() {
        if (PAGE !== 'product') {
            return null;
        }

        const id = Number(new URLSearchParams(window.location.search).get('id'));
        return Number.isInteger(id) && id > 0 ? id : null;
    }

    function loadCart() {
        const data = readJson(CART_STORAGE_KEY, []);

        if (!Array.isArray(data)) {
            return [];
        }

        return data
            .map((item) => ({
                productId: Number(item.productId),
                selectedColorId: typeof item.selectedColorId === 'string' ? item.selectedColorId : null,
                quantity: Number(item.quantity)
            }))
            .filter((item) => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0);
    }

    function persistCart() {
        writeJson(CART_STORAGE_KEY, state.cart, 'Impossible de sauvegarder le panier dans le navigateur.');
    }

    function loadFavorites() {
        const data = readJson(FAVORITES_STORAGE_KEY, []);

        if (!Array.isArray(data)) {
            return [];
        }

        return data
            .map((productId) => Number(productId))
            .filter((productId, index, array) => Number.isInteger(productId) && productId > 0 && array.indexOf(productId) === index);
    }

    function persistFavorites() {
        writeJson(FAVORITES_STORAGE_KEY, state.favorites, 'Impossible de sauvegarder les favoris dans le navigateur.');
    }

    function loadUser() {
        const data = readJson(USER_STORAGE_KEY, null);

        if (!data || !data.id || !data.username || !data.email) {
            return null;
        }

        return {
            id: data.id,
            username: cleanText(data.username),
            email: cleanText(data.email)
        };
    }

    function persistUser(user) {
        writeJson(USER_STORAGE_KEY, user, 'Impossible de sauvegarder la session utilisateur.');
    }

    function loadShipping() {
        const data = readJson(SHIPPING_STORAGE_KEY, {});
        return {
            ...DEFAULT_SHIPPING,
            ...(data || {})
        };
    }

    function persistShipping() {
        writeJson(SHIPPING_STORAGE_KEY, state.shipping, 'Impossible de sauvegarder l adresse de livraison.');
    }

    function saveOrderDraft(payload) {
        const drafts = readJson(ORDER_DRAFT_STORAGE_KEY, []);
        const nextDrafts = Array.isArray(drafts) ? drafts : [];
        nextDrafts.push(payload);
        writeJson(ORDER_DRAFT_STORAGE_KEY, nextDrafts.slice(-10));
    }

    function readJson(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    }

    function writeJson(key, value, warningMessage = '') {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            if (warningMessage) {
                setStatus(warningMessage, 'warning');
            }
        }
    }

    function tryParseJson(value) {
        try {
            return JSON.parse(value);
        } catch {
            return null;
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

    function truncateText(text, limit) {
        if (text.length <= limit) {
            return text;
        }

        return `${text.slice(0, limit - 1).trim()}...`;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function slugify(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function cleanText(value) {
        const text = typeof value === 'string' ? value.trim() : '';

        if (!text || !/[\u00C3\u00C2\u00E2]/.test(text) || typeof TextDecoder === 'undefined') {
            return text;
        }

        try {
            const bytes = Uint8Array.from(text, (character) => character.charCodeAt(0));
            return new TextDecoder('utf-8').decode(bytes);
        } catch {
            return text;
        }
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll('\'', '&#39;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }
})();
