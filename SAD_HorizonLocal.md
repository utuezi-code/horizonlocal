# Software Architecture Document (SAD)
## Horizon Local - Marketplace Multi-Vendeurs Québécoise
**Version** : 1.2  
**Date** : Mai 2026  
**Auteur** : Alain SAWADOGO - Digital Zeph  
**Statut** : Draft  

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Contexte et objectifs](#2-contexte-et-objectifs)
3. [Contraintes architecturales](#3-contraintes-architecturales)
4. [Vue d'ensemble du système](#4-vue-densemble-du-système)
5. [Stack technique](#5-stack-technique)
6. [Architecture des composants](#6-architecture-des-composants)
7. [Modèle de données](#7-modèle-de-données)
8. [Variantes de produits avancées](#8-variantes-de-produits-avancées)
9. [Import CSV de produits](#9-import-csv-de-produits)
10. [Cycle de vie d'une commande](#10-cycle-de-vie-dune-commande)
11. [Système de livraison et suivi](#11-système-de-livraison-et-suivi)
12. [Système d'emails transactionnels](#12-système-demails-transactionnels)
13. [Gouvernance des rôles et permissions](#13-gouvernance-des-rôles-et-permissions)
14. [Soft Delete et purge automatique](#14-soft-delete-et-purge-automatique)
15. [Dashboard Admin (propriétaire)](#15-dashboard-admin-propriétaire)
16. [Dashboard Marketeur](#16-dashboard-marketeur)
17. [Sécurité](#17-sécurité)
18. [Performance](#18-performance)
19. [Conformité québécoise - Loi 25](#19-conformité-québécoise---loi-25)
20. [Déploiement - Railway](#20-déploiement---railway)
21. [Décisions architecturales (ADR)](#21-décisions-architecturales-adr)
22. [Feuille de route](#22-feuille-de-route)

---

## 1. Introduction

### 1.1 Objectif du document

Ce document décrit l'architecture complète du projet **Horizon Local v2.0**, une marketplace multi-vendeurs dédiée aux produits 100% québécois. Il sert de référence technique pour la conception, le développement, le déploiement et la maintenance du système.

La version actuelle (v1.0) est bâtie sur WordPress + WooCommerce + Dokan. Cette architecture génère des conflits de plugins chroniques qui monopolisent le temps de développement sans valeur ajoutée. La v2.0 abandonne complètement ce socle pour un stack maîtrisé, maintenable et évolutif.

### 1.2 Portée

Ce SAD couvre la **Phase 1** du projet, soit :

- La marketplace web complète (catalogue, panier, commandes, paiement)
- Le dashboard vendeur (gestion des produits, commandes, revenus)
- Le dashboard administrateur (gestion globale, commissions, vendeurs)
- L'API REST (mobile-ready pour la Phase 2)

**Hors portée (Phase 2)** : Application mobile Android/iOS.

### 1.3 Audience cible

- Développeur principal (Alain SAWADOGO)
- Co-développeurs éventuels (Digital Zeph)
- Parties prenantes techniques

---

## 2. Contexte et objectifs

### 2.1 Description du produit

Horizon Local est une plateforme e-commerce québécoise positionnée comme la vitrine du savoir-faire local. Elle connecte des vendeurs québécois (entreprises et artisans) avec des acheteurs qui souhaitent consommer local. La plateforme prélève une commission sur chaque transaction vendeur.

**Catégories actuelles :**
- Articles d'extérieur / Rénovations
- Articles de maison / Meubles
- Électronique
- Animalerie
- Fournitures d'art et d'artisanat
- Fournitures de bureau et scolaires
- Beauté et soins personnels
- Santé et bien-être
- Vêtements, chaussures et bijoux

**Vendeurs actuels :** Colorantic Inc., JAY TOUT EN BOIS, et autres compagnies québécoises.

### 2.2 Objectifs architecturaux

| Priorité | Objectif | Indicateur de succès |
|----------|----------|----------------------|
| P0 | Zéro bug de conflits de dépendances | Absence de régressions entre modules |
| P0 | Sécurité conforme Loi 25 | Audit de conformité passé |
| P1 | Performance < 2s LCP | Score Lighthouse > 90 |
| P1 | Frontend identique au site actuel | Validation visuelle page par page |
| P1 | API mobile-ready | Endpoints REST documentés (OpenAPI) |
| P2 | Extensibilité | Ajout de module sans refactoring majeur |

### 2.3 Problèmes résolus par cette réécriture

| Problème WordPress/Dokan | Solution v2.0 |
|--------------------------|---------------|
| Conflits de plugins (WooCommerce + Dokan + Woodmart) | Codebase unifiée, zéro plugin tiers |
| Mises à jour qui cassent des fonctionnalités | Contrôle total des dépendances via Composer + npm |
| Personnalisation limitée par les hooks | Logique métier sur mesure |
| Performances dégradées par le bloat WordPress | Stack optimisée, SSR/SSG ciblés |
| Sécurité dépendante de plugins tiers | Sécurité implémentée nativement |

---

## 3. Contraintes architecturales

### 3.1 Contraintes techniques

- Le **frontend visuel doit être identique à 100%** à l'actuel (couleurs, layout, typographie, composants, UX/navigation)
- L'**API doit être REST** et stateless pour permettre l'application mobile Phase 2 sans refactoring
- Le système doit fonctionner entièrement sur **Railway** (hébergement)
- La plateforme traite des **données personnelles de résidents québécois** : conformité Loi 25 obligatoire
- La monnaie est le **dollar canadien (CAD)**; les taxes **TPS (5%) + TVQ (9,975%)** s'appliquent

### 3.2 Contraintes culturelles et linguistiques

- Interface entièrement en **français canadien (fr-CA)**
- Dates au format **JJ/MM/AAAA**
- Adresses au format **canadien** (province, code postal A1A 1A1)
- Positionnement **"Produits 100% québécois"** ancré dans toutes les communications système (emails, confirmations, erreurs)
- Livraison à **l'échelle nationale canadienne**

### 3.3 Contraintes commerciales

- Système de **commission prélevée sur chaque vente vendeur** (taux configurable par vendeur)
- Paiements gérés via **Stripe Connect** (marketplace)
- Chaque vendeur a un **compte Stripe Connect** lié pour réception directe des fonds

---

## 4. Vue d'ensemble du système

### 4.1 Diagramme de contexte (C4 - Niveau 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                        HORIZON LOCAL                            │
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────────┐    │
│  │  Acheteur│    │    Vendeur   │    │   Administrateur   │    │
│  │(Client)  │    │  (Compagnie) │    │  (Alain / équipe)  │    │
│  └────┬─────┘    └──────┬───────┘    └─────────┬──────────┘    │
│       │                 │                       │               │
│       └────────────┬────┘           ┌───────────┘               │
│                    ▼                ▼                            │
│          ┌─────────────────────────────┐                        │
│          │     NEXT.JS FRONTEND        │                        │
│          │  (Marketplace + Dashboards) │                        │
│          └──────────────┬──────────────┘                        │
│                         │ API REST                              │
│          ┌──────────────▼──────────────┐                        │
│          │      LARAVEL API            │                        │
│          │  (Logique métier + Auth)    │                        │
│          └──┬──────────┬──────────┬───┘                        │
│             │          │          │                             │
│        ┌────▼───┐  ┌───▼───┐  ┌──▼──────┐                     │
│        │Postgres│  │ Redis │  │ Storage │                     │
│        │  (DB)  │  │(Cache)│  │(Fichiers│                     │
│        └────────┘  └───────┘  └─────────┘                     │
└─────────────────────────────────────────────────────────────────┘
         │                              │
   ┌─────▼─────┐                 ┌──────▼──────┐
   │  STRIPE   │                 │   SMTP      │
   │ CONNECT   │                 │  (Emails)   │
   └───────────┘                 └─────────────┘
```

### 4.2 Flux principaux

**Flux achat :**
```
Acheteur → Catalogue → Fiche produit → Panier → Checkout → 
Stripe Payment → Confirmation → Notification vendeur → Livraison
```

**Flux vente (vendeur) :**
```
Vendeur → Dashboard → Ajout produit → Validation admin → 
Publication → Vente → Commission prélevée → Virement Stripe Connect
```

**Flux commission :**
```
Paiement client (100 $) → Stripe reçoit → 
Commission plateforme (ex: 10% = 10 $) → Virement vendeur (90 $)
```

---

## 5. Stack technique

### 5.1 Vue d'ensemble

| Couche | Technologie | Version | Rôle |
|--------|-------------|---------|------|
| Frontend | Next.js | 14+ (App Router) | SSR/SSG, UI marketplace |
| Langage frontend | TypeScript | 5+ | Type safety |
| Styles | Tailwind CSS | 3+ | Reproduction du design actuel |
| Backend | Laravel | 11+ | API REST, logique métier |
| Langage backend | PHP | 8.3+ | - |
| Base de données | PostgreSQL | 16+ | Données relationnelles, transactions |
| Cache | Redis | 7+ | Sessions, cache catalogue, queues |
| Paiement | Stripe Connect | API 2024 | Marketplace multi-vendeurs |
| Stockage fichiers | Railway Volumes | - | Images produits, logos |
| Emails | Resend | - | Transactionnel (fr-CA) |
| Recherche | Laravel Scout + Meilisearch | - | Recherche produits |
| Hébergement | Railway | - | Tous les services |
| CI/CD | GitHub Actions | - | Tests + déploiement automatique |

### 5.2 Justification des choix

**Next.js (App Router) :**
- SSR pour les pages produits et boutiques (SEO critique pour une marketplace)
- SSG pour les pages statiques (CGV, politique de confidentialité, blog)
- ISR (Incremental Static Regeneration) pour le catalogue mis à jour fréquemment
- Stack React - déjà maîtrisé (Digital Zeph, M'ZAKA)

**Laravel :**
- Déjà utilisé en production (Digital Zeph, horizonlocal.ca actuel)
- Eloquent ORM protège nativement contre les injections SQL
- Sanctum pour l'auth API stateless (tokens Bearer)
- Jobs/Queues natifs pour les traitements asynchrones (emails, commissions)
- Policies/Gates pour le RBAC (admin, vendeur, acheteur)

**PostgreSQL (vs MySQL) :**
- Transactions ACID robustes - indispensable pour les paiements et les commissions
- Meilleur support des requêtes complexes (aggrégations, fenêtres)
- Types JSON natifs pour les variantes de produits
- Railway propose PostgreSQL managé nativement

**Stripe Connect (Express) :**
- Conçu spécifiquement pour les marketplaces avec multi-vendeurs
- Les splits de paiement sont gérés automatiquement par Stripe
- Conformité PCI DSS déléguée à Stripe
- Prise en charge des remboursements multi-vendeurs

---

## 6. Architecture des composants

### 6.1 Frontend - Next.js (App Router)

```
app/
├── (public)/                   # Pages publiques (sans auth)
│   ├── page.tsx               # Accueil (réplique exacte homepage actuelle)
│   ├── shop/                  # Catalogue produits
│   │   ├── page.tsx           # Liste produits avec filtres
│   │   └── [slug]/page.tsx    # Fiche produit
│   ├── product-category/      # Pages catégories
│   │   └── [slug]/page.tsx
│   ├── stores/                # Liste des boutiques vendeurs
│   │   └── [slug]/page.tsx    # Boutique individuelle (ex: Colorantic)
│   ├── promotions/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── cart/page.tsx          # Panier
│   ├── checkout/page.tsx      # Commande + paiement
│   ├── favoris/page.tsx       # Wishlist
│   └── compare/page.tsx       # Comparateur produits
│
├── (auth)/                    # Auth (connexion, inscription)
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── my-account/                # Espace client
│   ├── page.tsx               # Dashboard client
│   ├── orders/page.tsx
│   └── profile/page.tsx
│
├── vendor/                    # Dashboard vendeur (protégé)
│   ├── dashboard/page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── orders/page.tsx
│   └── earnings/page.tsx      # Revenus + commissions
│
├── admin/                     # Dashboard admin (protégé)
│   ├── dashboard/page.tsx
│   ├── vendors/page.tsx
│   ├── products/page.tsx
│   ├── orders/page.tsx
│   ├── commissions/page.tsx
│   └── settings/page.tsx
│
└── api/                       # Route handlers Next.js (webhook Stripe, etc.)
    └── webhooks/stripe/route.ts
```

**Composants réutilisables (réplique design actuel) :**
```
components/
├── layout/
│   ├── Header.tsx             # Barre de navigation (logo, search, cart, account)
│   ├── Sidebar.tsx            # Catégories (menu latéral)
│   └── Footer.tsx             # Footer complet
├── product/
│   ├── ProductCard.tsx        # Carte produit (wishlist, comparer, aperçu rapide)
│   ├── ProductGrid.tsx        # Grille produits
│   ├── QuickView.tsx          # Modal aperçu rapide
│   └── ProductGallery.tsx     # Galerie images fiche produit
├── cart/
│   ├── CartDrawer.tsx         # Mini-panier slide
│   └── CartItem.tsx
├── vendor/
│   └── VendorCard.tsx         # Carte boutique compagnie
└── ui/
    ├── CategoryBadge.tsx
    ├── PriceDisplay.tsx       # Gestion CAD + taxes
    ├── StockBadge.tsx
    └── Countdown.tsx          # Timer promotions
```

### 6.2 Backend - Laravel (API REST)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   ├── AuthController.php       # Login, register, logout
│   │   │   └── PasswordController.php   # Reset mot de passe
│   │   ├── Catalog/
│   │   │   ├── ProductController.php
│   │   │   ├── CategoryController.php
│   │   │   └── SearchController.php
│   │   ├── Vendor/
│   │   │   ├── VendorController.php
│   │   │   ├── VendorProductController.php
│   │   │   └── VendorOrderController.php
│   │   ├── Customer/
│   │   │   ├── CartController.php
│   │   │   ├── WishlistController.php
│   │   │   ├── OrderController.php
│   │   │   └── ReviewController.php
│   │   ├── Checkout/
│   │   │   ├── CheckoutController.php
│   │   │   └── StripeController.php
│   │   ├── Admin/
│   │   │   ├── AdminDashboardController.php
│   │   │   ├── AdminVendorController.php
│   │   │   ├── AdminOrderController.php
│   │   │   └── CommissionController.php
│   │   └── Webhook/
│   │       └── StripeWebhookController.php
│   ├── Middleware/
│   │   ├── RoleMiddleware.php           # Vérification rôle (admin, vendor, customer)
│   │   ├── VendorApprovedMiddleware.php # Vendeur approuvé par admin
│   │   └── LocaleMiddleware.php        # fr-CA forcé
│   └── Requests/                       # Form Requests (validation)
│       ├── StoreProductRequest.php
│       ├── CheckoutRequest.php
│       └── ...
├── Models/
│   ├── User.php
│   ├── Vendor.php
│   ├── Product.php
│   ├── Category.php
│   ├── Order.php
│   ├── OrderItem.php
│   ├── Cart.php
│   ├── CartItem.php
│   ├── Commission.php
│   ├── Review.php
│   ├── Wishlist.php
│   └── BlogPost.php
├── Policies/                           # RBAC
│   ├── ProductPolicy.php
│   ├── OrderPolicy.php
│   └── VendorPolicy.php
├── Jobs/                               # Traitement asynchrone
│   ├── SendOrderConfirmationEmail.php
│   ├── NotifyVendorNewOrder.php
│   ├── ProcessStripeTransfer.php
│   └── GenerateInvoice.php
├── Services/
│   ├── StripeService.php               # Logique Stripe Connect
│   ├── CommissionService.php           # Calcul et dispatch commissions
│   ├── TaxService.php                  # Calcul TPS + TVQ
│   └── CartService.php
└── Notifications/
    ├── OrderConfirmed.php
    ├── NewOrderForVendor.php
    └── PaymentFailed.php
```

### 6.3 Routes API REST

**Auth**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

**Catalogue (public)**
```
GET    /api/products                    # Liste avec filtres, pagination
GET    /api/products/{slug}             # Fiche produit
GET    /api/categories                  # Arbre catégories
GET    /api/categories/{slug}/products  # Produits par catégorie
GET    /api/vendors                     # Liste boutiques
GET    /api/vendors/{slug}              # Boutique individuelle
GET    /api/search?q=...               # Recherche
```

**Panier et commandes (client)**
```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/{id}
DELETE /api/cart/items/{id}
POST   /api/checkout                    # Création PaymentIntent Stripe
POST   /api/orders
GET    /api/orders/{id}
GET    /api/my-account/orders
POST   /api/wishlist/{product_id}
DELETE /api/wishlist/{product_id}
GET    /api/wishlist
```

**Dashboard vendeur**
```
GET    /api/vendor/dashboard
GET    /api/vendor/products
POST   /api/vendor/products
PUT    /api/vendor/products/{id}
DELETE /api/vendor/products/{id}
GET    /api/vendor/orders
PUT    /api/vendor/orders/{id}/status
GET    /api/vendor/earnings
POST   /api/vendor/stripe/connect       # Création compte Stripe Connect
```

**Dashboard admin**
```
GET    /api/admin/dashboard
GET    /api/admin/vendors
PUT    /api/admin/vendors/{id}/approve
GET    /api/admin/orders
GET    /api/admin/commissions
PUT    /api/admin/settings
```

---

## 7. Modèle de données

### 7.1 Schéma PostgreSQL

```sql
-- Utilisateurs (rôles : admin, vendor, customer)
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'vendor', 'customer')),
    phone       VARCHAR(20),
    email_verified_at TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Profils vendeurs
CREATE TABLE vendors (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT REFERENCES users(id) ON DELETE CASCADE,
    store_name          VARCHAR(255) NOT NULL,
    store_slug          VARCHAR(255) UNIQUE NOT NULL,
    description         TEXT,
    logo_url            VARCHAR(500),
    banner_url          VARCHAR(500),
    address             VARCHAR(255),
    city                VARCHAR(100),
    province            VARCHAR(2),           -- QC, ON, BC...
    postal_code         VARCHAR(10),
    commission_rate     DECIMAL(5,2) DEFAULT 10.00,  -- % prélevé par la plateforme
    stripe_account_id   VARCHAR(255),         -- ID compte Stripe Connect Express
    stripe_onboarded    BOOLEAN DEFAULT FALSE,
    status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Catégories (arbre auto-référentiel)
CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    parent_id   BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    image_url   VARCHAR(500),
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE
);

-- Produits
CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    vendor_id       BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
    category_id     BIGINT REFERENCES categories(id),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    short_description TEXT,
    sku             VARCHAR(100),
    price           DECIMAL(10,2) NOT NULL,
    compare_price   DECIMAL(10,2),           -- Prix barré (promotion)
    stock           INT DEFAULT 0,
    manage_stock    BOOLEAN DEFAULT TRUE,
    status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
    is_featured     BOOLEAN DEFAULT FALSE,
    meta_title      VARCHAR(255),
    meta_description TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Images produits
CREATE TABLE product_images (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT REFERENCES products(id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    alt_text    VARCHAR(255),
    is_primary  BOOLEAN DEFAULT FALSE,
    sort_order  INT DEFAULT 0
);

-- Variantes produits (couleur, taille, etc.)
CREATE TABLE product_variants (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT REFERENCES products(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,   -- "Couleur", "Taille"
    value           VARCHAR(100) NOT NULL,   -- "Rouge", "XL"
    price_modifier  DECIMAL(10,2) DEFAULT 0,
    stock           INT DEFAULT 0,
    sku             VARCHAR(100)
);

-- Commandes
CREATE TABLE orders (
    id                      BIGSERIAL PRIMARY KEY,
    customer_id             BIGINT REFERENCES users(id),
    status                  VARCHAR(30) DEFAULT 'pending'
                            CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
    subtotal                DECIMAL(10,2) NOT NULL,
    tax_gst                 DECIMAL(10,2) NOT NULL,  -- TPS 5%
    tax_tvq                 DECIMAL(10,2) NOT NULL,  -- TVQ 9.975%
    shipping_cost           DECIMAL(10,2) DEFAULT 0,
    total                   DECIMAL(10,2) NOT NULL,
    currency                CHAR(3) DEFAULT 'CAD',
    stripe_payment_intent_id VARCHAR(255),
    shipping_name           VARCHAR(255),
    shipping_address        VARCHAR(255),
    shipping_city           VARCHAR(100),
    shipping_province       VARCHAR(2),
    shipping_postal_code    VARCHAR(10),
    notes                   TEXT,
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

-- Articles de commande (1 commande peut avoir plusieurs vendeurs)
CREATE TABLE order_items (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id          BIGINT REFERENCES products(id),
    vendor_id           BIGINT REFERENCES vendors(id),
    variant_id          BIGINT REFERENCES product_variants(id),
    product_name        VARCHAR(255) NOT NULL,  -- Snapshot au moment de l'achat
    unit_price          DECIMAL(10,2) NOT NULL,
    quantity            INT NOT NULL,
    subtotal            DECIMAL(10,2) NOT NULL,
    commission_rate     DECIMAL(5,2) NOT NULL,
    commission_amount   DECIMAL(10,2) NOT NULL,  -- Part plateforme
    vendor_amount       DECIMAL(10,2) NOT NULL,  -- Part vendeur
    fulfillment_status  VARCHAR(20) DEFAULT 'pending'
);

-- Commissions (suivi des virements Stripe)
CREATE TABLE commissions (
    id                  BIGSERIAL PRIMARY KEY,
    order_item_id       BIGINT REFERENCES order_items(id),
    vendor_id           BIGINT REFERENCES vendors(id),
    amount              DECIMAL(10,2) NOT NULL,
    platform_fee        DECIMAL(10,2) NOT NULL,
    stripe_transfer_id  VARCHAR(255),           -- ID du virement vers le vendeur
    status              VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending','transferred','failed')),
    transferred_at      TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Panier (session ou user)
CREATE TABLE carts (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
    session_id  VARCHAR(255),                   -- Pour guests
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
    id          BIGSERIAL PRIMARY KEY,
    cart_id     BIGINT REFERENCES carts(id) ON DELETE CASCADE,
    product_id  BIGINT REFERENCES products(id),
    variant_id  BIGINT REFERENCES product_variants(id),
    quantity    INT DEFAULT 1,
    added_at    TIMESTAMP DEFAULT NOW()
);

-- Liste de souhaits
CREATE TABLE wishlists (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
    product_id  BIGINT REFERENCES products(id) ON DELETE CASCADE,
    added_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Avis / évaluations
CREATE TABLE reviews (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT REFERENCES products(id) ON DELETE CASCADE,
    user_id     BIGINT REFERENCES users(id),
    order_id    BIGINT REFERENCES orders(id),   -- Seul un acheteur vérifié peut commenter
    rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Blog
CREATE TABLE blog_posts (
    id              BIGSERIAL PRIMARY KEY,
    author_id       BIGINT REFERENCES users(id),
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    excerpt         TEXT,
    content         TEXT NOT NULL,
    cover_image_url VARCHAR(500),
    category        VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Tokens API (Laravel Sanctum)
CREATE TABLE personal_access_tokens (
    id              BIGSERIAL PRIMARY KEY,
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT NOT NULL,
    name            VARCHAR(255) NOT NULL,
    token           VARCHAR(64) UNIQUE NOT NULL,
    abilities       TEXT,
    last_used_at    TIMESTAMP,
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Index de performance
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_vendor_id ON order_items(vendor_id);
CREATE INDEX idx_commissions_vendor_id ON commissions(vendor_id);
CREATE INDEX idx_commissions_status ON commissions(status);
```

---

## 8. Variantes de produits avancées

### 8.1 Concept

Chaque vendeur définit librement ses propres **types d'attributs** (Couleur, Taille, Matière, Format, etc.) et leurs **valeurs** (Rouge, XL, Bois massif, 500ml, etc.). La combinaison d'attributs forme une **variante**, chacune ayant son propre prix, stock, SKU et image.

**Exemple - JAY TOUT EN BOIS (table de cuisine) :**

| Couleur | Matière | Prix | Stock | SKU |
|---------|---------|------|-------|-----|
| Naturel | Chêne | 350 $ | 5 | JTB-TABLE-CH-NAT |
| Noir | Chêne | 380 $ | 3 | JTB-TABLE-CH-NOI |
| Naturel | Pin | 280 $ | 8 | JTB-TABLE-PI-NAT |

**Exemple - Colorantic (peinture) :**

| Format | Couleur | Prix | Stock | SKU |
|--------|---------|------|-------|-----|
| 500 ml | Blanc cassé | 18,99 $ | 50 | COL-500-BC |
| 1 L | Blanc cassé | 33,99 $ | 30 | COL-1L-BC |
| 4 L | Blanc cassé | 89,99 $ | 15 | COL-4L-BC |

### 8.2 Schéma de données - Variantes

```sql
-- Types d'attributs définis par chaque vendeur
-- Ex: vendor 1 crée "Couleur", vendor 2 crée "Format"
CREATE TABLE attribute_types (
    id          BIGSERIAL PRIMARY KEY,
    vendor_id   BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,   -- "Couleur", "Taille", "Format"
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Valeurs pour chaque type d'attribut
-- Ex: "Couleur" -> "Rouge", "Bleu", "Noir"
CREATE TABLE attribute_values (
    id                BIGSERIAL PRIMARY KEY,
    attribute_type_id BIGINT REFERENCES attribute_types(id) ON DELETE CASCADE,
    value             VARCHAR(100) NOT NULL,  -- "Rouge", "XL", "500 ml"
    color_hex         VARCHAR(7),             -- "#FF0000" (si type = Couleur)
    sort_order        INT DEFAULT 0
);

-- Variantes : combinaisons d'attributs d'un produit
-- Ex: Produit "Table" -> Variante "Chêne / Naturel"
CREATE TABLE product_variants (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT REFERENCES products(id) ON DELETE CASCADE,
    sku         VARCHAR(100) UNIQUE,
    price       DECIMAL(10,2) NOT NULL,       -- Prix spécifique à cette variante
    compare_price DECIMAL(10,2),             -- Prix barré variante
    stock       INT DEFAULT 0,
    image_url   VARCHAR(500),                 -- Image spécifique à la variante
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Table pivot : quelles valeurs d'attributs composent chaque variante
-- Ex: variante_id=1 -> couleur=Rouge + taille=XL
CREATE TABLE variant_attribute_values (
    variant_id        BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_value_id BIGINT REFERENCES attribute_values(id) ON DELETE CASCADE,
    PRIMARY KEY (variant_id, attribute_value_id)
);

-- Index
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_attribute_types_vendor_id ON attribute_types(vendor_id);
CREATE INDEX idx_attribute_values_type_id ON attribute_values(attribute_type_id);
```

### 8.3 Logique API - Variantes

**Récupération d'un produit avec ses variantes :**
```
GET /api/products/{slug}
```

```json
{
  "id": 42,
  "name": "La Irène",
  "price_from": 70.00,
  "attribute_types": [
    {
      "id": 1,
      "name": "Couleur",
      "values": [
        { "id": 10, "value": "Naturel", "color_hex": null },
        { "id": 11, "value": "Noir", "color_hex": "#1a1a1a" }
      ]
    },
    {
      "id": 2,
      "name": "Matière",
      "values": [
        { "id": 20, "value": "Chêne" },
        { "id": 21, "value": "Pin" }
      ]
    }
  ],
  "variants": [
    {
      "id": 1,
      "sku": "JTB-IRENE-CH-NAT",
      "price": 70.00,
      "stock": 5,
      "image_url": "...",
      "attribute_value_ids": [10, 20]
    },
    {
      "id": 2,
      "sku": "JTB-IRENE-CH-NOI",
      "price": 80.00,
      "stock": 3,
      "image_url": "...",
      "attribute_value_ids": [11, 20]
    }
  ]
}
```

**Logique frontend (Next.js) :**
```typescript
// Quand l'utilisateur sélectionne des attributs,
// on trouve la variante correspondante
function findVariant(
  selectedValues: number[],
  variants: Variant[]
): Variant | undefined {
  return variants.find(v =>
    selectedValues.every(valId => v.attribute_value_ids.includes(valId)) &&
    v.attribute_value_ids.length === selectedValues.length
  );
}
```

### 8.4 Dashboard vendeur - Gestion des variantes

**Routes API vendeur :**
```
GET    /api/vendor/attribute-types              # Mes types d'attributs
POST   /api/vendor/attribute-types              # Créer un type
POST   /api/vendor/attribute-types/{id}/values  # Ajouter une valeur
DELETE /api/vendor/attribute-types/{id}         # Supprimer un type
GET    /api/vendor/products/{id}/variants       # Variantes d'un produit
POST   /api/vendor/products/{id}/variants       # Créer une variante
PUT    /api/vendor/products/{id}/variants/{vid} # Modifier prix/stock
DELETE /api/vendor/products/{id}/variants/{vid} # Supprimer variante
```

**Interface vendeur - Générateur de variantes :**
Le dashboard vendeur propose un générateur automatique : le vendeur choisit ses types d'attributs et leurs valeurs, et le système génère automatiquement toutes les combinaisons possibles sous forme de tableau éditable (prix, stock, SKU, image par variante).

---

## 9. Import CSV de produits

### 9.1 Objectif

Permettre à chaque vendeur d'importer en masse ses produits via un fichier CSV, sans avoir à les saisir un par un. Indispensable pour les vendeurs avec de larges catalogues (ex: Colorantic avec de nombreuses références de peinture).

### 9.2 Format du CSV attendu

```csv
name,sku,description,price,compare_price,stock,category_slug,images,variant_color,variant_size,variant_price,variant_stock,variant_sku
"Baie d'açaï 16 oz",COL-ACAI-16,Description du produit...,33.99,,50,articles-dexterieur,https://...|https://...,,,,
"Table La Irène",JTB-IRENE,Belle table en bois...,70.00,90.00,,articles-de-maison,https://...,Naturel,Standard,70.00,5,JTB-IRENE-NAT
"Table La Irène",JTB-IRENE,Belle table en bois...,70.00,90.00,,articles-de-maison,,Noir,Standard,80.00,3,JTB-IRENE-NOI
```

**Règles du CSV :**
- Encodage : **UTF-8** (obligatoire pour les caractères français)
- Séparateur : virgule (`,`)
- Plusieurs images : séparées par `|`
- Plusieurs variantes : une ligne par combinaison (même `sku` de base)
- Ligne d'en-tête obligatoire
- Taille max du fichier : **10 Mo** (environ 10 000 produits)

### 9.3 Architecture de l'import

```
Vendeur upload CSV
       |
       v
POST /api/vendor/products/import
       |
       v
CsvImportController
  - Valide l'extension et la taille du fichier
  - Stocke le fichier temporairement (Railway Volume)
  - Dispatche le job asynchrone
  - Retourne un import_id
       |
       v
Job: ProcessProductCsvImport (Queue Redis)
  - Lit le CSV ligne par ligne (chunk de 100)
  - Valide chaque ligne (règles métier)
  - Crée les produits, variantes, images
  - Collecte les erreurs sans interrompre
  - Met à jour la progression en temps réel (Redis)
  - Envoie email de rapport à la fin
       |
       v
GET /api/vendor/imports/{import_id}/status
  - Retourne : pending | processing | done | failed
  - Progression : 45/200 lignes traitées
  - Erreurs détectées : [{ligne: 12, erreur: "SKU déjà existant"}]
```

### 9.4 Validation des lignes

```php
class CsvProductRowValidator
{
    public function validate(array $row, int $lineNumber): array
    {
        $errors = [];

        if (empty($row['name'])) {
            $errors[] = "Ligne {$lineNumber} : le nom est obligatoire";
        }
        if (!is_numeric($row['price']) || $row['price'] < 0) {
            $errors[] = "Ligne {$lineNumber} : prix invalide";
        }
        if (!Category::where('slug', $row['category_slug'])->exists()) {
            $errors[] = "Ligne {$lineNumber} : catégorie inconnue '{$row['category_slug']}'";
        }
        if (!empty($row['sku']) && Product::where('sku', $row['sku'])->exists()) {
            $errors[] = "Ligne {$lineNumber} : SKU '{$row['sku']}' déjà utilisé";
        }

        return $errors;
    }
}
```

### 9.5 Rapport d'import (email envoyé au vendeur)

```
Objet : Rapport d'importation - Horizon Local

Bonjour [Prénom Vendeur],

Votre importation CSV est terminée.

Résultats :
- Produits importés avec succès : 47
- Produits ignorés (erreurs)    : 3
- Variantes créées              : 142
- Images importées              : 89

Erreurs détectées :
- Ligne 12 : SKU "COL-001" déjà existant
- Ligne 28 : Catégorie "informatique" introuvable
- Ligne 45 : Prix manquant

Vos produits sont en attente de validation par l'équipe Horizon Local.

Télécharger le rapport complet : [Lien]
```

### 9.6 Template CSV téléchargeable

Le dashboard vendeur propose un bouton **"Télécharger le modèle CSV"** qui génère un fichier avec :
- Toutes les colonnes correctement nommées
- Une ligne d'exemple commentée
- La liste des slugs de catégories disponibles en bas du fichier

```
GET /api/vendor/products/csv-template
```

---

## 10. Cycle de vie d'une commande

### 10.1 États d'un produit

Un produit passe par les états suivants depuis sa création jusqu'à sa disponibilité :

```
[Création par le vendeur]
         |
         v
      DRAFT
  (brouillon, invisible)
         |
         | Vendeur soumet pour review
         v
   PENDING_REVIEW
  (en attente de validation admin)
         |
         | Admin approuve        | Admin rejette
         v                       v
     PUBLISHED               REJECTED
  (visible, achetable)    (refusé, vendeur notifié)
         |
         | Vendeur archive ou stock = 0
         v
      ARCHIVED
  (masqué, non supprimé)
```

**Transitions d'états (ProductStateService) :**

| État actuel | Action | Nouvel état | Acteur |
|-------------|--------|-------------|--------|
| draft | Soumettre | pending_review | Vendeur |
| pending_review | Approuver | published | Admin |
| pending_review | Rejeter | rejected | Admin |
| rejected | Modifier + resoumettre | pending_review | Vendeur |
| published | Archiver | archived | Vendeur ou Admin |
| archived | Réactiver | pending_review | Vendeur |

### 10.2 États d'une commande - Cycle complet

```
[Client finalise le checkout]
         |
         v
   PENDING_PAYMENT
  (PaymentIntent créé, paiement en cours)
         |
         | Stripe confirme le paiement
         v
  PAYMENT_CONFIRMED
  (fonds capturés, vendeur notifié)
         |
         | Vendeur prépare la commande
         v
     PROCESSING
  (en préparation chez le vendeur)
         |
         | Vendeur marque comme expédié + ajoute tracking
         v
      SHIPPED
  (expédié, numéro de suivi disponible)
         |
         | Transporteur confirme la livraison
         | (webhook ou mise à jour manuelle)
         v
    IN_TRANSIT
  (en transit / en route)
         |
         | Livraison confirmée
         v
    DELIVERED
  (livré au client)
         |
         | 3 jours après livraison
         v
     COMPLETED
  (commande finalisée, avis possible, commission libérée)

--- Branches alternatives ---

PAYMENT_CONFIRMED --> CANCELLED (annulation avant expédition)
SHIPPED --> RETURN_REQUESTED (client demande retour)
RETURN_REQUESTED --> REFUNDED (retour accepté, remboursement Stripe)
PAYMENT_CONFIRMED --> REFUNDED (remboursement direct si problème)
```

### 10.3 Gestion multi-vendeurs dans une commande

Une commande peut contenir des produits de **plusieurs vendeurs**. Chaque `order_item` a son propre statut de fulfillment indépendant.

```
Commande #1042 (Client: Marie Tremblay, Total: 153,99 $)
├── Article 1 : Baie d'açaï 16oz (Colorantic) - Status: SHIPPED (tracking: 1234567890CA)
├── Article 2 : La Irène Naturel (JAY TOUT EN BOIS) - Status: PROCESSING
└── Article 3 : Savon artisanal (Vendeur C) - Status: DELIVERED
```

**Impact sur la commission :**
- La commission de chaque vendeur est libérée (virement Stripe Connect) uniquement quand son article passe à `COMPLETED`
- Si un article est remboursé, la commission est annulée et le montant restitué

### 10.4 Schéma - États de commande

```sql
-- Ajout des colonnes manquantes à orders
ALTER TABLE orders ADD COLUMN status VARCHAR(30) DEFAULT 'pending_payment'
    CHECK (status IN (
        'pending_payment', 'payment_confirmed', 'processing',
        'shipped', 'in_transit', 'delivered', 'completed',
        'cancelled', 'return_requested', 'refunded'
    ));

-- Historique des changements d'état (audit trail)
CREATE TABLE order_status_history (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    old_status  VARCHAR(30),
    new_status  VARCHAR(30) NOT NULL,
    comment     TEXT,              -- Note interne (ex: "Refus client: mauvaise taille")
    changed_by  BIGINT REFERENCES users(id),
    changed_at  TIMESTAMP DEFAULT NOW()
);

-- Statut par article (fulfillment multi-vendeur)
ALTER TABLE order_items ADD COLUMN fulfillment_status VARCHAR(30) DEFAULT 'pending'
    CHECK (fulfillment_status IN (
        'pending', 'processing', 'packed', 'shipped',
        'in_transit', 'delivered', 'completed', 'cancelled', 'refunded'
    ));

ALTER TABLE order_items ADD COLUMN tracking_number VARCHAR(100);
ALTER TABLE order_items ADD COLUMN carrier VARCHAR(50);          -- canada_post, purolator, ups, fedex, other
ALTER TABLE order_items ADD COLUMN shipped_at TIMESTAMP;
ALTER TABLE order_items ADD COLUMN delivered_at TIMESTAMP;
ALTER TABLE order_items ADD COLUMN estimated_delivery_date DATE;
```

---

## 11. Système de livraison et suivi

### 11.1 Transporteurs supportés

| Transporteur | Couverture | Intégration |
|--------------|-----------|-------------|
| Canada Post | National (priorité) | API REST officielle |
| Purolator | National (express) | API REST officielle |
| UPS | National + International | API REST officielle |
| FedEx | National + International | API REST officielle |
| Autre / Manuel | Local, artisanal | Saisie manuelle du tracking |

### 11.2 Flux de livraison

**Côté vendeur (dashboard) :**
```
1. Vendeur reçoit la notif "Nouvelle commande #1042"
2. Vendeur prépare le colis
3. Vendeur marque l'article "En préparation" (PROCESSING)
4. Vendeur expédie et saisit dans son dashboard :
   - Transporteur : Canada Post
   - Numéro de tracking : 1234567890CA
   - Date d'expédition estimée
5. Statut passe automatiquement à SHIPPED
6. Client reçoit un email avec le lien de suivi
```

**Côté client (my-account) :**
```
Page "Mes commandes" > Commande #1042
├── Statut global : En cours de livraison
├── Article 1 : Baie d'açaï
│   ├── Transporteur : Canada Post
│   ├── Numéro de suivi : 1234567890CA
│   ├── [Suivre mon colis] -> lien Canada Post
│   └── Livraison estimée : 25 mai 2026
└── Article 2 : La Irène
    └── Statut : En préparation chez le vendeur
```

### 11.3 Calcul des frais de livraison

**Approche Phase 1 - Frais fixes par vendeur :**

Chaque vendeur définit sa politique de livraison dans son dashboard :

```sql
CREATE TABLE vendor_shipping_zones (
    id              BIGSERIAL PRIMARY KEY,
    vendor_id       BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
    zone_name       VARCHAR(100) NOT NULL,  -- "Québec", "Canada", "International"
    provinces       TEXT[],                 -- ['QC', 'ON', 'NB'] ou NULL = toutes
    base_fee        DECIMAL(10,2) DEFAULT 0,  -- Frais de base
    free_above      DECIMAL(10,2),            -- Livraison gratuite si commande > X $
    per_kg_fee      DECIMAL(10,2) DEFAULT 0,  -- Frais par kg supplémentaire
    estimated_days_min INT DEFAULT 3,
    estimated_days_max INT DEFAULT 7,
    is_active       BOOLEAN DEFAULT TRUE
);

-- Poids déclaré par produit
ALTER TABLE products ADD COLUMN weight_kg DECIMAL(6,3);
ALTER TABLE products ADD COLUMN dimensions_cm VARCHAR(50);   -- "30x20x15"
```

**Calcul au checkout :**
```php
class ShippingCalculator
{
    public function calculate(Cart $cart, string $province): array
    {
        $shippingByVendor = [];

        foreach ($cart->itemsByVendor() as $vendorId => $items) {
            $vendor = Vendor::find($vendorId);
            $zone   = $vendor->shippingZones()->forProvince($province)->first();

            if (!$zone) {
                // Transporteur par défaut si aucune zone configurée
                $shippingByVendor[$vendorId] = ['fee' => 15.00, 'note' => 'Standard'];
                continue;
            }

            $subtotal = $items->sum(fn($i) => $i->price * $i->quantity);
            $fee = ($zone->free_above && $subtotal >= $zone->free_above)
                ? 0
                : $zone->base_fee;

            $shippingByVendor[$vendorId] = [
                'fee'            => $fee,
                'estimated_days' => "{$zone->estimated_days_min}-{$zone->estimated_days_max} jours",
                'free_above'     => $zone->free_above,
            ];
        }

        return $shippingByVendor;
    }
}
```

### 11.4 Suivi de colis - Liens directs par transporteur

```php
class TrackingUrlGenerator
{
    private array $carriers = [
        'canada_post' => 'https://www.canadapost-postescanada.ca/track-reperage/en#/details/{tracking}',
        'purolator'   => 'https://eshiponline.purolator.com/ShipOnline/Welcome.aspx?Tracking={tracking}',
        'ups'         => 'https://www.ups.com/track?tracknum={tracking}',
        'fedex'       => 'https://www.fedex.com/fedextrack/?trknbr={tracking}',
    ];

    public function generate(string $carrier, string $trackingNumber): string
    {
        $template = $this->carriers[$carrier] ?? null;
        if (!$template) {
            return "#{$trackingNumber}"; // Fallback texte
        }
        return str_replace('{tracking}', $trackingNumber, $template);
    }
}
```

### 11.5 Webhooks de livraison (Phase 1 - optionnel)

Pour une mise à jour automatique du statut (IN_TRANSIT -> DELIVERED), intégration possible via **Shippo** ou **EasyPost** comme agrégateur de tracking :

```
Webhook Shippo -> POST /api/webhooks/shippo
  - Réception de l'événement de tracking
  - Mise à jour du statut order_item
  - Envoi email client "Votre commande a été livrée"
```

En Phase 1, la mise à jour peut rester manuelle (vendeur ou admin marque "Livré").

---

## 12. Système d'emails transactionnels

### 12.1 Vue d'ensemble

Tous les emails sont envoyés via **Resend** (API), en **français canadien**, avec le nom d'expéditeur `Horizon Local <noreply@horizonlocal.ca>`.

Les emails sont traités via **Laravel Jobs/Queues** (Redis) pour ne jamais bloquer le thread HTTP.

### 12.2 Catalogue complet des emails

#### Emails client (acheteur)

| Déclencheur | Sujet | Contenu principal |
|-------------|-------|-------------------|
| Inscription | Bienvenue chez Horizon Local ! | Confirmation, lien d'activation |
| Commande créée (paiement confirmé) | Confirmation de votre commande #1042 | Récapitulatif articles, total avec taxes, adresse de livraison |
| Article expédié (par vendeur) | Votre colis est en route ! | Transporteur, numéro de tracking, lien suivi, délai estimé |
| Article livré | Votre commande est arrivée ! | Invitation à laisser un avis |
| Commande annulée | Votre commande #1042 a été annulée | Motif, remboursement attendu |
| Remboursement émis | Remboursement traité | Montant, délai (5-10 jours ouvrables) |
| Demande de retour approuvée | Votre retour a été accepté | Instructions retour |
| Réinitialisation mot de passe | Réinitialisation de votre mot de passe | Lien valide 60 min |
| Avis possible (J+3 après livraison) | Partagez votre expérience ! | Lien vers fiche produit pour laisser un avis |

#### Emails vendeur

| Déclencheur | Sujet | Contenu principal |
|-------------|-------|-------------------|
| Inscription approuvée par admin | Votre boutique est active ! | Lien dashboard, guide démarrage |
| Inscription refusée | Votre demande n'a pas été retenue | Motif, possibilité de re-soumettre |
| Nouvelle commande | Nouvelle commande #1042 - Action requise | Détail articles à préparer, adresse livraison |
| Annulation d'article | Annulation d'un article de la commande #1042 | Article annulé, montant retenu |
| Produit refusé par admin | Votre produit "[Nom]" a été refusé | Motif du refus, corrections à apporter |
| Virement Stripe effectué | Virement reçu - [Montant] CAD | Détail de la commission, lien vers Stripe |
| Import CSV terminé | Rapport d'importation CSV | Résultats (section 9.5) |
| Relevé mensuel des commissions | Relevé de commissions - [Mois] | Tableau récap ventes, commissions, virements |

#### Emails administrateur

| Déclencheur | Sujet | Contenu principal |
|-------------|-------|-------------------|
| Nouveau vendeur en attente | Nouveau vendeur à approuver : [Nom boutique] | Lien vers le panel d'approbation |
| Nouveau produit en attente | [Vendeur] a soumis un produit à valider | Lien vers le produit dans l'admin |
| Paiement échoué sur commande | Échec de paiement - Commande #1042 | Détails du client et du montant |
| Demande de retour reçue | Demande de retour - Commande #1042 | Détails, lien vers admin |

### 12.3 Structure des emails (Laravel Notifications)

```php
// Exemple : Email "Commande confirmée" envoyé au client
class OrderConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->locale('fr')
            ->subject("Confirmation de votre commande #{$this->order->id}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Merci pour votre achat ! Votre commande a bien été reçue.")
            ->line("**Numéro de commande :** #{$this->order->id}")
            ->line("**Total :** " . number_format($this->order->total, 2) . " $ CAD")
            ->action("Voir ma commande", url("/my-account/orders/{$this->order->id}"))
            ->line("Vous recevrez un email dès l'expédition de chacun de vos articles.")
            ->salutation("L'équipe Horizon Local - Produits 100% québécois");
    }
}
```

### 12.4 Déclenchement des emails dans le cycle de commande

```php
// OrderObserver.php - Observe les changements de statut
class OrderItemObserver
{
    public function updated(OrderItem $item): void
    {
        if ($item->isDirty('fulfillment_status')) {
            match ($item->fulfillment_status) {
                'shipped'   => $this->onShipped($item),
                'delivered' => $this->onDelivered($item),
                'cancelled' => $this->onCancelled($item),
                'refunded'  => $this->onRefunded($item),
                default     => null,
            };
        }
    }

    private function onShipped(OrderItem $item): void
    {
        // Email client : votre colis est en route
        $item->order->customer->notify(new ItemShippedNotification($item));
        // Email vendeur : confirmation d'expédition
        $item->vendor->user->notify(new ItemShippedConfirmationNotification($item));
    }

    private function onDelivered(OrderItem $item): void
    {
        // Email client : livré + invitation avis
        $item->order->customer->notify(new ItemDeliveredNotification($item));
        // Planifier email avis J+3
        SendReviewRequestEmail::dispatch($item)->delay(now()->addDays(3));
        // Libérer la commission (virement Stripe Connect)
        ProcessStripeTransfer::dispatch($item);
    }
}
```

### 12.5 Templates visuels

Les templates emails respectent l'identité visuelle d'Horizon Local :
- En-tête avec logo Horizon Local
- Couleur principale : `#1c61e7` (bleu du site)
- Couleur secondaire : `#f97316` (orange accent)
- Corps en fond blanc, texte `#333333`
- CTA principal en bleu `#1c61e7`, CTA secondaire (promotions, alertes) en orange `#f97316`
- Pied de page avec liens : Politique de confidentialité | Se désabonner | horizonlocal.ca
- Signature : "L'équipe Horizon Local - Produits 100% québécois"

---

## 13. Gouvernance des rôles et permissions

### 13.1 Hiérarchie des rôles (5 niveaux)

```
SUPER ADMIN
  └── Vue complète de la plateforme
  └── Seul à pouvoir hard delete
  └── Voit les enregistrements soft-deleted dans ses panels
  └── Gère les comptes admin et marketeur

ADMIN (propriétaire de la compagnie Horizon Local)
  └── Métriques globales de l'entreprise
  └── Reçoit les notifications et demandes des boutiques partenaires
  └── Vue financière globale (revenus, commissions, virements)
  └── Ne gère PAS le contenu visuel, ne supprime PAS

MARKETEUR
  └── Gestion visuelle et éditoriale de la plateforme
  └── Bannières, textes, promotions, réductions, blog
  └── Aucun accès aux données financières ou utilisateurs

VENDOR (responsable d'une boutique partenaire)
  └── Gestion de sa boutique uniquement
  └── Ses produits, ses commandes, ses revenus

CUSTOMER (acheteur)
  └── Navigation, achat, compte personnel
```

### 13.2 Mise à jour du schéma - Table users

```sql
-- Mise à jour du champ role pour 5 niveaux
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('super_admin', 'admin', 'marketer', 'vendor', 'customer'));

-- Champ deleted_at pour soft delete global
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

-- Table d'audit des actions sensibles (super admin)
CREATE TABLE audit_logs (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT REFERENCES users(id),
    action        VARCHAR(100) NOT NULL,    -- 'soft_delete', 'hard_delete', 'restore'
    model_type    VARCHAR(100) NOT NULL,    -- 'Product', 'Order', 'User', 'Vendor'...
    model_id      BIGINT NOT NULL,
    payload       JSONB,                    -- Snapshot des données avant suppression
    ip_address    VARCHAR(45),
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Soft delete sur toutes les tables principales
ALTER TABLE products     ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE vendors      ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE orders       ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE order_items  ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE categories   ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE blog_posts   ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE reviews      ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
```

### 13.3 Matrice complète des permissions

| Action | Customer | Vendor | Marketer | Admin | Super Admin |
|--------|----------|--------|----------|-------|-------------|
| Naviguer le catalogue | ✓ | ✓ | ✓ | ✓ | ✓ |
| Passer une commande | ✓ | ✓ | - | - | ✓ |
| Gérer sa boutique (produits, commandes) | - | ✓ (sienne) | - | - | ✓ |
| Import CSV produits | - | ✓ (sienne) | - | - | ✓ |
| Voir les métriques globales de l'entreprise | - | - | - | ✓ | ✓ |
| Recevoir demandes boutiques partenaires | - | - | - | ✓ | ✓ |
| Gérer les bannières et textes du site | - | - | ✓ | - | ✓ |
| Publier promotions et réductions | - | - | ✓ | - | ✓ |
| Publier des articles de blog | - | - | ✓ | - | ✓ |
| Approuver les vendeurs | - | - | - | - | ✓ |
| Approuver les produits | - | - | - | - | ✓ |
| Gérer les commissions | - | - | - | - | ✓ |
| Voir les données soft-deleted | - | - | - | - | ✓ |
| Soft delete (marquer supprimé) | - | - | - | - | ✓ |
| Hard delete (suppression définitive) | - | - | - | - | ✓ |
| Créer comptes admin / marketeur | - | - | - | - | ✓ |

### 13.4 Middleware et Policies Laravel

```php
// RoleMiddleware.php
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!in_array($request->user()?->role, $roles)) {
            abort(403, 'Accès refusé.');
        }
        return $next($request);
    }
}

// Routes protégées par rôle
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('super-admin')->group(function () {
    Route::get('/deleted', [SuperAdminController::class, 'deletedItems']);
    Route::post('/restore/{model}/{id}', [SuperAdminController::class, 'restore']);
    Route::delete('/hard-delete/{model}/{id}', [SuperAdminController::class, 'hardDelete']);
});

Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->prefix('admin')->group(function () {
    Route::get('/metrics', [AdminMetricsController::class, 'index']);
    Route::get('/partner-requests', [PartnerRequestController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'role:marketer,super_admin'])->prefix('marketer')->group(function () {
    Route::apiResource('banners', BannerController::class);
    Route::apiResource('promotions', PromotionController::class);
    Route::apiResource('blog', BlogController::class);
    Route::apiResource('discounts', DiscountController::class);
});
```

### 13.5 Super Admin - Gestion des supprimés

```php
// SuperAdminController.php
class SuperAdminController extends Controller
{
    // Liste tous les éléments soft-deleted par type
    public function deletedItems(string $model): JsonResponse
    {
        $modelClass = $this->resolveModel($model);
        return response()->json(
            $modelClass::onlyTrashed()->with('deletedBy')->paginate(50)
        );
    }

    // Restaurer un enregistrement soft-deleted
    public function restore(string $model, int $id): JsonResponse
    {
        $modelClass = $this->resolveModel($model);
        $record = $modelClass::onlyTrashed()->findOrFail($id);
        $record->restore();

        AuditLog::create([
            'user_id'    => auth()->id(),
            'action'     => 'restore',
            'model_type' => $model,
            'model_id'   => $id,
        ]);

        return response()->json(['message' => 'Restauré avec succès.']);
    }

    // Hard delete - suppression définitive
    public function hardDelete(string $model, int $id): JsonResponse
    {
        $modelClass = $this->resolveModel($model);
        $record = $modelClass::onlyTrashed()->findOrFail($id);

        AuditLog::create([
            'user_id'    => auth()->id(),
            'action'     => 'hard_delete',
            'model_type' => $model,
            'model_id'   => $id,
            'payload'    => $record->toJson(), // Snapshot avant destruction
        ]);

        $record->forceDelete();
        return response()->json(['message' => 'Supprimé définitivement.']);
    }
}
```

---

## 14. Soft Delete et purge automatique

### 14.1 Comportement du soft delete

Quand une ressource est supprimée (par un super admin), le champ `deleted_at` est renseigné. La ressource disparait de toutes les vues normales (clients, vendeurs, admin, marketeur) mais reste visible uniquement dans le panel Super Admin sous l'onglet **"Éléments supprimés"**.

```
Tableau de bord Super Admin
├── Produits supprimés (47)
├── Vendeurs suspendus (3)
├── Commandes annulées archivées (128)
├── Utilisateurs désactivés (12)
└── Articles de blog retirés (5)
```

Chaque ligne affiche : date de suppression, supprimé par, bouton **Restaurer** et bouton **Supprimer définitivement**.

### 14.2 Purge automatique après 30 jours

Un **Laravel Scheduled Command** tourne chaque nuit à 02h00 (heure de Montréal) et supprime définitivement tous les enregistrements soft-deleted depuis plus de 30 jours.

```php
// app/Console/Commands/PurgeExpiredDeletedRecords.php
class PurgeExpiredDeletedRecords extends Command
{
    protected $signature = 'horizon:purge-deleted';
    protected $description = 'Supprime définitivement les enregistrements soft-deleted depuis > 30 jours';

    private array $models = [
        Product::class,
        Vendor::class,
        Order::class,
        BlogPost::class,
        Review::class,
        User::class,
    ];

    public function handle(): void
    {
        $cutoff = now()->subDays(30);

        foreach ($this->models as $model) {
            $expired = $model::onlyTrashed()
                ->where('deleted_at', '<', $cutoff)
                ->get();

            foreach ($expired as $record) {
                // Log avant destruction
                AuditLog::create([
                    'user_id'    => null,        // Système automatique
                    'action'     => 'auto_purge',
                    'model_type' => class_basename($model),
                    'model_id'   => $record->id,
                    'payload'    => $record->toJson(),
                ]);
                $record->forceDelete();
            }

            $this->info(class_basename($model) . " : {$expired->count()} enregistrements purgés.");
        }
    }
}

// Planification dans routes/console.php
Schedule::command('horizon:purge-deleted')
    ->dailyAt('02:00')
    ->timezone('America/Toronto')
    ->emailOutputOnFailure('alain@horizonlocal.ca');
```

### 14.3 Notification avant purge

3 jours avant la purge automatique, un email est envoyé au Super Admin listant les éléments qui seront détruits :

```
Objet : [Horizon Local] 47 éléments seront supprimés définitivement dans 3 jours

Bonjour,

Les éléments suivants, supprimés il y a plus de 27 jours, seront 
définitivement détruits le 21 mai 2026 si aucune action n'est prise.

Produits : 23
Commandes archivées : 18
Utilisateurs désactivés : 6

[Accéder au panel de gestion]
```

---

## 15. Dashboard Admin (propriétaire)

### 15.1 Vue d'ensemble

Le compte **Admin** est réservé au(x) propriétaire(s) de la compagnie Horizon Local. Il donne une vue stratégique de l'activité de la plateforme sans accès aux actions de modération ou de suppression.

### 15.2 Métriques disponibles

**Métriques financières**
```
KPIs temps réel (mis à jour toutes les heures via Redis)
├── Revenus totaux du mois (CAD)
├── Revenus totaux de l'année
├── Commissions encaissées (mois / année)
├── Valeur moyenne des commandes (AOV)
├── Taux de conversion checkout
└── Remboursements émis (mois)

Graphiques (recharts côté Next.js)
├── Revenus par jour / semaine / mois (courbe)
├── Commandes par statut (donut)
├── Revenus par catégorie de produit (barres)
├── Top 5 boutiques par chiffre d'affaires
└── Top 10 produits les plus vendus
```

**Métriques plateforme**
```
├── Nombre de vendeurs actifs / en attente / suspendus
├── Nombre de produits publiés / en attente de validation
├── Nombre de clients inscrits (total + nouveaux ce mois)
├── Taux de retour / remboursement
└── Imports CSV en cours / récents
```

**Métriques livraison**
```
├── Commandes en attente d'expédition (par vendeur)
├── Délai moyen de traitement (processing -> shipped)
└── Transporteurs les plus utilisés
```

### 15.3 Notifications et demandes partenaires

Les boutiques partenaires (vendeurs) peuvent envoyer des **demandes internes** à l'admin via leur dashboard. Exemples :

- Demande d'augmentation du seuil de livraison gratuite
- Signalement d'un problème de paiement
- Demande de modification de commission
- Demande de mise en avant (feature) d'un produit
- Signalement d'un acheteur problématique

```sql
CREATE TABLE partner_requests (
    id              BIGSERIAL PRIMARY KEY,
    vendor_id       BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL
                    CHECK (type IN ('shipping', 'payment', 'commission', 'feature', 'report', 'other')),
    subject         VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'in_review', 'resolved', 'rejected')),
    admin_response  TEXT,
    responded_by    BIGINT REFERENCES users(id),
    responded_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

**Routes API admin :**
```
GET  /api/admin/metrics/financial      # KPIs financiers
GET  /api/admin/metrics/platform       # KPIs plateforme
GET  /api/admin/metrics/shipping       # KPIs livraison
GET  /api/admin/partner-requests       # Liste des demandes
PUT  /api/admin/partner-requests/{id}  # Répondre à une demande
```

---

## 16. Dashboard Marketeur

### 16.1 Vue d'ensemble

Le **Marketeur** gère l'aspect éditorial et visuel de la plateforme. Il n'a aucun accès aux données financières, aux comptes utilisateurs ou aux paramètres techniques. Son rôle est d'**animer et modérer le contenu public** du site.

### 16.2 Gestion des bannières

Le marketeur peut modifier les bannières de la page d'accueil et des pages catégories directement depuis son dashboard, sans toucher au code.

```sql
CREATE TABLE banners (
    id              BIGSERIAL PRIMARY KEY,
    location        VARCHAR(50) NOT NULL
                    CHECK (location IN ('homepage_hero', 'homepage_secondary', 'category', 'promotions_page', 'sidebar')),
    title           VARCHAR(255),
    subtitle        TEXT,
    cta_text        VARCHAR(100),
    cta_url         VARCHAR(500),
    image_desktop_url VARCHAR(500),
    image_mobile_url  VARCHAR(500),
    bg_color        VARCHAR(7),          -- Hex color
    text_color      VARCHAR(7),
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INT DEFAULT 0,
    valid_from      TIMESTAMP,
    valid_until     TIMESTAMP,
    created_by      BIGINT REFERENCES users(id),
    updated_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

### 16.3 Gestion des promotions

La page `/promotions` est entièrement gérée par le marketeur.

```sql
CREATE TABLE promotions (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    image_url       VARCHAR(500),
    discount_type   VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value  DECIMAL(10,2),        -- Ex: 20 (pour 20% ou 20 $)
    code            VARCHAR(50) UNIQUE,   -- Code promo optionnel
    applies_to      VARCHAR(20) CHECK (applies_to IN ('all', 'category', 'vendor', 'product')),
    applies_to_id   BIGINT,               -- ID catégorie, vendeur ou produit ciblé
    min_order_amount DECIMAL(10,2),       -- Montant minimum de commande
    max_uses        INT,                  -- Limite d'utilisations (NULL = illimité)
    uses_count      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    starts_at       TIMESTAMP NOT NULL,
    ends_at         TIMESTAMP,
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

### 16.4 Gestion des réductions produits

Le marketeur peut appliquer des réductions temporaires sur des produits ou catégories entières, sans passer par le vendeur.

```sql
CREATE TABLE discount_rules (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(20) CHECK (type IN ('percentage', 'fixed')),
    value           DECIMAL(10,2) NOT NULL,
    target_type     VARCHAR(20) CHECK (target_type IN ('product', 'category', 'vendor', 'all')),
    target_id       BIGINT,
    is_active       BOOLEAN DEFAULT TRUE,
    starts_at       TIMESTAMP NOT NULL,
    ends_at         TIMESTAMP,
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT NOW()
);
```

### 16.5 Gestion du blog

```
Actions disponibles pour le marketeur :
├── Créer un article (titre, contenu riche, image de couverture, catégorie)
├── Modifier un article existant
├── Publier / dépublier un article
├── Planifier une publication (date + heure)
└── Supprimer un article (soft delete - visible par super admin)
```

### 16.6 Gestion des textes du site (CMS léger)

Le marketeur peut modifier certains blocs de texte définis sur la page d'accueil et dans le footer, sans toucher au code Next.js.

```sql
CREATE TABLE content_blocks (
    id          BIGSERIAL PRIMARY KEY,
    key         VARCHAR(100) UNIQUE NOT NULL,   -- 'homepage_hero_title', 'footer_tagline', etc.
    label       VARCHAR(255) NOT NULL,           -- Nom lisible pour le marketeur
    value       TEXT NOT NULL,                   -- Contenu actuel
    type        VARCHAR(20) DEFAULT 'text'
                CHECK (type IN ('text', 'html', 'url')),
    updated_by  BIGINT REFERENCES users(id),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Données initiales
INSERT INTO content_blocks (key, label, value) VALUES
('homepage_hero_title',    'Titre principal accueil',     'Produit 100% québécois'),
('homepage_hero_subtitle', 'Sous-titre accueil',          'Votre plate-forme qui garantit et encourage le savoir-faire d''ici.'),
('homepage_offer_title',   'Titre section Offre du mois', 'Offre du mois'),
('footer_tagline',         'Slogan footer',               'L''innovation au service des entreprises Québécoises.');
```

**Route API marketeur :**
```
GET    /api/marketer/banners
POST   /api/marketer/banners
PUT    /api/marketer/banners/{id}
DELETE /api/marketer/banners/{id}    # Soft delete

GET    /api/marketer/promotions
POST   /api/marketer/promotions
PUT    /api/marketer/promotions/{id}
DELETE /api/marketer/promotions/{id}

GET    /api/marketer/discounts
POST   /api/marketer/discounts
PUT    /api/marketer/discounts/{id}

GET    /api/marketer/blog
POST   /api/marketer/blog
PUT    /api/marketer/blog/{id}
DELETE /api/marketer/blog/{id}       # Soft delete

GET    /api/marketer/content-blocks
PUT    /api/marketer/content-blocks/{key}
```

---



**Laravel Sanctum (tokens Bearer)**
- Tous les endpoints protégés requièrent un header `Authorization: Bearer {token}`
- Tokens avec expiration configurable (ex: 7 jours pour les clients, 24h pour les admins)
- Refresh token géré côté client Next.js via cookies HttpOnly

## 17. Sécurité

### 17.1 Authentification et autorisation

**Laravel Sanctum (tokens Bearer)**
- Tous les endpoints protégés requièrent un header `Authorization: Bearer {token}`
- Tokens avec expiration configurable (ex: 7 jours pour les clients, 24h pour super admin / admin)
- Refresh token géré côté client Next.js via cookies HttpOnly

**RBAC - 5 rôles (voir section 13 pour la matrice complète)**

```php
// ProductPolicy mise à jour pour 5 rôles
public function update(User $user, Product $product): bool
{
    return match($user->role) {
        'super_admin' => true,
        'vendor'      => $user->vendor?->id === $product->vendor_id,
        default       => false,
    };
}
```

### 17.2 Protection des données en transit et au repos

- **HTTPS forcé** sur tous les services Railway (certificat TLS automatique)
- **Mots de passe** hachés avec `bcrypt` (coût 12) via Laravel Hash
- **Tokens Stripe** jamais stockés en base - uniquement les IDs Stripe (stripe_payment_intent_id, stripe_account_id)
- **Données sensibles** chiffrées avec `AES-256-CBC` via Laravel Encryption (APP_KEY)

### 17.3 Protection contre les attaques courantes

**Injection SQL :**
- Eloquent ORM utilisé exclusivement - aucune requête SQL brute
- Paramètres liés (prepared statements) automatiques

**XSS (Cross-Site Scripting) :**
- Blade templates échappent automatiquement les sorties (`{{ }}`)
- Next.js échappe nativement le JSX
- Content Security Policy (CSP) header configuré

**CSRF :**
- Laravel Sanctum gère la protection CSRF pour les SPAs
- Token CSRF inclus dans les requêtes Axios côté Next.js

**Rate Limiting :**
```php
// Limites par route
Route::middleware(['throttle:login'])->group(function () {
    Route::post('/auth/login', ...); // 5 tentatives/minute
});
Route::middleware(['throttle:api'])->group(function () {
    Route::apiResource('products', ...); // 60 requêtes/minute
});
Route::middleware(['throttle:checkout'])->group(function () {
    Route::post('/checkout', ...); // 10 requêtes/minute
});
```

**Validation stricte des entrées :**
```php
// Exemple : création produit
class StoreProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'price'       => ['required', 'numeric', 'min:0', 'max:99999.99'],
            'category_id' => ['required', 'exists:categories,id'],
            'images'      => ['required', 'array', 'max:10'],
            'images.*'    => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'sku'         => ['nullable', 'string', 'unique:products,sku'],
        ];
    }
}
```

**Sécurité des fichiers uploadés :**
- Validation du type MIME réel (pas seulement l'extension)
- Images retraitées via Intervention Image (strip EXIF, re-encode)
- Stockage hors webroot (Railway Volumes)
- Noms de fichiers randomisés (UUID)

**Headers de sécurité (Next.js next.config.js) :**
```javascript
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

### 17.4 Sécurité Stripe

- Les clés Stripe sont **exclusivement en variables d'environnement** (.env / Railway Variables)
- La clé secrète Stripe (`STRIPE_SECRET_KEY`) n'est jamais exposée côté client
- Le frontend ne reçoit que la clé publique (`STRIPE_PUBLISHABLE_KEY`)
- Les webhooks Stripe sont vérifiés via signature (`STRIPE_WEBHOOK_SECRET`)
- Aucun numéro de carte n'est transmis au backend - Stripe Elements gère tout côté client

---

## 18. Performance

### 18.1 Stratégie de rendu Next.js

| Type de page | Stratégie | Justification |
|--------------|-----------|---------------|
| Accueil | ISR (revalidate: 300s) | Mis à jour fréquemment mais pas temps réel |
| Catalogue produits | SSR + cache Redis | Filtres dynamiques |
| Fiche produit | ISR (revalidate: 60s) | Stock peut changer |
| Page catégorie | ISR (revalidate: 600s) | Rarement modifiée |
| Boutique vendeur | ISR (revalidate: 300s) | - |
| Blog | SSG | Contenu statique |
| CGV, politique | SSG | Contenu statique |
| Dashboard | CSR (client only) | Données personnelles temps réel |

### 18.2 Cache Redis

```php
// Cache catalogue (5 minutes)
$products = Cache::remember("products.{$category}.{$page}", 300, function () {
    return Product::with(['images', 'vendor'])
        ->published()
        ->filter($filters)
        ->paginate(20);
});

// Cache boutique vendeur (5 minutes)
$vendor = Cache::remember("vendor.{$slug}", 300, function () {
    return Vendor::where('slug', $slug)->with(['products'])->firstOrFail();
});

// Invalidation du cache lors d'une mise à jour produit
Cache::tags(['products', "vendor.{$product->vendor_id}"])->flush();
```

### 18.3 Optimisation base de données

- **Index** sur toutes les colonnes de filtrage (voir schéma section 7.1)
- **Eager Loading** systématique pour éviter le problème N+1
- **Pagination** sur tous les listings (20 produits par page)
- **Sélection de colonnes** ciblée (jamais `SELECT *` en production)
- **Connection pooling** via PgBouncer (Railway le gère nativement)

### 18.4 Optimisation images

- Images produits converties en **WebP** à l'upload (Intervention Image)
- Génération de **thumbnails** multiples (thumbnail 150px, medium 400px, large 800px)
- Next.js Image component (`<Image>`) avec lazy loading automatique
- Format WebP servi au navigateur supporté, JPEG en fallback

### 18.5 Objectifs de performance

| Métrique | Cible | Outil de mesure |
|----------|-------|-----------------|
| LCP (Largest Contentful Paint) | < 2.0s | Lighthouse |
| FID / INP | < 100ms | Web Vitals |
| CLS | < 0.1 | Lighthouse |
| Time to First Byte (TTFB) | < 300ms | WebPageTest |
| Score Lighthouse Performance | > 90 | Lighthouse CI |

---

## 19. Conformité québécoise - Loi 25

### 10.1 Contexte légal

La **Loi 25** (Loi modernisant des dispositions législatives en matière de protection des renseignements personnels) est en vigueur depuis septembre 2023. Elle s'applique à toute entreprise québécoise collectant des données personnelles de résidents du Québec.

**Obligations applicables à Horizon Local :**

### 10.2 Obligations et mise en oeuvre

**1. Consentement explicite (cookies)**
- Bannière de consentement cookies au premier chargement
- Pas de cookies analytiques ou marketing sans consentement
- Consentement granulaire (essentiel / analytique / marketing)
- Révocation possible à tout moment (lien dans le footer)

**2. Politique de confidentialité (déjà présente)**
- Mise à jour pour inclure : types de données collectées, finalité, durée de conservation, tiers impliqués (Stripe, Resend, Railway)
- Mention de Railway (serveurs au Canada) comme lieu de stockage
- Disponible en français canadien

**3. Droits des individus**
```
GET  /api/privacy/my-data          # Droit d'accès - export JSON de toutes ses données
POST /api/privacy/delete-request   # Droit à l'effacement (anonymisation sous 30 jours)
PUT  /api/privacy/correction       # Droit de rectification
```

**4. Stockage des données au Canada**
- Railway : choisir la région **us-east (Montreal via proximité)** ou région canadienne disponible
- Stripe : données de paiement hébergées selon les standards PCI DSS
- Aucune donnée personnelle envoyée à des services hors Canada sans divulgation

**5. Responsable de la protection des renseignements personnels (RPP)**
- Désigner Alain SAWADOGO comme RPP d'Horizon Local
- Adresse de contact dédiée : `confidentialite@horizonlocal.ca`
- Mention dans la politique de confidentialité

**6. Notification de violation**
- En cas de violation de données : notification à la **Commission d'accès à l'information (CAI)** sous **72 heures**
- Notification aux personnes affectées si risque de préjudice sérieux
- Procédure documentée dans le playbook de sécurité interne

**7. Évaluation des facteurs relatifs à la vie privée (EFVP)**
- Obligatoire avant de partager des données avec un tiers ou de déployer un système à risque élevé
- Documenter pour Stripe Connect (transfert de données financières)

### 10.3 Taxes québécoises

```php
class TaxService
{
    const TPS_RATE = 0.05;     // 5% - Taxe fédérale
    const TVQ_RATE = 0.09975;  // 9.975% - Taxe provinciale Québec

    public function calculate(float $subtotal, string $province = 'QC'): array
    {
        $tps = round($subtotal * self::TPS_RATE, 2);
        $tvq = $province === 'QC' ? round($subtotal * self::TVQ_RATE, 2) : 0;

        return [
            'subtotal' => $subtotal,
            'tps'      => $tps,
            'tvq'      => $tvq,
            'total'    => $subtotal + $tps + $tvq,
        ];
    }
}
```

---

## 20. Déploiement - Railway

### 11.1 Architecture Railway

```
Railway Project : horizon-local
├── Service : api (Laravel)
│   ├── Source : GitHub repo /api
│   ├── Build : Dockerfile ou Nixpacks (PHP 8.3)
│   ├── Variables d'env : APP_KEY, DB_*, STRIPE_*, MAIL_*
│   └── Domaine : api.horizonlocal.ca
│
├── Service : frontend (Next.js)
│   ├── Source : GitHub repo /frontend
│   ├── Build : Nixpacks (Node 20)
│   ├── Variables d'env : NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_KEY
│   └── Domaine : horizonlocal.ca
│
├── Service : PostgreSQL (Railway Plugin)
│   ├── Version : PostgreSQL 16
│   └── Variable auto : DATABASE_URL
│
└── Service : Redis (Railway Plugin)
    ├── Version : Redis 7
    └── Variable auto : REDIS_URL
```

### 11.2 Variables d'environnement

**Laravel (api) :**
```env
APP_NAME="Horizon Local"
APP_ENV=production
APP_KEY=base64:...
APP_URL=https://api.horizonlocal.ca
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr

DB_CONNECTION=pgsql
DATABASE_URL=${RAILWAY_DATABASE_URL}

REDIS_URL=${RAILWAY_REDIS_URL}
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

MAIL_MAILER=resend
RESEND_API_KEY=re_...
MAIL_FROM_ADDRESS=noreply@horizonlocal.ca
MAIL_FROM_NAME="Horizon Local"

FRONTEND_URL=https://horizonlocal.ca
```

**Next.js (frontend) :**
```env
NEXT_PUBLIC_API_URL=https://api.horizonlocal.ca
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_NAME="Horizon Local"
```

### 11.3 Pipeline CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  test-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Laravel Tests
        run: |
          cd api
          composer install
          php artisan test --coverage --min=80

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Next.js Tests
        run: |
          cd frontend
          npm ci
          npm run type-check
          npm run test

  deploy:
    needs: [test-api, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        uses: railway/cli-action@v2
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

### 11.4 Stratégie de déploiement

- **Blue-Green Deployment** via Railway (zéro downtime)
- **Migrations DB** exécutées avant le déploiement (`php artisan migrate --force`)
- **Rollback** : Railway conserve les 5 derniers déploiements
- **Health check** : endpoint `/api/health` vérifié par Railway avant de basculer le trafic

```php
// HealthController.php
public function check(): JsonResponse
{
    return response()->json([
        'status'   => 'ok',
        'database' => DB::connection()->getPdo() ? 'ok' : 'error',
        'redis'    => Redis::ping() ? 'ok' : 'error',
        'version'  => config('app.version'),
    ]);
}
```

---

## 21. Décisions architecturales (ADR)

### ADR-001 : Next.js App Router plutôt que Pages Router

**Contexte :** Next.js 14 propose deux routeurs. Le Pages Router est l'ancien standard; l'App Router est le nouveau standard avec Server Components.

**Décision :** App Router.

**Justification :** Les Server Components permettent de récupérer les données côté serveur sans exposer l'API au client, réduisant la surface d'attaque. Meilleur support du streaming et des layouts imbriqués. C'est le standard recommandé pour les nouveaux projets.

---

### ADR-002 : Laravel Sanctum plutôt que JWT (tymon/jwt-auth)

**Contexte :** Deux approches populaires pour l'auth API Laravel.

**Décision :** Laravel Sanctum.

**Justification :** Sanctum est officiel et maintenu par l'équipe Laravel. Support natif des SPAs avec cookies HttpOnly (plus sécurisé que localStorage). Gestion des tokens API pour le mobile Phase 2. Moins de surface de bug que JWT tiers.

---

### ADR-003 : Stripe Connect Express plutôt que Custom

**Contexte :** Stripe Connect propose deux modes : Express (onboarding géré par Stripe) et Custom (onboarding entièrement custom).

**Décision :** Stripe Connect Express.

**Justification :** Stripe gère l'onboarding KYC des vendeurs (vérification d'identité, informations bancaires). Réduit drastiquement la responsabilité légale et de développement. Les vendeurs québécois peuvent s'inscrire en quelques minutes.

---

### ADR-004 : PostgreSQL plutôt que MySQL

**Contexte :** Les deux sont supportés par Laravel. Railway propose les deux.

**Décision :** PostgreSQL.

**Justification :** Transactions ACID plus robustes pour les paiements. Types JSONB natifs pour les variantes de produits. Meilleur planificateur de requêtes. Pas de limitations de longueur d'index sur les clés composites.

---

### ADR-005 : Meilisearch plutôt qu'Elasticsearch

**Contexte :** La recherche produits doit être rapide et pertinente avec support du français.

**Décision :** Meilisearch via Laravel Scout.

**Justification :** Meilisearch est plus léger et plus simple à déployer qu'Elasticsearch. Support natif de la typo-tolérance et du français. Railway propose Meilisearch comme plugin. Intégration transparente avec Laravel Scout.

---

## 22. Feuille de route

### Phase 1 - MVP (semaines 1-12)

**Semaines 1-2 : Infrastructure et base**
- Initialisation repos GitHub (monorepo : /api, /frontend)
- Configuration Railway (services, variables d'env, domaines)
- Migrations PostgreSQL (schéma complet sections 7, 8, 10, 11)
- Auth Laravel Sanctum (register, login, rôles)
- Layout Next.js (Header, Footer, Sidebar - réplique exacte)

**Semaines 3-4 : Catalogue et variantes**
- CRUD catégories (admin)
- CRUD produits avec cycle d'états (draft - pending_review - published)
- Système de variantes avancées (attribute_types, attribute_values, variants)
- Générateur automatique de combinaisons (dashboard vendeur)
- Upload et traitement images (WebP, thumbnails)
- Pages catalogue et fiche produit (SSR/ISR)
- Recherche Meilisearch

**Semaines 5-6 : Vendeurs et import**
- Inscription et onboarding vendeur
- Dashboard vendeur complet (produits, commandes, revenus)
- Import CSV avec traitement asynchrone et rapport email
- Template CSV téléchargeable
- Pages boutique individuelle (ex: /stores/colorantic)
- Gestion des zones de livraison par vendeur
- Approbation admin

**Semaines 7-8 : Panier, paiement et livraison**
- Panier (guest + utilisateur authentifié)
- Calcul des frais de livraison par vendeur/zone/province
- Calcul TPS + TVQ
- Wishlist et comparateur
- Checkout Stripe (Payment Intents)
- Gestion des commissions (Stripe Connect transfers)
- Saisie numéro de tracking par vendeur
- Liens de suivi par transporteur

**Semaines 9-10 : Emails et cycle de commande**
- Système complet d'emails transactionnels (12 templates fr-CA)
- Observers Laravel pour déclenchement automatique
- Cycle de vie complet des commandes (tous les états)
- Historique des changements d'état (audit trail)
- Notifications vendeur (nouvelles commandes, annulations)
- Email de rapport import CSV

**Semaines 11-12 : Admin, finitions et déploiement**
- Dashboard admin complet (vendeurs, produits, commandes, commissions)
- Blog (CMS simple)
- Conformité Loi 25 (bannière cookies, politique, endpoints privacy)
- Tests end-to-end Playwright (flux achat, flux vendeur, flux admin)
- Lighthouse CI (score > 90)
- Déploiement production Railway

### Phase 2 - Application mobile + améliorations (à planifier)
- Application React Native (API déjà mobile-ready)
- Intégration API transporteurs via Shippo (tracking automatique)
- Notifications push (commandes, promotions, livraison)
- Système de promotions et codes promo
- Programme de fidélité

---

### ADR-006 : Import CSV via Job asynchrone plutôt que traitement synchrone

**Contexte :** L'import CSV peut contenir des milliers de lignes. Un traitement synchrone dépasserait le timeout HTTP (30s).

**Décision :** Job Laravel dispatché sur la queue Redis, avec suivi de progression via Redis et rapport final par email.

**Justification :** Le vendeur n'est pas bloqué pendant l'import. Il peut continuer à utiliser son dashboard. Il reçoit un rapport détaillé à la fin avec les erreurs ligne par ligne.

---

### ADR-007 : Frais de livraison configurés par vendeur (Phase 1) plutôt qu'API transporteur

**Contexte :** Les API Canada Post, Purolator, UPS nécessitent des comptes marchands et une intégration complexe. Les vendeurs artisanaux ont souvent des arrangements fixes.

**Décision :** Phase 1 - frais fixes par zone configurés par le vendeur. Phase 2 - intégration API transporteur via Shippo.

**Justification :** Réduit la complexité du MVP. Couvre 90% des cas réels. Shippo sera branché sans changer le schéma de données (on ajoute juste le calcul dynamique).

---
