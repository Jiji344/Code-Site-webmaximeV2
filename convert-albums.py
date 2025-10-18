#!/usr/bin/env python3
"""
📦 Script de conversion d'albums en photos individuelles
==========================================================

Ce script lit les albums créés dans content/albums/ et crée automatiquement
des fichiers individuels dans content/portfolio/ pour chaque photo.

Usage:
    python convert-albums.py

Le script :
1. Lit tous les fichiers dans content/albums/
2. Pour chaque album, crée N fichiers dans content/portfolio/
3. Chaque photo obtient un titre numéroté
4. Les fichiers albums peuvent être supprimés après conversion
"""

import os
import re
import yaml
from datetime import datetime
from pathlib import Path

def parse_frontmatter(content):
    """Extrait le frontmatter YAML d'un fichier markdown"""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        frontmatter_str = match.group(1)
        try:
            return yaml.safe_load(frontmatter_str)
        except yaml.YAMLError as e:
            print(f"⚠️  Erreur de parsing YAML : {e}")
            return None
    return None

def create_portfolio_entry(image_url, title, category, album, date, output_dir):
    """Crée un fichier portfolio individuel"""
    # Créer un slug unique
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    timestamp = int(datetime.now().timestamp() * 1000)
    filename = f"{slug}-{timestamp}.md"
    
    # Contenu du fichier
    content = f"""---
image: {image_url}
title: {title}
category: {category}
album: {album}
date: {date}
---
"""
    
    # Écrire le fichier
    output_path = output_dir / filename
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return filename

def process_album(album_path, portfolio_dir):
    """Traite un fichier album et crée les entrées portfolio"""
    print(f"\n📂 Traitement de : {album_path.name}")
    
    # Lire le fichier album
    with open(album_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parser le frontmatter
    data = parse_frontmatter(content)
    if not data:
        print(f"  ❌ Impossible de lire le frontmatter")
        return 0
    
    # Extraire les informations
    album_name = data.get('albumName', 'Album sans nom')
    category = data.get('category', 'Portrait')
    base_title = data.get('baseTitle', 'Photo')
    images = data.get('images', [])
    date = data.get('date', datetime.now().isoformat())
    
    if not images:
        print(f"  ⚠️  Aucune image dans l'album")
        return 0
    
    print(f"  📦 Album : {album_name}")
    print(f"  📂 Catégorie : {category}")
    print(f"  📝 Titre de base : {base_title}")
    print(f"  📸 {len(images)} photos trouvées")
    
    # Créer les entrées portfolio
    created_count = 0
    for index, image_url in enumerate(images, 1):
        photo_title = f"{base_title} {index}"
        
        try:
            filename = create_portfolio_entry(
                image_url,
                photo_title,
                category,
                album_name,
                date,
                portfolio_dir
            )
            print(f"  ✅ {index}/{len(images)} - {photo_title} → {filename}")
            created_count += 1
        except Exception as e:
            print(f"  ❌ Erreur pour la photo {index} : {e}")
    
    return created_count

def main():
    """Fonction principale"""
    print("=" * 60)
    print("📦 Conversion d'Albums en Photos Individuelles")
    print("=" * 60)
    
    # Définir les chemins
    albums_dir = Path("content/albums")
    portfolio_dir = Path("content/portfolio")
    
    # Vérifier que les dossiers existent
    if not albums_dir.exists():
        print(f"\n⚠️  Le dossier {albums_dir} n'existe pas.")
        print("   Aucun album à convertir.")
        return
    
    # Créer le dossier portfolio s'il n'existe pas
    portfolio_dir.mkdir(parents=True, exist_ok=True)
    
    # Trouver tous les fichiers d'albums
    album_files = list(albums_dir.glob("*.md"))
    
    if not album_files:
        print(f"\n⚠️  Aucun fichier album trouvé dans {albums_dir}")
        return
    
    print(f"\n🔍 {len(album_files)} album(s) trouvé(s)\n")
    
    # Traiter chaque album
    total_photos = 0
    for album_file in album_files:
        count = process_album(album_file, portfolio_dir)
        total_photos += count
    
    # Résumé
    print("\n" + "=" * 60)
    print(f"✅ Conversion terminée !")
    print(f"📊 {total_photos} photos créées au total")
    print("=" * 60)
    
    print("\n📝 Prochaines étapes :")
    print("1. Vérifiez les fichiers dans content/portfolio/")
    print("2. git add .")
    print("3. git commit -m 'Conversion albums en photos'")
    print("4. git push")
    print("\n💡 Vous pouvez maintenant supprimer les fichiers dans content/albums/")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Conversion interrompue par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur fatale : {e}")
        import traceback
        traceback.print_exc()

