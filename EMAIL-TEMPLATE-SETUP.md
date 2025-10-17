# Configuration du Template d'Email Personnalisé

## ✅ Template créé

Le fichier `_emails/contact.html` a été créé avec la structure demandée :

### **📧 Structure de l'email :**

```
📸 Nouveau message de contact
Monsieur Crocodeal - Photographe

Nom du client : Jean Dupont
Email du client : jean.dupont@exemple.fr  
Téléphone du client : 06 12 34 56 78

Message :
Description du projet...
```

## 🚀 Configuration dans Netlify

### **1. Déployer le template**
```bash
git add _emails/contact.html
git commit -m "Ajout template email personnalisé"
git push
```

### **2. Configurer dans Netlify Dashboard**

1. **Va sur Netlify Dashboard** → Ton site
2. **Forms** → **Form notifications**
3. **Clique sur "Add notification"** (ou "Edit" si déjà configuré)
4. **Sélectionne "Email notification"**
5. **Configure :**
   - **Event to notify** : New form submission
   - **Form** : contact
   - **Email to notify** : `maxvir3@hotmail.fr`
   - **Template** : `_emails/contact.html`
6. **Sauvegarde**

### **3. Variables disponibles dans le template**

Le template utilise ces variables Netlify :
- `{{name}}` - Nom du client
- `{{email}}` - Email du client  
- `{{phone}}` - Téléphone du client
- `{{message}}` - Message du client
- `{{date}}` - Date de réception
- `{{form_name}}` - Nom du formulaire (contact)

## 🎨 Design du template

### **Caractéristiques :**
✅ **Header** : Gradient bleu avec titre et sous-titre
✅ **Structure claire** : Chaque info dans sa section
✅ **Design responsive** : S'adapte aux mobiles
✅ **Couleurs cohérentes** : Bleu #4A90E2 (couleur du site)
✅ **Typographie** : Segoe UI, lisible
✅ **Footer** : Informations de contact

### **Sections :**
1. **Header** : Titre et branding
2. **Informations client** : Nom, email, téléphone
3. **Message** : Contenu du message dans une boîte
4. **Footer** : Date, site, signature

## 📱 Aperçu de l'email

L'email aura cet aspect :

```
┌─────────────────────────────────────┐
│  📸 Nouveau message de contact      │
│  Monsieur Crocodeal - Photographe   │
├─────────────────────────────────────┤
│                                     │
│  Nom du client                      │
│  Jean Dupont                        │
│                                     │
│  Email du client                    │
│  jean.dupont@exemple.fr             │
│                                     │
│  Téléphone du client                │
│  06 12 34 56 78                     │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ Message                         │ │
│  │ Description du projet...        │ │
│  └─────────────────────────────────┘ │
│                                     │
│  📅 Reçu le : 17/10/2025 14:30     │
│  🌐 Site : photographemonsieur...  │
│  Monsieur Crocodeal - Photographe   │
└─────────────────────────────────────┘
```

## 🔧 Personnalisation

### **Modifier les couleurs :**
Dans `_emails/contact.html`, change :
```css
background: linear-gradient(135deg, #4A90E2, #357ABD);
color: #4A90E2;
```

### **Modifier le texte :**
```html
<h1>📸 Nouveau message de contact</h1>
<p>Monsieur Crocodeal - Photographe</p>
```

### **Ajouter des champs :**
Si tu ajoutes des champs au formulaire, ajoute-les dans le template :
```html
<div class="info-item">
    <div class="label">Nouveau champ</div>
    <div class="value">{{nouveau_champ}}</div>
</div>
```

## ✅ Test

### **1. Déploie le template**
### **2. Envoie un message de test**
### **3. Vérifie l'email reçu**

L'email devrait maintenant avoir :
- ✅ **Design professionnel**
- ✅ **Structure claire** 
- ✅ **Informations bien organisées**
- ✅ **Couleurs cohérentes**

## 🎯 Résumé

✅ **Template créé** : `_emails/contact.html`
✅ **Structure** : Exactement comme demandé
✅ **Design** : Professionnel et cohérent
🔄 **Configuration** : À faire dans Netlify Dashboard
🔄 **Test** : À faire après déploiement

**Déploie et configure dans Netlify Dashboard !** 🚀
