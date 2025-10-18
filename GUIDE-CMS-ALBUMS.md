# 📸 Guide : Créer des Albums Rapidement dans Decap CMS

## 🎯 Nouveau Système d'Albums par Dossiers

Ton CMS est maintenant organisé par **catégories séparées** avec **création automatique de dossiers par album** !

---

## 📂 Structure des Collections

Dans ton CMS, tu verras maintenant **6 collections séparées** :

```
CMS Interface:
├─ 📸 Portraits
├─ 💍 Mariages
├─ 🏠 Immobilier
├─ 🌄 Paysages
├─ 🔬 Macro
└─ ✨ Lifestyle
```

Chaque collection crée automatiquement des **sous-dossiers par album** !

---

## ⚡ Workflow Ultra-Rapide pour 20 Photos

### **Exemple : Ajouter 20 photos d'un Mariage "Sophie & Marc"**

#### **1️⃣ Première Photo :**
1. Clique sur **"💍 Mariages"** dans le CMS
2. Clique sur **"New Mariage"**
3. Remplis :
   - **Image** : Upload `photo1.jpg`
   - **Titre** : `Sophie & Marc 1`
   - **Album** : `Sophie & Marc` ⚠️ **IMPORTANT : Mémorise ce nom exact !**
   - **Date** : (rempli automatiquement)
4. Clique sur **"Publish"**

✅ **Le CMS crée automatiquement :**
```
content/portfolio/mariage/sophie-marc/sophie-marc-1.md
static/img/mariage/sophie-marc/photo1.jpg
```

---

#### **2️⃣ Photos 2 à 20 (Copier-Coller FTW !) :**
1. Clique sur **"New Mariage"**
2. Remplis :
   - **Image** : Upload `photo2.jpg`
   - **Titre** : `Sophie & Marc 2` (juste changer le numéro)
   - **Album** : `Sophie & Marc` ⚠️ **COPIE-COLLE exactement le même nom !**
   - **Date** : (rempli automatiquement)
3. Clique sur **"Publish"**

**Répète pour les photos 3, 4, 5... jusqu'à 20 !**

---

### **🔥 Astuce Pro : Copier-Coller le Nom d'Album**

Pour éviter les fautes de frappe :
1. **Première photo** : Tape `Sophie & Marc` dans le champ Album
2. **Sélectionne et copie** ce texte (`Ctrl+C`)
3. **Photos suivantes** : Colle (`Ctrl+V`) directement dans le champ Album

✅ **Si le nom est EXACTEMENT le même, les photos seront groupées !**

---

## 📊 Résultat Final

Après avoir ajouté 20 photos avec l'album `Sophie & Marc` :

### **Dans le CMS :**
```
💍 Mariages
├─ Sophie & Marc 1
├─ Sophie & Marc 2
├─ Sophie & Marc 3
└─ ... (20 entrées)
```

### **Sur GitHub :**
```
content/portfolio/mariage/sophie-marc/
├─ sophie-marc-1.md
├─ sophie-marc-2.md
├─ sophie-marc-3.md
└─ ... (20 fichiers)

static/img/mariage/sophie-marc/
├─ photo1.jpg
├─ photo2.jpg
├─ photo3.jpg
└─ ... (20 images)
```

### **Sur Ton Site :**
```
Section "Mariage"
└─ [Carte Album : Sophie & Marc]
    ├─ Photo de couverture : photo1.jpg
    └─ Badge : "20 photos"
    
    (Clic sur la carte)
    ↓
    Carrousel avec les 20 photos
```

---

## 🎨 Exemples pour Chaque Catégorie

### **📸 Portraits : "Portrait Marie"**
1. Collection : **📸 Portraits**
2. Titre : `Portrait Marie 1`, `Portrait Marie 2`, ...
3. Album : `Portrait Marie` (même nom pour toutes)

### **💍 Mariages : "Sophie & Marc"**
1. Collection : **💍 Mariages**
2. Titre : `Sophie & Marc 1`, `Sophie & Marc 2`, ...
3. Album : `Sophie & Marc` (même nom pour toutes)

### **🏠 Immobilier : "Villa Bordeaux"**
1. Collection : **🏠 Immobilier**
2. Titre : `Villa Bordeaux 1`, `Villa Bordeaux 2`, ...
3. Album : `Villa Bordeaux` (même nom pour toutes)

### **🌄 Paysages : "Bretagne Août 2024"**
1. Collection : **🌄 Paysages**
2. Titre : `Bretagne 1`, `Bretagne 2`, ...
3. Album : `Bretagne Août 2024` (même nom pour toutes)

### **🔬 Macro : "Insectes"**
1. Collection : **🔬 Macro**
2. Titre : `Insectes 1`, `Insectes 2`, ...
3. Album : `Insectes` (même nom pour toutes)

### **✨ Lifestyle : "Urban Style"**
1. Collection : **✨ Lifestyle**
2. Titre : `Urban Style 1`, `Urban Style 2`, ...
3. Album : `Urban Style` (même nom pour toutes)

---

## ⚠️ Points Importants

### **1. Le nom d'album doit être EXACTEMENT le même**
- ✅ `Sophie & Marc` (toutes les photos)
- ❌ `Sophie & Marc` puis `Sophie et Marc` → 2 albums différents !
- ❌ `Sophie & Marc` puis `sophie & marc` → 2 albums différents !

### **2. Les accents et caractères spéciaux**
- ✅ `Château de Versailles` → OK
- ✅ `Sophie & Marc` → OK
- ✅ `Portrait d'Émilie` → OK
- ❌ Évite les symboles : `/ \ : * ? " < > |`

### **3. Ordre d'affichage**
Les photos dans l'album sont triées par **date** (de la plus récente à la plus ancienne).
Le CMS incrémente automatiquement la date de quelques secondes pour chaque photo.

---

## 🔄 Compatibilité avec les Anciennes Photos

**Bonne nouvelle !** Le système est **rétrocompatible** :
- ✅ Tes anciennes photos dans `content/portfolio/` fonctionnent toujours
- ✅ Elles s'affichent normalement sur ton site
- ✅ Le groupage par album fonctionne toujours

**Tu n'as rien à migrer !** Le nouveau système coexiste avec l'ancien.

---

## 🚀 Temps de Création d'un Album

### **Avant (système unique) :**
```
20 photos × 30 secondes = 10 minutes
(remplir tous les champs à chaque fois)
```

### **Maintenant (système par catégories) :**
```
Photo 1 : 30 secondes (tout remplir)
Photos 2-20 : 15 secondes chacune (copier-coller l'album)
─────────────────────────────────────
Total : 30s + (19 × 15s) = 5 minutes 15 secondes
```

**🎉 Gain de temps : 48% plus rapide !**

---

## 💡 Astuces Pro

### **Astuce 1 : Garde un Bloc-Notes Ouvert**
Quand tu commences un album, note le nom exact :
```
Album actuel : Sophie & Marc
Photo n° : 12 / 20
```

### **Astuce 2 : Upload par Lots**
1. Ouvre 5 onglets du CMS
2. Remplis les 5 en parallèle
3. Publish tous ensemble

### **Astuce 3 : Templates de Titres**
Pour uniformiser :
- Mariages : `[Prénoms] [Numéro]` → `Sophie & Marc 1`
- Portraits : `Portrait [Prénom] [Numéro]` → `Portrait Marie 1`
- Immobilier : `[Type] [Lieu] [Numéro]` → `Villa Bordeaux 1`

### **Astuce 4 : Date Automatique**
Le CMS remplit automatiquement la date actuelle. Tu peux la modifier si besoin pour changer l'ordre d'affichage dans l'album.

---

## 🐛 Problèmes Courants

### **Problème : Mes photos ne se groupent pas**
**Cause** : Le nom d'album n'est pas exactement le même
**Solution** : Vérifie les majuscules, accents, espaces

### **Problème : Je ne vois pas ma nouvelle photo sur le site**
**Cause** : Le déploiement Netlify est en cours
**Solution** : Attends 1-2 minutes, rafraîchis la page (`Ctrl+F5`)

### **Problème : L'image ne s'affiche pas**
**Cause** : Chemin d'image incorrect
**Solution** : Le CMS gère automatiquement les chemins, ne modifie pas le champ "image" manuellement

### **Problème : Erreur "Update is not a fast forward"**
**Cause** : Tu as uploadé 2 photos exactement à la même seconde
**Solution** : Attends 2 secondes entre chaque "Publish"

---

## 📁 Structure Technique (Pour Info)

### **Avant :**
```
content/portfolio/
├─ photo1.md
├─ photo2.md
├─ photo3.md
└─ ... (tout mélangé)
```

### **Maintenant :**
```
content/portfolio/
├─ portrait/
│   ├─ marie/
│   │   ├─ portrait-marie-1.md
│   │   └─ portrait-marie-2.md
│   └─ jean/
│       └─ portrait-jean-1.md
├─ mariage/
│   ├─ sophie-marc/
│   │   ├─ sophie-marc-1.md
│   │   ├─ sophie-marc-2.md
│   │   └─ ... (20 fichiers)
│   └─ laura-thomas/
│       └─ ...
└─ lifestyle/
    └─ ...
```

---

## ✅ Checklist : Ajouter 20 Photos à un Album

- [ ] Choisir la bonne collection (📸 💍 🏠 🌄 🔬 ✨)
- [ ] Créer la **première photo** avec le nom d'album
- [ ] **Copier** le nom d'album exact
- [ ] Pour les photos 2-20 :
  - [ ] Upload image
  - [ ] Changer le numéro dans le titre
  - [ ] **Coller** le nom d'album (ne pas taper à nouveau !)
  - [ ] Publish
  - [ ] Attendre 2 secondes
  - [ ] Répéter
- [ ] Vérifier sur le site après déploiement (1-2 min)

---

## 🎉 Résultat

Tu peux maintenant ajouter **20 photos en moins de 6 minutes** avec une **organisation impeccable** !

**Bon courage pour tes shootings ! 📸✨**

