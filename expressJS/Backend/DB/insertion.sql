USE furrylanddb;

INSERT INTO categories (name) VALUES ('Masques');
INSERT INTO categories (name) VALUES ('Costumes');

INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES
(1, 'Kemono Chat Gris', 'Masque kemono style anime, fourrure grise avec oreilles roses et yeux oranges brillants. Finition artisanale haut de gamme.', 320.00, 3, 'img/img1.20msq1.3.webp'),
(1, 'Kemono Renard Doré', 'Masque kemono renard en fourrure beige dorée, grandes oreilles blanches et yeux dorés expressifs. Inclut un collier chaîne.', 290.00, 4, 'img/img2.20msq1.3.webp'),
(1, 'Tête Fursuit Renard Sauvage', 'Tête fursuit style western, renard orange vif avec taches blanches et noires. Crinière noire pailletée, bouche ouverte avec langue.', 480.00, 2, 'img/img3.20msq1.3.webp'),
(1, 'Tête Fursuit Loup Aquatique', 'Tête fursuit loup en dégradé bleu turquoise avec cornes blanches et fleurs décoratives. Yeux bleus translucides et moustaches blanches.', 520.00, 2, 'img/img4.20msq1.3.webp'),
(1, 'Base Fursuit Canin Blanc', 'Base fursuit en résine blanche imprimée en 3D, style canin minimaliste. Idéale pour personnalisation. Légère et ventilée.', 150.00, 8, 'img/img5.20msq1.3.webp'),
(1, 'Kemono Félin Solaire', 'Masque kemono félin avec chevelure jaune et verte, grands yeux bleus en forme de coeur. Style coloré et expressif.', 350.00, 3, 'img/img6.20msq1.3.webp'),
(1, 'Tête Lapin Rose', 'Tête fursuit lapin rose bonbon avec grandes oreilles blanches et yeux violets. Livré avec les pattes assorties.', 440.00, 3, 'img/img7.20msq1.3.webp'),
(1, 'Kemono Lapin Fraise', 'Masque kemono lapin thème fraise, fourrure rouge et blanche avec feuilles vertes. Livré avec les pattes assorties à coeurs rouges.', 410.00, 2, 'img/img8.20msq1.3.webp'),
(1, 'Kemono Lapin Zèbre', 'Masque kemono lapin gris rayé noir, grandes oreilles tombantes rose chair. Yeux rouge rubis et expression souriante.', 370.00, 4, 'img/img9.20msq1.3.webp'),
(1, 'Set Loup Arctique', 'Set complet tête de loup noir et bleu turquoise avec pattes et queue assortis. Yeux orange flamboyants, style prédateur élégant.', 650.00, 2, 'img/img10.20msq1.3.webp');

INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES
(2, 'Set Partiel Crâne Félin', 'Set partiel unique avec crâne de félin doré sculpté à la main, oreilles en fourrure rose/marron et pattes rayées noir et blanc.', 580.00, 1, 'img/img11.20cst1.3.webp'),
(2, 'Costume Complet Démon Jaune', 'Costume complet fursuit chat démoniaque jaune et noir avec petites ailes de chauve-souris. Yeux percants et design agressif.', 1850.00, 1, 'img/img12.20cst1.3.webp'),
(2, 'Costume Complet Dragon Arctique', 'Costume complet dragon en bleu glacier et noir avec grandes ailes et cornes. Design intense et impressionnant, finition premium.', 2400.00, 1, 'img/img13.20cst1.3.webp'),
(2, 'Costume Complet Félin Émeraude', 'Costume complet chat gris moucheté avec accents vert fluo et queue volumineuse. Motifs géométriques dans le dos.', 1950.00, 1, 'img/img14.20cst1.3.webp'),
(2, 'Costume Complet Lynx Bleu', 'Costume complet lynx en fourrure beige rosée avec taches bleues électrique. Design épuré et moderne, très confortable.', 1700.00, 1, 'img/img15.20cst1.3.webp'),
(2, 'Costume Cyber Monstre Néon', 'Costume partiel cyber-monstre vert fluo avec masque LED programmable. Inclut les pattes griffues. Effet visuel saisissant en convention.', 890.00, 2, 'img/img16.20cst1.3.webp'),
(2, 'Tête Renard Polaire', 'Tête fursuit renard polaire entièrement blanche avec yeux violets doux. Fourrure ultra douce, expression mélancolique et élégante.', 520.00, 3, 'img/img17.20cst1.3.webp'),
(2, 'Costume Complet Panthère Cosmique', 'Costume complet panthère gris anthracite avec taches violettes et turquoise. Yeux violets lumineux, design cosmique et mystérieux.', 2100.00, 1, 'img/img18.20cst1.3.webp'),
(2, 'Costume Complet Dragon Infernal', 'Costume complet dragon noir et rose corail avec ailes de démon. Motifs tribaux sur tout le corps, design agressif et spectaculaire.', 2600.00, 1, 'img/img19.20cst1.3.webp'),
(2, 'Set Partiel Renard Forêt', 'Set partiel renard vert forêt avec accessoires mignons (chapeau chocolat, collier étoile). Pattes roses incluses. Style kawaii unique.', 720.00, 2, 'img/img20.20cst1.3.webp');
