# ⚡ Quick Start : Albums CMS

## 🎯 En 3 Étapes

### **1️⃣ Ouvre ton CMS**
Va sur : `https://ton-site.netlify.app/admin/`

Tu verras maintenant **6 collections** au lieu d'une :
- 📸 Portraits
- 💍 Mariages  
- 🏠 Immobilier
- 🌄 Paysages
- 🔬 Macro
- ✨ Lifestyle

---

### **2️⃣ Ajoute ta Première Photo**

Exemple pour un mariage :

1. Clique sur **"💍 Mariages"**
2. Clique sur **"New Mariage"**
3. Remplis :
   - **Image** : Upload ta photo
   - **Titre** : `Sophie & Marc 1`
   - **Album** : `Sophie & Marc` ⚠️ **Copie ce texte !**
4. **Publish**

---

### **3️⃣ Ajoute les 19 Autres Photos**

Pour chaque photo :

1. Clique sur **"New Mariage"**
2. Upload l'image
3. **Titre** : Change juste le numéro → `Sophie & Marc 2`, `3`, `4`...
4. **Album** : **Colle (`Ctrl+V`)** le nom exact → `Sophie & Marc`
5. **Publish**
6. ⏱️ Attends 2 secondes
7. Répète !

---

## ✅ C'est Tout !

**Temps total : ~5 minutes pour 20 photos** ⚡

Le CMS crée automatiquement :
```
📁 content/portfolio/mariage/sophie-marc/
   └─ 20 fichiers .md

📁 static/img/mariage/sophie-marc/
   └─ 20 images

🌐 Sur ton site :
   └─ 1 carte album "Sophie & Marc (20 photos)"
```

---

## 💡 Astuce Clé

**LE NOM D'ALBUM DOIT ÊTRE EXACTEMENT LE MÊME !**

✅ Bon :
```
Photo 1 → Album: Sophie & Marc
Photo 2 → Album: Sophie & Marc (copié-collé)
Photo 3 → Album: Sophie & Marc (copié-collé)
```

❌ Mauvais :
```
Photo 1 → Album: Sophie & Marc
Photo 2 → Album: Sophie et Marc  (différent !)
Photo 3 → Album: sophie & marc   (différent !)
```

---

## 📚 Guide Complet

Pour plus de détails, consulte **GUIDE-CMS-ALBUMS.md** 📖

---

**Bonne chance ! 🚀**

