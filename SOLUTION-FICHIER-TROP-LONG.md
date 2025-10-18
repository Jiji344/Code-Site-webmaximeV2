# 🔧 Solution : Fichier avec nom trop long

## 🐛 Le problème

Tu as cette erreur :
```
error: cannot stat 'content/albums/map-date-2025-10-18t12-45-00-000-02-00-instructions-une-fois-publié-ce-fichier-temporaire-sera-automatiquement-transformé-en-photos-individuelles-dans-votre-portfolio-vous-pouvez-le-supprimer-après-la-publication-images-list-sta.md': Filename too long
```

**Causes :**
1. Le champ "instructions" dans `admin/config.yml` créait un nom de fichier énorme
2. Windows a une limite de 260 caractères pour les noms de fichiers
3. Le fichier est sur GitHub mais ne peut pas être téléchargé sur Windows

**Conséquences :**
- Impossible de faire `git pull`
- L'album n'apparaît pas dans la catégorie Mariage (normal, il faut le convertir)

---

## ✅ Solution (3 étapes simples)

### **Étape 1 : Pusher la correction du config.yml**

J'ai déjà corrigé le fichier `admin/config.yml` pour que ça ne se reproduise plus.

**Dans PowerShell (en tant qu'admin) :**

```powershell
# Activer les longs noms de fichiers sur Windows (pour éviter le problème à l'avenir)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Configurer Git pour supporter les longs noms
git config --global core.longpaths true
```

**Puis dans PowerShell normal :**

```powershell
# Ajouter les changements
git add admin/config.yml

# Commiter
git commit -m "Fix: Correction nom de fichier trop long dans albums"

# Pusher (sans pull d'abord car le fichier problématique bloque)
git push origin main --force-with-lease
```

---

### **Étape 2 : Supprimer le fichier problématique sur GitHub (via l'interface web)**

1. Va sur GitHub.com → Ton repository
2. Navigue vers `content/albums/`
3. Tu verras un fichier avec un nom très long commençant par "map-date..."
4. Clique sur le fichier
5. Clique sur l'icône 🗑️ (poubelle) en haut à droite
6. Commit message : "Suppression fichier album avec nom trop long"
7. Clique sur "Commit changes"

---

### **Étape 3 : Créer manuellement les photos de l'album**

**Option A : Via le CMS (plus simple pour ton client)**

1. Va sur ton-site.com/admin
2. Va dans "Portfolio (1 photo)"
3. Pour chaque photo de l'album :
   - Clique sur "New Portfolio"
   - Upload l'image
   - Titre : "Mariage [Nom] 1", "Mariage [Nom] 2", etc.
   - Catégorie : Mariage
   - Album : Le nom de l'album
   - Date : Date du mariage
   - Publier

**Option B : Via le script Python (plus rapide pour toi)**

Si le fichier avait pu être téléchargé, tu aurais lancé :
```bash
python convert-albums.py
```

Mais comme il est bloqué, utilise plutôt l'Option A ou l'Option C ci-dessous.

**Option C : Via l'API GitHub (script automatique)**

```bash
pip install requests pyyaml
python fix-long-filename.py
```

Le script va :
1. Se connecter à GitHub
2. Lire le fichier album
3. Créer automatiquement toutes les photos individuelles
4. Supprimer le fichier problématique

**Note :** Tu auras besoin d'un token GitHub. Pour le créer :
1. Va sur https://github.com/settings/tokens
2. Generate new token (classic)
3. Sélectionne "repo" scope
4. Copie le token
5. Dans PowerShell : `$env:GITHUB_TOKEN='ton_token_ici'`

---

### **Étape 4 : Vérifier que tout fonctionne**

```powershell
# Pull devrait fonctionner maintenant
git pull

# Les photos devraient apparaître sur le site (après déploiement Netlify)
```

---

## 🎯 Résumé rapide (TL;DR)

```powershell
# 1. Activer longs noms de fichiers (PowerShell admin)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
git config --global core.longpaths true

# 2. Pusher la correction
git add admin/config.yml
git commit -m "Fix: Correction nom de fichier trop long"
git push origin main --force-with-lease

# 3. Supprimer le fichier sur GitHub (via web)
# → github.com → ton repo → content/albums/ → supprimer le fichier

# 4. Créer les photos (option la plus simple)
# → ton-site.com/admin → Portfolio (1 photo) → Ajouter manuellement

# 5. Pull
git pull
```

---

## 🚀 Pour éviter ce problème à l'avenir

✅ J'ai déjà corrigé le `admin/config.yml` :
- Supprimé le champ "instructions" qui créait des noms trop longs
- Changé le slug en `album-{{fields.baseTitle}}` (plus court)

Maintenant, les noms de fichiers albums seront courts :
- Exemple : `album-mariage-sophie.md` ✅
- Au lieu de : `map-date-2025-10-18t12-45-00-000-02-00-instructions-une-fois-publié-ce-fichier-temporaire-sera-automatiquement-transformé-en-photos-individuelles-dans-votre-portfolio-vous-pouvez-le-supprimer-après-la-publication-images-list-sta.md` ❌

---

## 💡 Alternatives si rien ne marche

### **Solution nucléaire (à éviter si possible)**

```powershell
# Sauvegarder tes changements locaux
git stash

# Forcer le reset au dernier commit GitHub
git fetch origin
git reset --hard origin/main

# Récupérer tes changements
git stash pop

# Résoudre les conflits si nécessaire
```

---

## ❓ Questions fréquentes

**Q : Pourquoi l'album n'apparaît pas sur le site ?**  
**R :** Les albums ne sont que des fichiers temporaires. Il faut les convertir en photos individuelles pour qu'elles apparaissent. C'est le rôle du script `convert-albums.py` ou de l'ajout manuel via le CMS.

**Q : Je dois toujours lancer un script après chaque album ?**  
**R :** Oui, pour l'instant. Plus tard, on pourra automatiser avec GitHub Actions pour que ce soit transparent.

**Q : Pourquoi Windows bloque les noms longs ?**  
**R :** C'est une limitation historique de Windows (limite de 260 caractères). On peut la contourner en activant `LongPathsEnabled`.

---

**Bon courage ! 🚀**


