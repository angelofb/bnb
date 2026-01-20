# B&B Centro Storico Ascoli Piceno

Sito web statico per un Bed & Breakfast situato nel centro storico di Ascoli Piceno.

## Caratteristiche

- Design responsive (mobile-first)
- Tailwind CSS via CDN
- Form contatti con Formspree
- Mappa Google Maps integrata
- Nessun backend necessario

## Pubblicazione su GitHub Pages

Il progetto include una GitHub Action che pubblica automaticamente il sito ad ogni push.

### 1. Crea un repository su GitHub

1. Vai su [github.com](https://github.com) e accedi al tuo account
2. Clicca su "New repository"
3. Nome suggerito: `bnb-ascoli-piceno`
4. Seleziona "Public"
5. Clicca "Create repository"

### 2. Carica i file

```bash
git remote add origin https://github.com/TUO-USERNAME/bnb-ascoli-piceno.git
git branch -M main
git push -u origin main
```

### 3. Attiva GitHub Pages

1. Vai nelle impostazioni del repository (Settings)
2. Nella sezione "Pages" (menu laterale)
3. In "Source" seleziona **"GitHub Actions"**
4. Il deploy partira automaticamente ad ogni push

Il sito sara disponibile in pochi minuti all'indirizzo:
`https://TUO-USERNAME.github.io/bnb-ascoli-piceno/`

## Configurazione Formspree (Form Contatti)

Il form di contatto usa [Formspree](https://formspree.io) per inviare email senza backend.

### Setup:

1. Vai su [formspree.io](https://formspree.io) e crea un account gratuito
2. Clicca "New Form"
3. Inserisci l'email dove vuoi ricevere i messaggi
4. Copia l'ID del form (es: `xyzabcde`)
5. Nel file `index.html`, sostituisci `YOUR_FORM_ID` con il tuo ID:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

diventa:

```html
<form action="https://formspree.io/f/xyzabcde" method="POST">
```

Il piano gratuito di Formspree include 50 invii/mese.

## Personalizzazioni da fare

### Informazioni di contatto

Nel file `index.html`, cerca e sostituisci:

- `info@bnbascolipiceno.it` - con la tua email reale
- `+39 333 123 4567` - con il tuo numero di telefono
- `[Inserire Codice Identificativo Regionale]` - con il tuo CIR

### Link piattaforme

Cerca i link a Airbnb e Booking.com e sostituisci `href="#"` con i tuoi link reali.

### Immagini

Le immagini attuali sono placeholder (gatti!). Sostituiscile con foto reali del tuo B&B:

1. Crea una cartella `images/` nel progetto
2. Carica le tue foto
3. Sostituisci i link `https://placekitten.com/...` con `images/tua-foto.jpg`

Dimensioni consigliate:
- Hero: 1920x1080px
- Camere: 800x600px
- Galleria: 400x300px
- Attrazioni: 400x250px

### Mappa

La mappa punta a Piazza del Popolo. Per cambiarla:

1. Vai su [Google Maps](https://maps.google.com)
2. Cerca l'indirizzo esatto del B&B
3. Clicca "Condividi" > "Incorpora mappa"
4. Copia il codice iframe
5. Sostituisci l'iframe esistente nel file HTML

## Struttura del progetto

```
BnB/
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Action per il deploy automatico
├── index.html           # Pagina principale
├── README.md            # Questo file
└── images/              # Cartella per le immagini (da creare)
```

## Tecnologie usate

- **HTML5** - Struttura della pagina
- **Tailwind CSS** (CDN) - Stili e layout
- **Formspree** - Gestione form contatti
- **Google Maps Embed** - Mappa interattiva
- **GitHub Actions** - Deploy automatico

## Supporto

Per modifiche o assistenza, contatta lo sviluppatore.
