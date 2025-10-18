#!/usr/bin/env python3
"""
🔧 Script de correction pour le fichier avec nom trop long
============================================================

Ce script :
1. Se connecte à l'API GitHub
2. Trouve le fichier avec le nom trop long dans content/albums/
3. Lit son contenu
4. Crée les photos individuelles dans content/portfolio/
5. Supprime le fichier problématique

Usage:
    python fix-long-filename.py
"""

import requests
import base64
import json
from datetime import datetime
import os

# Configuration
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')  # Tu devras mettre ton token
GITHUB_OWNER = input("Nom du propriétaire GitHub (ex: ton-username) : ")
GITHUB_REPO = input("Nom du repository (ex: Code-Site-webmaximeV2) : ")

if not GITHUB_TOKEN:
    print("\n⚠️  GITHUB_TOKEN non trouvé dans les variables d'environnement")
    print("Pour utiliser ce script automatiquement, définis GITHUB_TOKEN")
    print("\nPour créer un token :")
    print("1. Va sur https://github.com/settings/tokens")
    print("2. Generate new token (classic)")
    print("3. Sélectionne 'repo' scope")
    print("4. Copie le token")
    print("\nPuis dans PowerShell :")
    print("$env:GITHUB_TOKEN='ton_token_ici'")
    print("\n")
    GITHUB_TOKEN = input("Ou colle ton token maintenant : ")

headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

def get_albums_files():
    """Récupère la liste des fichiers dans content/albums/"""
    url = f'https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/content/albums'
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la récupération des albums : {e}")
        return []

def get_file_content(file_path):
    """Récupère le contenu d'un fichier GitHub"""
    url = f'https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/{file_path}'
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        file_data = response.json()
        
        # Le contenu est encodé en base64
        content = base64.b64decode(file_data['content']).decode('utf-8')
        return content, file_data['sha']
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la lecture du fichier : {e}")
        return None, None

def parse_frontmatter(content):
    """Parse le frontmatter YAML"""
    import yaml
    
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            return yaml.safe_load(parts[1])
    return None

def create_portfolio_entry(image_url, title, category, album, date):
    """Crée une entrée portfolio sur GitHub"""
    slug = title.lower().replace(' ', '-').replace("'", '')
    timestamp = int(datetime.now().timestamp() * 1000)
    filename = f"{slug}-{timestamp}.md"
    
    content = f"""---
image: {image_url}
title: {title}
category: {category}
album: {album}
date: {date}
---
"""
    
    url = f'https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/content/portfolio/{filename}'
    
    data = {
        'message': f'Ajout photo: {title}',
        'content': base64.b64encode(content.encode()).decode()
    }
    
    try:
        response = requests.put(url, headers=headers, json=data)
        response.raise_for_status()
        return filename
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la création de {filename} : {e}")
        return None

def delete_file(file_path, sha):
    """Supprime un fichier sur GitHub"""
    url = f'https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/{file_path}'
    
    data = {
        'message': f'Suppression fichier problématique: {file_path}',
        'sha': sha
    }
    
    try:
        response = requests.delete(url, headers=headers, json=data)
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la suppression : {e}")
        return False

def main():
    print("=" * 60)
    print("🔧 Correction du fichier avec nom trop long")
    print("=" * 60)
    
    # Récupérer les albums
    print("\n🔍 Recherche des albums...")
    albums = get_albums_files()
    
    if not albums:
        print("⚠️  Aucun album trouvé")
        return
    
    print(f"✅ {len(albums)} fichier(s) trouvé(s)\n")
    
    # Traiter chaque album
    for album_file in albums:
        file_path = album_file['path']
        file_name = album_file['name']
        
        print(f"📂 Traitement : {file_name[:50]}...")
        
        # Lire le contenu
        content, sha = get_file_content(file_path)
        if not content:
            continue
        
        # Parser le frontmatter
        data = parse_frontmatter(content)
        if not data:
            print(f"  ⚠️  Impossible de parser le frontmatter")
            continue
        
        album_name = data.get('albumName', 'Album')
        category = data.get('category', 'Portrait')
        base_title = data.get('baseTitle', 'Photo')
        images = data.get('images', [])
        date = data.get('date', datetime.now().isoformat())
        
        print(f"  📦 Album : {album_name}")
        print(f"  📂 Catégorie : {category}")
        print(f"  📸 {len(images)} photos")
        
        # Créer les entrées portfolio
        created = 0
        for index, image_url in enumerate(images, 1):
            photo_title = f"{base_title} {index}"
            filename = create_portfolio_entry(image_url, photo_title, category, album_name, date)
            if filename:
                print(f"  ✅ {index}/{len(images)} - {photo_title}")
                created += 1
            else:
                print(f"  ❌ {index}/{len(images)} - Échec")
        
        print(f"  📊 {created}/{len(images)} photos créées")
        
        # Supprimer le fichier album
        print(f"  🗑️  Suppression du fichier album...")
        if delete_file(file_path, sha):
            print(f"  ✅ Fichier supprimé")
        else:
            print(f"  ⚠️  Échec de la suppression")
        
        print()
    
    print("=" * 60)
    print("✅ Traitement terminé !")
    print("=" * 60)
    print("\n📝 Prochaines étapes :")
    print("1. git pull (devrait fonctionner maintenant)")
    print("2. git push origin main (pour envoyer les changements de config)")
    print("3. Vérifier le site web")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Script interrompu")
    except Exception as e:
        print(f"\n❌ Erreur : {e}")
        import traceback
        traceback.print_exc()


