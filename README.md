# 🦊 FurryLand — Boutique e-commerce de fursuits

FurryLand est une boutique e-commerce spécialisée dans la vente de masques et costumes fursuit/kemono. Projet réalisé dans le cadre du cursus Ynov Campus par **Paul Gaulmin** (Backend) et **Fabio Tavolaro** (Frontend).

---

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Frontend | HTML, CSS, JavaScript vanilla |
| Backend | Node.js + Express.js |
| Base de données | MySQL (via MAMP) |
| Authentification | bcrypt |
| Autre | CORS, mysql2 |

---

## 📁 Arborescence du projet

```
FurryLand/
├── expressJS/
│   ├── Backend/
│   │   ├── assets/
│   │   │   └── img/          # Images des produits
│   │   ├── controller/
│   │   │   └── controller.js # Logique métier / requêtes SQL
│   │   ├── DB/
│   │   │   ├── db.js         # Connexion MySQL
│   │   │   ├── migration.sql # Création des tables
│   │   │   └── insertion.sql # Données initiales
│   │   ├── router/
│   │   │   └── router.js     # Définition des routes API
│   │   ├── app.js            # Point d'entrée du serveur
│   │   └── package.json
│   └── Frontend/
│       ├── css/
│       │   └── main.css
│       ├── script/
│       │   └── main.js
│       └── index.html
└── README.md
```

---

## ⚙️ Installation

### Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [MAMP](https://www.mamp.info/) (pour MySQL)
- [Git](https://git-scm.com/)

### 1. Cloner le dépôt

```bash
git clone https://github.com/paul23jj/FurryLand.git
cd FurryLand/expressJS/Backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Mettre en place la base de données

1. Lancer **MAMP** et démarrer les serveurs Apache + MySQL
2. Ouvrir **phpMyAdmin** sur `http://localhost/phpmyadmin`
3. Aller dans l'onglet **SQL**
4. Coller et exécuter le contenu de `DB/migration.sql`
5. Cliquer sur `furrylanddb` dans la colonne de gauche
6. Aller dans l'onglet **SQL**
7. Coller et exécuter le contenu de `DB/insertion.sql`

### 4. Lancer le serveur

```bash
# Mode développement (rechargement automatique)
npm run dev

# Mode production
npm start
```

Le serveur tourne sur **http://localhost:8080**

---

## 🗃️ Schéma de la base de données

| Table | Description |
|---|---|
| `categories` | Catégories de produits (Masques, Costumes) |
| `products` | Catalogue des 20 produits avec prix, stock, images, réduction |
| `product_attributes` | Caractéristiques produits (couleurs, tailles) |
| `users` | Comptes utilisateurs avec mot de passe hashé |
| `orders` | Commandes passées par les utilisateurs |
| `order_items` | Détail des produits dans chaque commande |
| `cart_items` | Panier persistant par utilisateur |
| `favorites` | Produits mis en favoris par les utilisateurs |
| `addresses` | Adresses de livraison des utilisateurs |

---

## 🔌 API REST — Routes disponibles

### Produits
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/products` | Tous les produits |
| GET | `/api/products/:id` | Un produit par id |
| PUT | `/api/products/:id/stock` | Mettre à jour le stock |
| GET | `/api/products/:id/attributes` | Attributs d'un produit |

### Catégories
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/categories` | Toutes les catégories |
| GET | `/api/categories/:id` | Une catégorie par id |

### Utilisateurs
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/register` | Créer un compte |
| POST | `/api/login` | Se connecter |

### Panier
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/cart/:user_id` | Voir le panier |
| POST | `/api/cart` | Ajouter au panier |
| DELETE | `/api/cart/:id` | Supprimer du panier |

### Commandes
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/orders/:user_id` | Voir les commandes |
| POST | `/api/orders` | Créer une commande |

### Favoris
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/favorites/:user_id` | Voir les favoris |
| POST | `/api/favorites` | Ajouter un favori |
| DELETE | `/api/favorites/:id` | Supprimer un favori |

### Adresses
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/addresses/:user_id` | Voir les adresses |
| POST | `/api/addresses` | Ajouter une adresse |

---

## 💡 Exemples d'appels API depuis le Frontend

### Récupérer les produits
```js
fetch('http://localhost:8080/api/products')
    .then(res => res.json())
    .then(data => console.log(data));
```

### S'inscrire
```js
fetch('http://localhost:8080/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: 'paul',
        email: 'paul@mail.com',
        password: 'monmotdepasse'
    })
});
```

### Se connecter
```js
fetch('http://localhost:8080/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'paul@mail.com',
        password: 'monmotdepasse'
    })
});
```

### Ajouter au panier
```js
fetch('http://localhost:8080/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        user_id: 1,
        product_id: 1,
        quantity: 1
    })
});
```

---

## 👥 Équipe

- **Paul Gaulmin** — Backend (Express.js, MySQL, API REST)
- **Fabio Tavolaro** — Frontend (HTML, CSS, JavaScript)

---

## 📅 Rendu

Projet rendu le **13 avril 2026** dans le cadre du cours JavaScript — Ynov Campus.
