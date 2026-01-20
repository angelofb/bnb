# Casa del Travertino

Sito web per il B&B "Casa del Travertino" nel centro storico di Ascoli Piceno.

## Caratteristiche

- Design moderno e responsive
- Tailwind CSS ottimizzato (solo classi usate)
- Animazioni on-scroll
- Form contatti con Formspree
- Mappa Google Maps integrata
- Build automatico con ottimizzazione

## Sviluppo locale

### Requisiti

- Node.js 18+

### Setup

```bash
npm install
```

### Comandi

```bash
# Sviluppo - serve i file sorgente
npm run dev

# Build - genera versione ottimizzata in /dist
npm run build

# Preview - serve la versione ottimizzata
npm run preview
```

### Struttura del progetto

```
BnB/
├── src/
│   └── index.html        # Sorgente HTML
├── dist/                  # Output build (generato)
├── .github/
│   └── workflows/
│       └── deploy.yml    # CI/CD GitHub Pages
├── build.js              # Script di ottimizzazione
├── tailwind.config.js    # Configurazione Tailwind
├── package.json
└── README.md
```

## Build e ottimizzazione

Lo script `npm run build` esegue:

1. **Compila Tailwind CSS** - genera solo le classi effettivamente usate
2. **Minifica CSS** - rimuove spazi e commenti
3. **Minifica HTML** - comprime il markup
4. **Minifica JavaScript** - comprime gli script inline
5. **Genera output** - tutto in `./dist/index.html`

Riduzione tipica: **~60-70%** della dimensione originale.

## Pubblicazione su GitHub Pages

Il progetto include una GitHub Action che:
1. Installa le dipendenze
2. Esegue il build
3. Pubblica la cartella `dist/` su GitHub Pages

### Setup

1. Crea un repository su GitHub
2. Pusha il codice:
   ```bash
   git remote add origin https://github.com/TUO-USERNAME/casa-del-travertino.git
   git branch -M main
   git push -u origin main
   ```
3. Vai in **Settings > Pages**
4. In "Source" seleziona **"GitHub Actions"**

Il sito sarà disponibile su:
`https://TUO-USERNAME.github.io/casa-del-travertino/`

## Configurazione Formspree

1. Vai su [formspree.io](https://formspree.io) e crea un account
2. Crea un nuovo form
3. In `src/index.html`, sostituisci `YOUR_FORM_ID` con il tuo ID

## Personalizzazioni

In `src/index.html` modifica:

- **Email**: `info@casadeltravertino.it`
- **Telefono**: `+39 333 123 4567`
- **CIR**: `[Codice Identificativo Regionale]`
- **Link Airbnb/Booking**: cerca `href="#"` e inserisci i tuoi URL
- **Immagini**: sostituisci i `placekitten.com` con le tue foto in `src/images/`

## Tecnologie

- HTML5
- Tailwind CSS
- PostCSS + Autoprefixer
- html-minifier-terser
- clean-css
- GitHub Actions
