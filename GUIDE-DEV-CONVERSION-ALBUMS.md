# 🛠️ Guide Développeur : Conversion d'Albums

**Pour : Développeur (toi)**  
**Mis à jour : Octobre 2025**

---

## 🎯 Vue d'ensemble

Ton client peut maintenant créer des albums avec plusieurs photos dans le CMS. Ces albums sont sauvegardés dans `content/albums/`. Pour qu'ils apparaissent sur le site, tu dois les convertir en entrées individuelles dans `content/portfolio/`.

---

## 📁 Structure des fichiers

```
content/
├── albums/              ← Albums créés par le client (temporaires)
│   ├── mariage-sophie-marc.md
│   └── portrait-marie.md
│
└── portfolio/           ← Photos individuelles (permanentes)
    ├── mariage-sophie-1.md
    ├── mariage-sophie-2.md
    └── ...
```

---

## 🚀 Méthode 1 : Script Python Automatique (RECOMMANDÉ)

### **Prérequis**

```bash
pip install pyyaml
```

### **Utilisation**

```bash
# Dans le dossier racine du projet
python convert-albums.py
```

### **Ce que le script fait**

1. ✅ Lit tous les fichiers dans `content/albums/`
2. ✅ Pour chaque album, crée N fichiers dans `content/portfolio/`
3. ✅ Génère des titres numérotés : "Mariage Sophie 1", "Mariage Sophie 2", etc.
4. ✅ Préserve toutes les métadonnées (catégorie, album, date)

### **Sortie du script**

```
============================================================
📦 Conversion d'Albums en Photos Individuelles
============================================================

🔍 2 album(s) trouvé(s)

📂 Traitement de : mariage-sophie-marc.md
  📦 Album : Mariage Sophie & Marc
  📂 Catégorie : Mariage
  📝 Titre de base : Mariage Sophie
  📸 23 photos trouvées
  ✅ 1/23 - Mariage Sophie 1 → mariage-sophie-1-1729234567890.md
  ✅ 2/23 - Mariage Sophie 2 → mariage-sophie-2-1729234567891.md
  ...
  ✅ 23/23 - Mariage Sophie 23 → mariage-sophie-23-1729234567912.md

📂 Traitement de : portrait-marie.md
  📦 Album : Portrait Marie
  📂 Catégorie : Portrait
  📝 Titre de base : Portrait Marie
  📸 15 photos trouvées
  ✅ 1/15 - Portrait Marie 1 → portrait-marie-1-1729234567920.md
  ...

============================================================
✅ Conversion terminée !
📊 38 photos créées au total
============================================================

📝 Prochaines étapes :
1. Vérifiez les fichiers dans content/portfolio/
2. git add .
3. git commit -m 'Conversion albums en photos'
4. git push

💡 Vous pouvez maintenant supprimer les fichiers dans content/albums/
```

### **Après la conversion**

```bash
git add .
git commit -m "Conversion album Mariage Sophie & Marc"
git push
```

---

## 🔧 Méthode 2 : Conversion manuelle (si le script ne marche pas)

### **Étape 1 : Ouvrir le fichier album**

```bash
content/albums/mariage-sophie-marc.md
```

Contenu :
```yaml
---
albumName: Mariage Sophie & Marc
category: Mariage
baseTitle: Mariage Sophie
images:
  - /static/img/photo1.jpg
  - /static/img/photo2.jpg
  - /static/img/photo3.jpg
date: 2025-10-18T14:30:00.000Z
---
```

### **Étape 2 : Créer les fichiers individuels**

Pour chaque image, créer un fichier dans `content/portfolio/` :

```bash
# content/portfolio/mariage-sophie-1.md
---
image: /static/img/photo1.jpg
title: Mariage Sophie 1
category: Mariage
album: Mariage Sophie & Marc
date: 2025-10-18T14:30:00.000Z
---
```

```bash
# content/portfolio/mariage-sophie-2.md
---
image: /static/img/photo2.jpg
title: Mariage Sophie 2
category: Mariage
album: Mariage Sophie & Marc
date: 2025-10-18T14:30:00.000Z
---
```

Etc.

### **Étape 3 : Supprimer l'album temporaire**

```bash
rm content/albums/mariage-sophie-marc.md
```

---

## 🔄 Workflow complet

```
CLIENT                    TOI (DEV)                 SITE WEB
  │                          │                         │
  │ 1. Upload album          │                         │
  │    (23 photos)           │                         │
  │───────────────────────>  │                         │
  │                          │                         │
  │ 2. Message :             │                         │
  │    "Album uploadé !"     │                         │
  │───────────────────────>  │                         │
  │                          │                         │
  │                          │ 3. Lance script         │
  │                          │    python convert...    │
  │                          │                         │
  │                          │ 4. Git commit & push    │
  │                          │─────────────────────>   │
  │                          │                         │
  │                          │                         │ 5. Déploiement
  │                          │                         │    Netlify
  │                          │                         │
  │                          │                         │ 6. Site MAJ
  │ <───────────────────────────────────────────────── │
  │ Album visible en ligne ! │                         │
```

---

## 📊 Exemples de cas d'usage

### **Cas 1 : Mariage avec 30 photos**

Client upload dans le CMS :
- Nom : "Mariage Sophie & Marc"
- Catégorie : Mariage
- Titre : "Mariage Sophie"
- 30 images

Tu lances :
```bash
python convert-albums.py
```

Résultat : 30 fichiers créés :
- `mariage-sophie-1.md` → `mariage-sophie-30.md`

### **Cas 2 : Plusieurs albums en même temps**

Client upload 3 albums :
1. Mariage (20 photos)
2. Portrait Marie (15 photos)
3. Immobilier Villa (12 photos)

Tu lances :
```bash
python convert-albums.py
```

Résultat : 47 fichiers créés au total.

---

## 🐛 Dépannage

### **Problème : Le script ne trouve pas le module yaml**

```bash
pip install pyyaml
```

### **Problème : "No such file or directory: content/albums"**

Le client n'a pas encore créé d'album. Vérifie dans le CMS qu'il y a bien des albums dans la collection "📦 Album Complet".

### **Problème : Les photos n'apparaissent pas sur le site**

1. Vérifie que les fichiers sont bien dans `content/portfolio/`
2. Vérifie que le frontmatter est correct (YAML valide)
3. Clear le cache Netlify et redéploie

### **Problème : Les titres ne sont pas numérotés**

Vérifie que le client a bien rempli le champ "Titre de base" dans le CMS.

---

## 📝 Notes techniques

### **Génération des slugs**

Le script génère des slugs uniques en utilisant :
```python
slug = f"{base_slug}-{timestamp}-{index}"
```

Exemple : `mariage-sophie-1729234567890-1.md`

### **Format de date**

Les dates sont préservées au format ISO 8601 :
```
2025-10-18T14:30:00.000Z
```

### **Images**

Les images sont déjà uploadées dans `static/img/` par Decap CMS. Le script ne copie pas les images, il référence juste leur chemin.

---

## ✅ Checklist après conversion

- [ ] Script exécuté sans erreur
- [ ] Fichiers créés dans `content/portfolio/`
- [ ] Titres correctement numérotés
- [ ] Métadonnées préservées (catégorie, album, date)
- [ ] Git commit et push
- [ ] Vérification sur le site en ligne
- [ ] Message au client : "Album converti et en ligne !"
- [ ] (Optionnel) Supprimer les fichiers dans `content/albums/`

---

## 🚀 Automatisation future (optionnel)

Tu peux automatiser la conversion avec :

### **Option 1 : GitHub Actions**

Créer `.github/workflows/convert-albums.yml` :

```yaml
name: Convert Albums

on:
  push:
    paths:
      - 'content/albums/**'

jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install pyyaml
      - name: Convert albums
        run: python convert-albums.py
      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add content/portfolio/
          git commit -m "Auto-conversion albums" || exit 0
          git push
```

Avec ça, dès que le client upload un album, la conversion se fait automatiquement ! 🎉

### **Option 2 : Netlify Build Hook**

Ajouter la conversion dans le script de build Netlify.

---

## 📞 Support

Si tu as un problème avec le script ou la configuration, vérifie :
1. Les logs du script
2. Les fichiers YAML générés
3. La console de Netlify

---

**Happy coding ! 🚀**


