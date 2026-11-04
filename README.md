# Bureau-Eguette — gestion intelligente de restaurant 🇸🇳

> Prise de commande, suivi de cuisine et analyse des ventes pour les restaurants dakarois, en temps réel.

## 📋 Fonctionnalités

- ✅ Prise de commande en salle (tablette/mobile)
- ✅ Suivi de cuisine en temps réel
- ✅ Analyse des ventes et des plats les plus rentables
- ✅ Gestion des annulations et recommandations

## 🛠️ Stack

React · TypeScript · Vite · Bun · Supabase (Edge Functions, RLS) · Node (`server.ts`)

## 🚀 Installation

```bash
git clone https://github.com/Daoudasamb29/Bureau-Eguette.git
cd Bureau-Eguette
bun install
cp .env.example .env
bun run dev
```

## 🔒 Sécurité

- Row Level Security (RLS) Supabase : chaque restaurant ne voit que ses données
- `.env.example` documenté, aucun secret versionné

## 👤 Auteur

**Papa Daouda Samb** — devosamb@gmail.com · [Portfolio](https://daoudasamb29.github.io/Portfolio/)
