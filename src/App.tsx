import React, { useState, useReducer, useEffect, createContext, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Users, Copy, Check, LogOut } from 'lucide-react';
import { ref, onValue, set, get, remove } from "firebase/database";
import { db } from './firebase';

// ─── DESIGN TOKENS (Electric Arena) ─────────────────────────────────────────

const EA = {
  primary:    '#0052FF',
  primaryHov: '#0041CC',
  primaryDim: 'rgba(0,82,255,0.15)',
  secondary:  '#8A2BE2',
  secondaryHov: '#7020C0',
  secondaryDim: 'rgba(138,43,226,0.15)',
  tertiary:   '#FFD700',
  tertiaryDim:'rgba(255,215,0,0.15)',
  bg:         '#121214',
  surface:    '#1A1A1E',
  surface2:   '#222228',
  surface3:   '#2A2A32',
  outline:    'rgba(255,255,255,0.08)',
  outline2:   'rgba(255,255,255,0.14)',
  onBg:       '#F0F0FF',
  onSurface:  '#C8C8E0',
  onMuted:    'rgba(200,200,224,0.45)',
  success:    '#22C55E',
  error:      '#EF4444',
  // fonts
  fHead: "'Inter', sans-serif",
  fBody:  "'Plus Jakarta Sans', sans-serif",
  fLabel: "'Space Grotesk', sans-serif",
  // radii
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

const TRANSLATIONS = {
  it: {
    selectLanguage: "Scegli la lingua",
    selectLanguageSub: "Seleziona la tua lingua per iniziare a giocare",
    lobbyTitle: "Gira la Ruota",
    lobbySubtitle: "Spin & Solve — il game show televisivo",
    players: "Giocatori",
    vsBots: "🤖 Contro Bot",
    withFriends: "👥 Con Amici",
    yourName: "Il tuo nome",
    you: "Tu",
    playerXName: (x: number) => `Nome Giocatore ${x}...`,
    botDisclaimer: "Giocherai contro Bot Alfa e Bot Beta. L'intelligenza dei bot dipende dalla difficoltà.",
    passDevice: "📱 I giocatori si passano il dispositivo a turno",
    settings: "Impostazioni",
    mode: "Modalità",
    singleRound: "⚡ Round Singolo",
    halfGame: "🎯 Mezza Partita (3 Round)",
    fullGame: "🏆 Partita Completa (5 Round)",
    difficulty: "Difficoltà",
    easy: "😊 Facile",
    medium: "🤔 Medio",
    hard: "💀 Difficile",
    playNow: "▶ GIOCA ADESSO",
    category: "CATEGORIA",
    roundXofY: (c: number, t: number) => `Round ${c}/${t}`,
    timeRemaining: "TEMPO RIMASTO",
    vowelCost: "La vocale costa €500",
    freeSpinChoice: "⭐ Usa il Jolly?",
    spin: "🎡 Gira",
    solve: "💡 Risolvi",
    spinning: "La Ruota Gira...",
    thinking: (n: string) => `${n} sta pensando...`,
    solveTitle: "Dai la soluzione!",
    cancel: "Annulla",
    confirm: "✓ Conferma",
    writeHere: "Scrivi qui...",
    roundOverTitle: "🎉 Round Terminato!",
    gameOverTitle: "🏆 Fine Partita!",
    winnerIs: (n: string) => `Ha vinto ${n}!`,
    nobody: "nessuno",
    nextRound: "Prossimo Round ▶",
    newGame: "🔄 Nuova Partita",
    totalScore: "TOT",
    turn: "TURNO",
    yes: "✅ SÌ",
    no: "❌ NO",
    wheelSpinningText: "Ruota in movimento...",
    changeLanguage: "🌐 Cambia Lingua",
    recoveryTitle: "🆘 Pannello di Ripristino",
    recoverySubtitle: "Usa queste opzioni se il gioco si è bloccato o se mancano consonanti.",
    forceSkipTurn: "⏭️ Forza Passa Turno",
    forceResolveRound: "🧩 Risolvi Round (Vittoria automatica)",
    forceRerollPhrase: "🔄 Rigenera Frase",
    forceSetSpin: "⚡ Sblocca Stato (Resetta a Gira)",
    restartRound: "🔁 Riavvia Round",
    close: "Chiudi",
    unlockBtn: "Sblocca",
    noConsonantsWarning: "⚠️ Non ci sono più consonanti! Compra una vocale o risolvi.",
    online: "🌐 Online",
    createRoom: "Crea Stanza",
    joinRoom: "Entra in Stanza",
    roomCode: "Codice Stanza",
    enterRoomCode: "Inserisci codice...",
    connect: "Connetti",
    waitingHost: "In attesa dell'host...",
    waitingPlayers: "In attesa di altri giocatori...",
    leaveRoom: "Esci dalla stanza",
    roomNotFound: "Stanza non trovata o già avviata",
    roomFull: "La stanza è piena (max 3)",
    copyCode: "Copia Codice",
    copied: "Copiato!",
  },
  en: {
    selectLanguage: "Choose Language",
    selectLanguageSub: "Select your language to start playing",
    lobbyTitle: "Wheel of Fortune",
    lobbySubtitle: "Spin & Solve — the TV game show",
    players: "Players",
    vsBots: "🤖 VS Bots",
    withFriends: "👥 With Friends",
    yourName: "Your name",
    you: "You",
    playerXName: (x: number) => `Player ${x} Name...`,
    botDisclaimer: "You will play against Bot Alfa and Bot Beta. Bot intelligence depends on difficulty.",
    passDevice: "📱 Players take turns passing the device",
    settings: "Settings",
    mode: "Game Mode",
    singleRound: "⚡ Single Round",
    halfGame: "🎯 Half Game (3 Rounds)",
    fullGame: "🏆 Full Game (5 Rounds)",
    difficulty: "Difficulty",
    easy: "😊 Easy",
    medium: "🤔 Medium",
    hard: "💀 Hard",
    playNow: "▶ PLAY NOW",
    category: "CATEGORY",
    roundXofY: (c: number, t: number) => `Round ${c}/${t}`,
    timeRemaining: "TIME REMAINING",
    vowelCost: "Vowel costs €500",
    freeSpinChoice: "⭐ Use Free Spin?",
    spin: "🎡 Spin",
    solve: "💡 Solve",
    spinning: "Wheel spinning...",
    thinking: (n: string) => `${n} is thinking...`,
    solveTitle: "Solve the phrase!",
    cancel: "Cancel",
    confirm: "✓ Confirm",
    writeHere: "Write here...",
    roundOverTitle: "🎉 Round Over!",
    gameOverTitle: "🏆 Game Over!",
    winnerIs: (n: string) => `${n} won the game!`,
    nobody: "nobody",
    nextRound: "Next Round ▶",
    newGame: "🔄 New Game",
    totalScore: "TOT",
    turn: "TURN",
    yes: "✅ YES",
    no: "❌ NO",
    wheelSpinningText: "Wheel spinning...",
    changeLanguage: "🌐 Change Language",
    recoveryTitle: "🆘 Emergency Recovery Panel",
    recoverySubtitle: "Use these options if the game is stuck or no consonants are left.",
    forceSkipTurn: "⏭️ Force Skip Turn",
    forceResolveRound: "🧩 Auto-Resolve Round (Auto-Win)",
    forceRerollPhrase: "🔄 Reroll Phrase",
    forceSetSpin: "⚡ Unlock State (Reset to Spin)",
    restartRound: "🔁 Restart Round",
    close: "Close",
    unlockBtn: "Unlock",
    noConsonantsWarning: "⚠️ No consonants left! Buy a vowel or solve.",
    online: "🌐 Online",
    createRoom: "Create Room",
    joinRoom: "Join Room",
    roomCode: "Room Code",
    enterRoomCode: "Enter code...",
    connect: "Connect",
    waitingHost: "Waiting for host...",
    waitingPlayers: "Waiting for players...",
    leaveRoom: "Leave Room",
    roomNotFound: "Room not found or already started",
    roomFull: "Room is full (max 3)",
    copyCode: "Copy Code",
    copied: "Copied!",
  },
  es: {
    selectLanguage: "Selecciona el idioma",
    selectLanguageSub: "Selecciona tu idioma para empezar a jugar",
    lobbyTitle: "La Rueda de la Fortuna",
    lobbySubtitle: "Gira y Resuelve — el concurso de televisión",
    players: "Jugadores",
    vsBots: "🤖 Contra Bots",
    withFriends: "👥 Con Amigos",
    yourName: "Tu nombre",
    you: "Tú",
    playerXName: (x: number) => `Nombre del Jugador ${x}...`,
    botDisclaimer: "Jugarás contra Bot Alfa y Bot Beta. La inteligencia depende de la dificultad.",
    passDevice: "📱 Los jugadores se pasan el dispositivo por turnos",
    settings: "Ajustes",
    mode: "Modo",
    singleRound: "⚡ Ronda única",
    halfGame: "🎯 Media Partida (3 Rondas)",
    fullGame: "🏆 Partida Completa (5 Rondas)",
    difficulty: "Dificultad",
    easy: "😊 Fácil",
    medium: "🤔 Medio",
    hard: "💀 Difícil",
    playNow: "▶ JUGAR AHORA",
    category: "CATEGORÍA",
    roundXofY: (c: number, t: number) => `Ronda ${c}/${t}`,
    timeRemaining: "TIEMPO RESTANTE",
    vowelCost: "La vocal cuesta €500",
    freeSpinChoice: "⭐ ¿Usar el comodín?",
    spin: "🎡 Girar",
    solve: "💡 Resolver",
    spinning: "Rueda girando...",
    thinking: (n: string) => `${n} está pensando...`,
    solveTitle: "¡Resuelve la frase!",
    cancel: "Cancelar",
    confirm: "✓ Confirmar",
    writeHere: "Escribe aquí...",
    roundOverTitle: "🎉 ¡Ronda Terminada!",
    gameOverTitle: "🏆 ¡Fin de la Partida!",
    winnerIs: (n: string) => `¡Ha ganado ${n}!`,
    nobody: "nadie",
    nextRound: "Siguiente Ronda ▶",
    newGame: "🔄 Nueva Partida",
    totalScore: "TOT",
    turn: "TURNO",
    yes: "✅ SÍ",
    no: "❌ NO",
    wheelSpinningText: "Rueda girando...",
    changeLanguage: "🌐 Cambiar Idioma",
    recoveryTitle: "🆘 Panel de Recuperación de Emergencia",
    recoverySubtitle: "Usa estas opciones si el juego está atascado o no quedan consonantes.",
    forceSkipTurn: "⏭️ Forzar Salto de Turno",
    forceResolveRound: "🧩 Resolver Ronda (Victoria automática)",
    forceRerollPhrase: "🔄 Regenerar Frase",
    forceSetSpin: "⚡ Desbloquear Estado (Volver a Girar)",
    restartRound: "🔁 Reiniciar Ronda",
    close: "Cerrar",
    unlockBtn: "Desbloq",
    noConsonantsWarning: "⚠️ ¡No quedan consonantes! Compra una vocal o resuelve.",
    online: "🌐 Online",
    createRoom: "Crear Sala",
    joinRoom: "Unirse a Sala",
    roomCode: "Código de Sala",
    enterRoomCode: "Ingresar código...",
    connect: "Conectar",
    waitingHost: "Esperando al anfitrión...",
    waitingPlayers: "Esperando jugadores...",
    leaveRoom: "Salir de la Sala",
    roomNotFound: "Sala no encontrada o ya iniciada",
    roomFull: "La sala está llena (máx 3)",
    copyCode: "Copiar Código",
    copied: "¡Copiado!",
  },
  fr: {
    selectLanguage: "Choisir la langue",
    selectLanguageSub: "Sélectionnez votre langue pour commencer à jouer",
    lobbyTitle: "La Roue de la Fortune",
    lobbySubtitle: "Tournez & Résolvez — le jeu télévisé",
    players: "Joueurs",
    vsBots: "🤖 Contre Bots",
    withFriends: "👥 Avec Amis",
    yourName: "Votre nom",
    you: "Toi",
    playerXName: (x: number) => `Nom du Joueur ${x}...`,
    botDisclaimer: "Vous jouerez contre Bot Alfa et Bot Beta. L'intelligence dépend de la difficulté.",
    passDevice: "📱 Les joueurs se passent l'appareil à tour de rôle",
    settings: "Paramètres",
    mode: "Mode",
    singleRound: "⚡ Manche unique",
    halfGame: "🎯 Demi-partie (3 Manches)",
    fullGame: "🏆 Partie Complète (5 Manches)",
    difficulty: "Difficulté",
    easy: "😊 Facile",
    medium: "🤔 Moyen",
    hard: "💀 Difficile",
    playNow: "▶ JOUER MAINTENANT",
    category: "CATÉGORIE",
    roundXofY: (c: number, t: number) => `Manche ${c}/${t}`,
    timeRemaining: "TEMPS RESTANT",
    vowelCost: "La voyelle coûte 500 €",
    freeSpinChoice: "⭐ Utiliser le Joker ?",
    spin: "🎡 Tourner",
    solve: "💡 Résoudre",
    spinning: "La roue tourne...",
    thinking: (n: string) => `${n} réfléchit...`,
    solveTitle: "Donne la solution !",
    cancel: "Annuler",
    confirm: "✓ Confirmer",
    writeHere: "Écris ici...",
    roundOverTitle: "🎉 Manche Terminée !",
    gameOverTitle: "🏆 Partie Terminée !",
    winnerIs: (n: string) => `${n} a gagné !`,
    nobody: "personne",
    nextRound: "Manche Suivante ▶",
    newGame: "🔄 Nouvelle Partie",
    totalScore: "TOT",
    turn: "TOUR",
    yes: "✅ OUI",
    no: "❌ NON",
    wheelSpinningText: "Roue en mouvement...",
    changeLanguage: "🌐 Changer de Langue",
    recoveryTitle: "🆘 Panneau de Récupération d'Urgence",
    recoverySubtitle: "Utilisez ces options si le jeu est bloqué ou s'il ne reste plus de consonne.",
    forceSkipTurn: "⏭️ Forcer le Passage de Tour",
    forceResolveRound: "🧩 Résoudre la Manche (Victoire auto)",
    forceRerollPhrase: "🔄 Régénérer la Phrase",
    forceSetSpin: "⚡ Débloquer l'État (Réinitialiser à Tourner)",
    restartRound: "🔁 Recommencer la Manche",
    close: "Fermer",
    unlockBtn: "Débloq",
    noConsonantsWarning: "⚠️ Plus de consonne ! Achetez une voyelle ou résolvez.",
    online: "🌐 En Ligne",
    createRoom: "Créer une Salle",
    joinRoom: "Rejoindre une Salle",
    roomCode: "Code de la Salle",
    enterRoomCode: "Entrer le code...",
    connect: "Rejoindre",
    waitingHost: "En attente de l'hôte...",
    waitingPlayers: "En attente de joueurs...",
    leaveRoom: "Quitter la Salle",
    roomNotFound: "Salle non trouvée ou déjà lancée",
    roomFull: "La salle est pleine (max 3)",
    copyCode: "Copier le Code",
    copied: "Copié !",
  },
  de: {
    selectLanguage: "Sprache wählen",
    selectLanguageSub: "Wähle deine Sprache, um das Spiel zu starten",
    lobbyTitle: "Glücksrad",
    lobbySubtitle: "Drehen & Lösen — die TV-Spielshow",
    players: "Spieler",
    vsBots: "🤖 Gegen Bots",
    withFriends: "👥 Mit Freunden",
    yourName: "Dein Name",
    you: "Du",
    playerXName: (x: number) => `Name von Spieler ${x}...`,
    botDisclaimer: "Du spielst gegen Bot Alfa und Bot Beta. Die Intelligenz hängt vom Schwierigkeitsgrad ab.",
    passDevice: "📱 Spieler geben das Gerät abwechselnd weiter",
    settings: "Einstellungen",
    mode: "Modus",
    singleRound: "⚡ Einzelne Runde",
    halfGame: "🎯 Halbes Spiel (3 Runden)",
    fullGame: "🏆 Volles Spiel (5 Runden)",
    difficulty: "Schwierigkeit",
    easy: "😊 Einfach",
    medium: "🤔 Mittel",
    hard: "💀 Schwer",
    playNow: "▶ JETZT SPIELEN",
    category: "KATEGORIE",
    roundXofY: (c: number, t: number) => `Runde ${c}/${t}`,
    timeRemaining: "VERBLEIBENDE ZEIT",
    vowelCost: "Vokal kostet 500 €",
    freeSpinChoice: "⭐ Joker benutzen?",
    spin: "🎡 Drehen",
    solve: "💡 Lösen",
    spinning: "Rad dreht sich...",
    thinking: (n: string) => `${n} überlegt...`,
    solveTitle: "Löse das Rätsel!",
    cancel: "Abbrechen",
    confirm: "✓ Bestätigen",
    writeHere: "Hier schreiben...",
    roundOverTitle: "🎉 Runde vorbei!",
    gameOverTitle: "🏆 Spiel vorbei!",
    winnerIs: (n: string) => `${n} hat gewonnen!`,
    nobody: "niemand",
    nextRound: "Nächste Runde ▶",
    newGame: "🔄 Neues Spiel",
    totalScore: "TOT",
    turn: "ZUG",
    yes: "✅ JA",
    no: "❌ NEIN",
    wheelSpinningText: "Rad dreht sich...",
    changeLanguage: "🌐 Sprache Ändern",
    recoveryTitle: "🆘 Notfall-Wiederherstellungspanel",
    recoverySubtitle: "Nutze diese Optionen, wenn das Spiel feststeckt oder keine Konsonanten übrig sind.",
    forceSkipTurn: "⏭️ Zug erzwungen überspringen",
    forceResolveRound: "🧩 Runde auflösen (Automatischer Sieg)",
    forceRerollPhrase: "🔄 Phrase neu würfeln",
    forceSetSpin: "⚡ Status freigeben (Zurücksetzen auf Drehen)",
    restartRound: "🔁 Runde neu starten",
    close: "Schließen",
    unlockBtn: "Entsperren",
    noConsonantsWarning: "⚠️ Keine Konsonanten übrig! Kaufe Vokal oder löse auf.",
    online: "🌐 Online",
    createRoom: "Raum Erstellen",
    joinRoom: "Raum Beitreten",
    roomCode: "Raumcode",
    enterRoomCode: "Code eingeben...",
    connect: "Verbinden",
    waitingHost: "Warten auf Host...",
    waitingPlayers: "Warten auf Spieler...",
    leaveRoom: "Raum verlassen",
    roomNotFound: "Raum nicht gefunden oder bereits gestartet",
    roomFull: "Raum ist voll (max. 3)",
    copyCode: "Code Kopieren",
    copied: "Kopiert!",
  }
};

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Language = 'it' | 'en' | 'es' | 'fr' | 'de';
type Difficulty = 'easy' | 'medium' | 'hard';
type PlayerType = 'human' | 'bot';
type GameMode = '1_round' | 'half_game' | 'full_game';
type SpinResult = number | 'Passa' | 'Bancarotta' | 'Jolly';
type GameStatus = 'language_select' | 'lobby' | 'playing' | 'round_over' | 'game_over';
type TurnState = 'waiting_spin' | 'waiting_letter' | 'waiting_action' | 'jolly_choice';

interface Player {
  id: string;
  name: string;
  type: PlayerType;
  score: number;
  totalScore: number;
  hasJolly: boolean;
}

interface Phrase {
  id: string;
  category: string;
  text: string;
  language: Language;
  difficulty: Difficulty;
}

interface GameState {
  status: GameStatus;
  mode: GameMode;
  language: Language;
  difficulty: Difficulty;
  players: Player[];
  currentPlayerIndex: number;
  currentRound: number;
  maxRounds: number;
  currentPhrase: Phrase | null;
  guessedConsonants: string[];
  guessedVowels: string[];
  spinResult: SpinResult | null;
  turnState: TurnState;
  winnerId: string | null;
  lastMessage: string;
  usedPhraseIds: string[];
  targetWedgeIndex: number | null;
  botDeclaration: { type: 'spin' | 'letter' | 'solve' | 'jolly'; value?: string; action: any } | null;
  wheelValues: SpinResult[];
  isOnline: boolean;
  roomCode: string | null;
  myPlayerId: string;
  hostId: string | null;
}

// ─── PHRASES ─────────────────────────────────────────────────────────────────

const ALL_PHRASES: Phrase[] = [
  // IT EASY
  { id: 'it_e_1', language: 'it', difficulty: 'easy', category: 'Proverbio', text: 'ROSSO DI SERA BEL TEMPO SI SPERA' },
  { id: 'it_e_2', language: 'it', difficulty: 'easy', category: 'Cibo', text: 'LA PIZZA MARGHERITA CON LA MOZZARELLA FILANTE' },
  { id: 'it_e_3', language: 'it', difficulty: 'easy', category: 'Film', text: 'IL FILM LA VITA E BELLA CON ROBERTO BENIGNI' },
  { id: 'it_e_4', language: 'it', difficulty: 'easy', category: 'Animali', text: 'IL LEONE E IL RE DELLA FORESTA AFRICANA' },
  { id: 'it_e_5', language: 'it', difficulty: 'easy', category: 'Luoghi', text: 'LA GRANDE PIAZZA SAN PIETRO A ROMA' },
  { id: 'it_e_6', language: 'it', difficulty: 'easy', category: 'Sport', text: 'IL PORTIERE PARA IL RIGORE IN FINALE' },
  { id: 'it_e_7', language: 'it', difficulty: 'easy', category: 'Musica', text: 'LA CANZONE PIU BELLA DELLA RADIO ITALIANA' },
  // IT MEDIUM
  { id: 'it_m_1', language: 'it', difficulty: 'medium', category: 'Proverbio', text: 'CHI DORME NON PIGLIA PESCI MA SOGNA' },
  { id: 'it_m_2', language: 'it', difficulty: 'medium', category: 'Storia', text: 'CRISTOFORO COLOMBO E LA SCOPERTA DELL AMERICA' },
  { id: 'it_m_3', language: 'it', difficulty: 'medium', category: 'Sport', text: 'LA NAZIONALE ITALIANA HA VINTO I MONDIALI' },
  { id: 'it_m_4', language: 'it', difficulty: 'medium', category: 'Musica', text: 'NEL BLU DIPINTO DI BLU VOLARE OH OH' },
  { id: 'it_m_5', language: 'it', difficulty: 'medium', category: 'Luoghi', text: 'LA TORRE DI PISA E INCLINATA DI CINQUE GRADI' },
  { id: 'it_m_6', language: 'it', difficulty: 'medium', category: 'Gastronomia', text: 'IL RISOTTO ALLA MILANESE CON LO ZAFFERANO' },
  // IT HARD
  { id: 'it_h_1', language: 'it', difficulty: 'hard', category: 'Modo di dire', text: 'AVERE LA BOTTE PIENA E LA MOGLIE UBRIACA' },
  { id: 'it_h_2', language: 'it', difficulty: 'hard', category: 'Arte', text: 'LEONARDO DA VINCI DIPINSE LA CELEBRE GIOCONDA' },
  { id: 'it_h_3', language: 'it', difficulty: 'hard', category: 'Citazione', text: 'LA FAMOSA FRASE DI GALILEO GALILEI E PUR SI MUOVE' },
  { id: 'it_h_4', language: 'it', difficulty: 'hard', category: 'Letteratura', text: 'NEL MEZZO DEL CAMMIN DI NOSTRA VITA' },
  { id: 'it_h_5', language: 'it', difficulty: 'hard', category: 'Proverbio', text: 'NON TUTTE LE CIAMBELLE RIESCONO COL BUCO' },
  { id: 'it_h_6', language: 'it', difficulty: 'hard', category: 'Filosofia', text: 'IL DUBBIO E L INIZIO DELLA VERA CONOSCENZA' },
  // EN EASY
  { id: 'en_e_1', language: 'en', difficulty: 'easy', category: 'Proverb', text: 'AN APPLE A DAY KEEPS THE DOCTOR AWAY' },
  { id: 'en_e_2', language: 'en', difficulty: 'easy', category: 'Movie', text: 'THE LION KING IS A CLASSIC DISNEY MOVIE' },
  { id: 'en_e_3', language: 'en', difficulty: 'easy', category: 'Animals', text: 'THE GOLDEN RETRIEVER IS A VERY FRIENDLY DOG' },
  { id: 'en_e_4', language: 'en', difficulty: 'easy', category: 'Places', text: 'THE FAMOUS EIFFEL TOWER STANDS IN PARIS FRANCE' },
  { id: 'en_e_5', language: 'en', difficulty: 'easy', category: 'Food', text: 'A LARGE HAMBURGER WITH FRENCH FRIES AND KETCHUP' },
  { id: 'en_e_6', language: 'en', difficulty: 'easy', category: 'Sport', text: 'THE GOALKEEPER SAVED THE PENALTY IN THE FINAL' },
  // EN MEDIUM
  { id: 'en_m_1', language: 'en', difficulty: 'medium', category: 'Proverb', text: 'ACTIONS SPEAK LOUDER THAN WORDS EVERY TIME' },
  { id: 'en_m_2', language: 'en', difficulty: 'medium', category: 'History', text: 'THE BEAUTIFUL STATUE OF LIBERTY STANDS IN NEW YORK' },
  { id: 'en_m_3', language: 'en', difficulty: 'medium', category: 'Books', text: 'HARRY POTTER AND THE PHILOSOPHER STONE' },
  { id: 'en_m_4', language: 'en', difficulty: 'medium', category: 'Science', text: 'GRAVITY IS THE FORCE THAT PULLS EVERYTHING DOWN' },
  { id: 'en_m_5', language: 'en', difficulty: 'medium', category: 'Movie', text: 'BACK TO THE FUTURE IS A GREAT SCIENCE FICTION FILM' },
  { id: 'en_m_6', language: 'en', difficulty: 'medium', category: 'Music', text: 'WE WILL ROCK YOU IS A SONG BY QUEEN' },
  // EN HARD
  { id: 'en_h_1', language: 'en', difficulty: 'hard', category: 'Idiom', text: 'BITE THE BULLET AND FACE THE CONSEQUENCES HEAD ON' },
  { id: 'en_h_2', language: 'en', difficulty: 'hard', category: 'Quote', text: 'TO BE OR NOT TO BE THAT IS THE QUESTION' },
  { id: 'en_h_3', language: 'en', difficulty: 'hard', category: 'Movie', text: 'THE LORD OF THE RINGS THE RETURN OF THE KING' },
  { id: 'en_h_4', language: 'en', difficulty: 'hard', category: 'Science', text: 'THE FAMOUS THEORY OF GENERAL RELATIVITY BY EINSTEIN' },
  { id: 'en_h_5', language: 'en', difficulty: 'hard', category: 'Philosophy', text: 'I THINK THEREFORE I AM SAID DESCARTES' },
  // ES EASY
  { id: 'es_e_1', language: 'es', difficulty: 'easy', category: 'Comida', text: 'UNA DELICIOSA TORTILLA DE PATATAS ESPANOLA TRADICIONAL' },
  { id: 'es_e_2', language: 'es', difficulty: 'easy', category: 'Proverbio', text: 'MAS VALE TARDE QUE NUNCA LLEGAR A TIEMPO' },
  { id: 'es_e_3', language: 'es', difficulty: 'easy', category: 'Deporte', text: 'EL EQUIPO ESPANOL GANO LA COPA DEL MUNDO' },
  { id: 'es_e_4', language: 'es', difficulty: 'easy', category: 'Naturaleza', text: 'EL SOL SALE POR EL ESTE Y SE PONE POR EL OESTE' },
  // ES MEDIUM
  { id: 'es_m_1', language: 'es', difficulty: 'medium', category: 'Lugares', text: 'LA GRAN SAGRADA FAMILIA ESTA EN BARCELONA' },
  { id: 'es_m_2', language: 'es', difficulty: 'medium', category: 'Pelicula', text: 'EL LABERINTO DEL FAUNO ES UNA GRAN PELICULA ESPANOLA' },
  { id: 'es_m_3', language: 'es', difficulty: 'medium', category: 'Musica', text: 'LA BAMBA ES UNA CANCION FOLKLORICA MEXICANA' },
  // ES HARD
  { id: 'es_h_1', language: 'es', difficulty: 'hard', category: 'Proverbio', text: 'A LAS PALABRAS NECIAS OIDOS SORDOS Y CORAZON SERENO' },
  { id: 'es_h_2', language: 'es', difficulty: 'hard', category: 'Literatura', text: 'DON QUIJOTE DE LA MANCHA ES OBRA DE CERVANTES' },
  { id: 'es_h_3', language: 'es', difficulty: 'hard', category: 'Filosofia', text: 'EL HOMBRE ES LA MEDIDA DE TODAS LAS COSAS' },
  // FR EASY
  { id: 'fr_e_1', language: 'fr', difficulty: 'easy', category: 'Nourriture', text: 'UN CROISSANT CHAUD ET UN CAFE AU LAIT LE MATIN' },
  { id: 'fr_e_2', language: 'fr', difficulty: 'easy', category: 'Proverbe', text: 'PETIT A PETIT L OISEAU FAIT SON NID DOUCEMENT' },
  { id: 'fr_e_3', language: 'fr', difficulty: 'easy', category: 'Voyage', text: 'PARIS EST LA VILLE LUMIERE TRES ROMANTIQUE' },
  { id: 'fr_e_4', language: 'fr', difficulty: 'easy', category: 'Sport', text: 'LE TOUR DE FRANCE EST LA GRANDE COURSE CYCLISTE' },
  // FR MEDIUM
  { id: 'fr_m_1', language: 'fr', difficulty: 'medium', category: 'Lieux', text: 'LE MUSEE DU LOUVRE SE TROUVE AU COEUR DE PARIS' },
  { id: 'fr_m_2', language: 'fr', difficulty: 'medium', category: 'Cinema', text: 'LE FABULEUX DESTIN D AMELIE POULAIN EST UN CHEF D OEUVRE' },
  { id: 'fr_m_3', language: 'fr', difficulty: 'medium', category: 'Gastronomie', text: 'LA BOUILLABAISSE EST UN PLAT TYPIQUE DE MARSEILLE' },
  // FR HARD
  { id: 'fr_h_1', language: 'fr', difficulty: 'hard', category: 'Proverbe', text: 'RIEN NE SERT DE COURIR IL FAUT PARTIR A POINT' },
  { id: 'fr_h_2', language: 'fr', difficulty: 'hard', category: 'Art', text: 'LA NUIT ETOILEE DE VINCENT VAN GOGH EST SUBLIME' },
  { id: 'fr_h_3', language: 'fr', difficulty: 'hard', category: 'Philosophie', text: 'LA LIBERTE DES UNS S ARRETE OU CELLE DES AUTRES COMMENCE' },
  // DE EASY
  { id: 'de_e_1', language: 'de', difficulty: 'easy', category: 'Essen', text: 'EINE LECKERE BRATWURST MIT SCHARFEM SENF UND BROT' },
  { id: 'de_e_2', language: 'de', difficulty: 'easy', category: 'Tiere', text: 'DER HUND IST DER BESTE FREUND DES MENSCHEN' },
  { id: 'de_e_3', language: 'de', difficulty: 'easy', category: 'Reisen', text: 'BERLIN IST EINE WUNDERSCHONE HAUPTSTADT DEUTSCHLANDS' },
  { id: 'de_e_4', language: 'de', difficulty: 'easy', category: 'Sport', text: 'DIE DEUTSCHE MANNSCHAFT HAT DIE WELTMEISTERSCHAFT GEWONNEN' },
  // DE MEDIUM
  { id: 'de_m_1', language: 'de', difficulty: 'medium', category: 'Orte', text: 'DAS BEKANNTE BRANDENBURGER TOR STEHT IN BERLIN' },
  { id: 'de_m_2', language: 'de', difficulty: 'medium', category: 'Musik', text: 'DIE NEUNTE SINFONIE VON LUDWIG VAN BEETHOVEN IST BERUHMT' },
  { id: 'de_m_3', language: 'de', difficulty: 'medium', category: 'Kultur', text: 'DAS OKTOBERFEST FINDET JEDES JAHR IN MUNCHEN STATT' },
  // DE HARD
  { id: 'de_h_1', language: 'de', difficulty: 'hard', category: 'Sprichwort', text: 'WER IM GLASHAUS SITZT SOLLTE NICHT MIT STEINEN WERFEN' },
  { id: 'de_h_2', language: 'de', difficulty: 'hard', category: 'Literatur', text: 'FAUST EINE TRAGOEDIE VON JOHANN WOLFGANG VON GOETHE' },
  { id: 'de_h_3', language: 'de', difficulty: 'hard', category: 'Philosophie', text: 'WAS MICH NICHT UMBRINGT MACHT MICH STARKER SAGTE NIETZSCHE' },
];

const getRandomPhrase = (lang: Language, diff: Difficulty, excludeIds: string[]): Phrase => {
  const pool = ALL_PHRASES.filter(p => p.language === lang && p.difficulty === diff && !excludeIds.includes(p.id));
  const src = pool.length > 0 ? pool : ALL_PHRASES.filter(p => p.language === lang && p.difficulty === diff);
  return src[Math.floor(Math.random() * src.length)];
};

// ─── WHEEL DATA ───────────────────────────────────────────────────────────────
// 28 segments: mostly under 1000, only 2 jackpots

const WEDGE_VALUES: SpinResult[] = [
  300, 500, 100, 'Bancarotta',
  700, 400, 200, 600,
  900, 'Passa', 200, 700,
  400, 3000, 300, 'Jolly',
  500, 'Bancarotta', 800, 300,
  600, 'Passa', 2000, 400,
  900, 200, 500, 300,
];
const NUM_WEDGES = WEDGE_VALUES.length;

const getWedgeColor = (value: SpinResult, index: number): string => {
  if (value === 'Bancarotta') return '#1a0505';
  if (value === 'Passa') return '#1a0520';
  if (value === 'Jolly') return '#0a1a0a';
  if (typeof value === 'number' && value >= 2000) return '#1a1400';
  // Electric blue / purple alternating palette
  const palettes = [
    '#0a1a4a', '#0d1560', '#0b1980', '#0a1299',
    '#1a0a4a', '#220d60', '#180a70', '#110a50',
    '#0a1450', '#0f1870', '#0a1060', '#0c1355',
  ];
  return palettes[index % palettes.length];
};

const getWedgeLabel = (val: SpinResult, lang: Language = 'it'): string => {
  if (val === 'Bancarotta') {
    switch (lang) {
      case 'it': return 'BANCAROTTA';
      case 'en': return 'BANKRUPT';
      case 'es': return 'BANCARROTA';
      case 'fr': return 'BANQUEROUTE';
      case 'de': return 'BANKROTT';
      default: return 'BANK';
    }
  }
  if (val === 'Passa') {
    switch (lang) {
      case 'it': return 'PASSA';
      case 'en': return 'PASS';
      case 'es': return 'PASA';
      case 'fr': return 'PASSE';
      case 'de': return 'PASSE';
      default: return 'PASS';
    }
  }
  if (val === 'Jolly') {
    switch (lang) {
      case 'it': return '★ JOLLY';
      case 'en': return '★ JOLLY';
      case 'es': return '★ COMODÍN';
      case 'fr': return '★ JOKER';
      case 'de': return '★ JOKER';
      default: return '★ JOLLY';
    }
  }
  if (typeof val === 'number' && val >= 2000) return `${val}€★`;
  return `${val}€`;
};

const getWedgeTextColor = (val: SpinResult): string => {
  if (val === 'Bancarotta') return '#EF4444';
  if (val === 'Passa') return '#C084FC';
  if (val === 'Jolly') return '#4ADE80';
  if (typeof val === 'number' && val >= 2000) return '#FFD700';
  if (typeof val === 'number' && val >= 700) return '#60A5FA';
  return '#A5B4FC';
};

// ─── WHEEL SVG ───────────────────────────────────────────────────────────────

const WheelSVG = ({ rotation, size = 360, language = 'it', wheelValues = WEDGE_VALUES }: {
  rotation: number;
  size?: number;
  language?: Language;
  wheelValues?: SpinResult[];
}) => {
  const CX = 200, CY = 200, R = 188;
  const anglePerWedge = 360 / NUM_WEDGES;

  const wedges = wheelValues.map((val, i) => {
    const startDeg = i * anglePerWedge - 90;
    const endDeg   = (i + 1) * anglePerWedge - 90;
    const s = startDeg * Math.PI / 180;
    const e = endDeg   * Math.PI / 180;
    const x1 = CX + R * Math.cos(s), y1 = CY + R * Math.sin(s);
    const x2 = CX + R * Math.cos(e), y2 = CY + R * Math.sin(e);
    const path = `M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`;
    const midDeg = i * anglePerWedge + anglePerWedge / 2 - 90;
    const midRad = midDeg * Math.PI / 180;
    const tr = R * 0.60;
    const tx = CX + tr * Math.cos(midRad);
    const ty = CY + tr * Math.sin(midRad);
    const rotDeg = midDeg + 90;
    const bg = getWedgeColor(val, i);
    const textColor = getWedgeTextColor(val);
    const isSpecial = typeof val !== 'number';
    const isJackpot = typeof val === 'number' && val >= 2000;

    const label = getWedgeLabel(val, language);
    const chars = label.replace(/\s+/g, '').split('');
    
    let fontSize = isSpecial ? 9.5 : isJackpot ? 12.5 : 12;
    if (chars.length >= 10) {
      fontSize = 7.5;
    } else if (chars.length >= 8) {
      fontSize = 8.5;
    }
    
    const lineHeight = fontSize * 1.1;
    const totalHeight = (chars.length - 1) * lineHeight;
    const startY = ty - totalHeight / 2;

    return (
      <g key={i}>
        <path d={path} fill={bg} />
        {/* Separator line */}
        <line
          x1={CX} y1={CY}
          x2={CX + R * Math.cos(s)} y2={CY + R * Math.sin(s)}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
        {/* Edge glow for special/jackpot */}
        {(isSpecial || isJackpot) && (
          <path d={path} fill="none"
            stroke={val === 'Bancarotta' ? '#EF4444' : val === 'Passa' ? '#C084FC' : val === 'Jolly' ? '#4ADE80' : '#FFD700'}
            strokeWidth="1.5" opacity="0.5"
          />
        )}
        <text
          fill={textColor}
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="Inter, sans-serif"
          textAnchor="middle"
          transform={`rotate(${rotDeg},${tx},${ty})`}
          letterSpacing="0.4"
        >
          {chars.map((char, charIdx) => (
            <tspan
              key={charIdx}
              x={tx}
              y={startY + charIdx * lineHeight}
              dominantBaseline="middle"
            >
              {char}
            </tspan>
          ))}
        </text>
      </g>
    );
  });

  // Rim bulbs at every wedge boundary
  const bulbs = Array.from({ length: NUM_WEDGES }, (_, i) => {
    const angle = (i * anglePerWedge - 90) * Math.PI / 180;
    const br = R - 7;
    return (
      <circle key={`b${i}`}
        cx={CX + br * Math.cos(angle)} cy={CY + br * Math.sin(angle)}
        r="3.5" fill={EA.tertiary} opacity="0.7"
        style={{ filter: `drop-shadow(0 0 3px ${EA.tertiary})` }}
      />
    );
  });

  return (
    <div style={{ position: 'relative', width: size, height: size + 24, margin: '0 auto', flexShrink: 0 }}>
      {/* Pointer */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
        <svg width="32" height="40" viewBox="0 0 32 40">
          <defs>
            <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EA.primary} />
              <stop offset="100%" stopColor="#003ACC" />
            </linearGradient>
          </defs>
          <polygon points="16,36 2,4 30,4" fill="url(#pGrad)"
            style={{ filter: `drop-shadow(0 3px 8px ${EA.primary}aa)` }} />
          <circle cx="16" cy="4" r="3" fill="white" opacity="0.5" />
        </svg>
      </div>

      {/* Outer glow ring */}
      <div style={{
        position: 'absolute', top: 24, left: 0, right: 0, bottom: 0,
        borderRadius: '50%',
        padding: 5,
        background: `conic-gradient(from 0deg, ${EA.primary}, ${EA.secondary}, ${EA.primary}, ${EA.secondary}, ${EA.primary})`,
        boxShadow: `0 0 0 2px ${EA.bg}, 0 0 40px ${EA.primary}55, 0 0 60px ${EA.secondary}33`,
      }}>
        <motion.div
          style={{ borderRadius: '50%', overflow: 'hidden', width: '100%', height: '100%' }}
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.05, 0.8, 0.2, 1.0] }}
        >
          <svg viewBox="0 0 400 400" style={{ display: 'block', width: '100%', height: '100%' }}>
            <defs>
              <radialGradient id="hubG" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor={EA.primary} />
                <stop offset="70%" stopColor={EA.secondary} />
                <stop offset="100%" stopColor="#0a0a1a" />
              </radialGradient>
              <radialGradient id="rimG" cx="50%" cy="50%" r="50%">
                <stop offset="78%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
              </radialGradient>
            </defs>
            {wedges}
            {bulbs}
            <circle cx="200" cy="200" r="188" fill="url(#rimG)" />
            {/* Hub */}
            <circle cx="200" cy="200" r="34" fill={EA.surface} stroke={EA.primary} strokeWidth="3"
              style={{ filter: `drop-shadow(0 0 12px ${EA.primary}88)` }} />
            <circle cx="200" cy="200" r="28" fill="url(#hubG)" />
            <circle cx="200" cy="200" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

// ─── GAME LOGIC ───────────────────────────────────────────────────────────────

type GameAction =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'RESET_TO_LANGUAGE_SELECT' }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'UPDATE_PLAYER_NAME'; payload: { id: string; name: string } }
  | { type: 'START_GAME'; payload: { mode: GameMode; language: Language; difficulty: Difficulty } }
  | { type: 'SPIN_WHEEL' }
  | { type: 'WHEEL_STOPPED' }
  | { type: 'GUESS_CONSONANT'; payload: string }
  | { type: 'BUY_VOWEL'; payload: string }
  | { type: 'SOLVE_PHRASE'; payload: string }
  | { type: 'USE_JOLLY' }
  | { type: 'SKIP_JOLLY' }
  | { type: 'NEXT_ROUND' }
  | { type: 'DECLARE_BOT_ACTION'; payload: { type: 'spin' | 'letter' | 'solve' | 'jolly'; value?: string; action: any } }
  | { type: 'CLEAR_BOT_DECLARATION' }
  | { type: 'TIMEOUT_PASS' }
  | { type: 'FORCE_SKIP_TURN' }
  | { type: 'FORCE_RESOLVE_ROUND' }
  | { type: 'FORCE_REROLL_PHRASE' }
  | { type: 'FORCE_SET_SPIN' }
  | { type: 'RESTART_ROUND' }
  | { type: 'SYNC_STATE'; payload: any }
  | { type: 'SET_ONLINE_INFO'; payload: { isOnline: boolean; roomCode: string | null; myPlayerId: string; hostId: string | null } };

const getMyPlayerId = (): string => {
  let id = sessionStorage.getItem('gira_player_id');
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem('gira_player_id', id);
  }
  return id;
};

const getStoredPlayerName = (): string => {
  return localStorage.getItem('gira_player_name') || 'Tu';
};

const makeHuman = (id: string, name: string): Player => ({ id, name, type: 'human', score: 0, totalScore: 0, hasJolly: false });
const makeBot   = (id: string, name: string): Player => ({ id, name, type: 'bot',   score: 0, totalScore: 0, hasJolly: false });

const myId = getMyPlayerId();
const myStoredName = getStoredPlayerName();

const initialState: GameState = {
  status: 'language_select', mode: '1_round', language: 'it', difficulty: 'easy',
  players: [makeHuman(myId, myStoredName), makeBot('bot_1', '🤖 Bot Alfa'), makeBot('bot_2', '🤖 Bot Beta')],
  currentPlayerIndex: 0, currentRound: 1, maxRounds: 1,
  currentPhrase: null, guessedConsonants: [], guessedVowels: [],
  spinResult: null, turnState: 'waiting_spin', winnerId: null,
  lastMessage: 'Benvenuto in Gira la Ruota Show!',
  usedPhraseIds: [], targetWedgeIndex: null,
  botDeclaration: null,
  wheelValues: [...WEDGE_VALUES],
  isOnline: false,
  roomCode: null,
  myPlayerId: myId,
  hostId: null,
};

const nextPlayer = (state: GameState): GameState => {
  const nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
  const name = state.players[nextIdx].name;
  let lastMessage = '';
  switch (state.language) {
    case 'it': lastMessage = `🎯 Tocca a ${name}!`; break;
    case 'en': lastMessage = `🎯 It's ${name}'s turn!`; break;
    case 'es': lastMessage = `🎯 ¡Es el turno de ${name}!`; break;
    case 'fr': lastMessage = `🎯 Au tour de ${name} !`; break;
    case 'de': lastMessage = `🎯 ${name} ist an der Reihe!`; break;
  }
  return { ...state, currentPlayerIndex: nextIdx, turnState: 'waiting_spin', spinResult: null, lastMessage };
};

const gameReducer = (rawState: GameState, action: GameAction): GameState => {
  let state = rawState;
  if (action.type !== 'DECLARE_BOT_ACTION' && action.type !== 'CLEAR_BOT_DECLARATION') {
    state = { ...rawState, botDeclaration: null };
  }

  switch (action.type) {
    case 'DECLARE_BOT_ACTION': {
      const cur = state.players[state.currentPlayerIndex];
      const lang = state.language;
      const { type, value } = action.payload;
      let msg = '';
      if (type === 'spin') {
        switch (lang) {
          case 'it': msg = `🤖 ${cur.name} decide di girare la ruota...`; break;
          case 'en': msg = `🤖 ${cur.name} decides to spin the wheel...`; break;
          case 'es': msg = `🤖 ${cur.name} decide girar la rueda...`; break;
          case 'fr': msg = `🤖 ${cur.name} décide de tourner la roue...`; break;
          case 'de': msg = `🤖 ${cur.name} entscheidet sich, das Rad zu drehen...`; break;
        }
      } else if (type === 'letter') {
        switch (lang) {
          case 'it': msg = `🤖 ${cur.name} sceglie la lettera '${value}'!`; break;
          case 'en': msg = `🤖 ${cur.name} chooses the letter '${value}'!`; break;
          case 'es': msg = `🤖 ${cur.name} elige la letra '${value}'!`; break;
          case 'fr': msg = `🤖 ${cur.name} choisit la lettre '${value}'!`; break;
          case 'de': msg = `🤖 ${cur.name} wählt den Buchstaben '${value}'!`; break;
        }
      } else if (type === 'solve') {
        switch (lang) {
          case 'it': msg = `🤖 ${cur.name} tenta di risolvere il tabellone!`; break;
          case 'en': msg = `🤖 ${cur.name} tries to solve the puzzle!`; break;
          case 'es': msg = `🤖 ${cur.name} intenta resolver el tablero!`; break;
          case 'fr': msg = `🤖 ${cur.name} tente de résoudre le tableau!`; break;
          case 'de': msg = `🤖 ${cur.name} versucht, das Rätsel zu lösen!`; break;
        }
      } else if (type === 'jolly') {
        switch (lang) {
          case 'it': msg = `🤖 ${cur.name} decide di usare il Jolly!`; break;
          case 'en': msg = `🤖 ${cur.name} decides to use the Free Spin!`; break;
          case 'es': msg = `🤖 ${cur.name} decide usar el Comodín!`; break;
          case 'fr': msg = `🤖 ${cur.name} décide d'utiliser le Joker!`; break;
          case 'de': msg = `🤖 ${cur.name} entscheidet sich, den Joker zu nutzen!`; break;
        }
      }
      return { ...state, botDeclaration: action.payload, lastMessage: msg };
    }

    case 'CLEAR_BOT_DECLARATION':
      return { ...state, botDeclaration: null };

    case 'SET_LANGUAGE': {
      return {
        ...state,
        language: action.payload,
        status: 'lobby'
      };
    }

    case 'RESET_TO_LANGUAGE_SELECT': {
      return {
        ...state,
        status: 'language_select'
      };
    }

    case 'SET_PLAYERS': return { ...state, players: action.payload };

    case 'UPDATE_PLAYER_NAME': {
      const players = state.players.map(p => p.id === action.payload.id ? { ...p, name: action.payload.name } : p);
      if (action.payload.id === state.myPlayerId) {
        localStorage.setItem('gira_player_name', action.payload.name);
      }
      return { ...state, players };
    }

    case 'SYNC_STATE': {
      return { ...action.payload, myPlayerId: state.myPlayerId };
    }

    case 'SET_ONLINE_INFO': {
      return {
        ...state,
        isOnline: action.payload.isOnline,
        roomCode: action.payload.roomCode,
        myPlayerId: action.payload.myPlayerId,
        hostId: action.payload.hostId,
      };
    }

    case 'START_GAME': {
      const { mode, language, difficulty } = action.payload;
      const maxRounds = mode === '1_round' ? 1 : mode === 'half_game' ? 3 : 5;
      const phrase = getRandomPhrase(language, difficulty, []);
      let startMsg = '';
      switch (language) {
        case 'it': startMsg = '🎬 Inizia il gioco! In bocca al lupo!'; break;
        case 'en': startMsg = '🎬 Game starts! Good luck!'; break;
        case 'es': startMsg = '🎬 ¡Empieza el juego! ¡Buena suerte!'; break;
        case 'fr': startMsg = '🎬 Le jeu commence ! Bonne chance !'; break;
        case 'de': startMsg = '🎬 Das Spiel beginnt! Viel Glück!'; break;
      }
      return {
        ...state, status: 'playing', mode, language, difficulty, maxRounds,
        currentRound: 1, currentPhrase: phrase, guessedConsonants: [], guessedVowels: [],
        currentPlayerIndex: 0, turnState: 'waiting_spin', spinResult: null, winnerId: null,
        players: state.players.map(p => ({ ...p, score: 0, totalScore: 0, hasJolly: false })),
        lastMessage: startMsg,
        usedPhraseIds: [phrase.id], targetWedgeIndex: null,
        wheelValues: [...WEDGE_VALUES],
      };
    }

    case 'SPIN_WHEEL': {
      const targetWedgeIndex = Math.floor(Math.random() * NUM_WEDGES);
      let spinMsg = '';
      switch (state.language) {
        case 'it': spinMsg = '🎡 La ruota sta girando...'; break;
        case 'en': spinMsg = '🎡 The wheel is spinning...'; break;
        case 'es': spinMsg = '🎡 La rueda está girando...'; break;
        case 'fr': spinMsg = '🎡 La roue tourne...'; break;
        case 'de': spinMsg = '🎡 Das Rad dreht sich...'; break;
      }
      return { ...state, turnState: 'waiting_action', targetWedgeIndex, lastMessage: spinMsg };
    }

    case 'WHEEL_STOPPED': {
      if (state.targetWedgeIndex === null) return state;
      const result = state.wheelValues[state.targetWedgeIndex];
      const cur = state.players[state.currentPlayerIndex];
      const base = { ...state, targetWedgeIndex: null };

      if (result === 'Bancarotta') {
        if (cur.hasJolly) {
          let bjMsg = '';
          switch (state.language) {
            case 'it': bjMsg = '💀 BANCAROTTA! Hai il Jolly — vuoi usarlo?'; break;
            case 'en': bjMsg = '💀 BANKRUPT! You have a Free Spin — do you want to use it?'; break;
            case 'es': bjMsg = '💀 ¡QUIEBRA! Tienes el comodín, ¿quieres usarlo?'; break;
            case 'fr': bjMsg = '💀 BANQUEROUTE ! Tu as le Joker — veux-tu l\'utiliser ?'; break;
            case 'de': bjMsg = '💀 BANKROTT! Du hast einen Joker — möchtest du ihn benutzen?'; break;
          }
          return { ...base, spinResult: result, turnState: 'jolly_choice', lastMessage: bjMsg };
        }
        const players = state.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, score: 0 } : p);
        let bMsg = '';
        switch (state.language) {
          case 'it': bMsg = `💀 BANCAROTTA! ${cur.name} perde tutto!`; break;
          case 'en': bMsg = `💀 BANKRUPT! ${cur.name} loses everything!`; break;
          case 'es': bMsg = `💀 ¡QUIEBRA! ¡${cur.name} lo pierde todo!`; break;
          case 'fr': bMsg = `💀 BANQUEROUTE ! ${cur.name} perd tout !`; break;
          case 'de': bMsg = `💀 BANKROTT! ${cur.name} verliert alles!`; break;
        }
        return nextPlayer({ ...base, players, lastMessage: bMsg });
      }

      if (result === 'Passa') {
        if (cur.hasJolly) {
          let pjMsg = '';
          switch (state.language) {
            case 'it': pjMsg = '➡️ PASSA! Hai il Jolly — vuoi usarlo?'; break;
            case 'en': pjMsg = '➡️ LOSE A TURN! You have a Free Spin — do you want to use it?'; break;
            case 'es': pjMsg = '➡️ ¡PIERDE EL TURNO! Tienes el comodín, ¿quieres usarlo?'; break;
            case 'fr': pjMsg = '➡️ PASSE LE TOUR ! Tu as le Joker — veux-tu l\'utiliser ?'; break;
            case 'de': pjMsg = '➡️ AUSSETZEN! Du hast einen Joker — möchtest du ihn benutzen?'; break;
          }
          return { ...base, spinResult: result, turnState: 'jolly_choice', lastMessage: pjMsg };
        }
        let pMsg = '';
        switch (state.language) {
          case 'it': pMsg = '➡️ Passa!'; break;
          case 'en': pMsg = '➡️ Lost turn!'; break;
          case 'es': pMsg = '➡️ ¡Pierde turno!'; break;
          case 'fr': pMsg = '➡️ Tour passé !'; break;
          case 'de': pMsg = '➡️ Aussetzen!'; break;
        }
        return nextPlayer({ ...base, lastMessage: pMsg });
      }

      if (result === 'Jolly') {
        let msg = '';
        switch (state.language) {
          case 'it': msg = `⭐ JOLLY! ${cur.name} indovina una consonante per prendere il Jolly!`; break;
          case 'en': msg = `⭐ JOLLY! ${cur.name} guess a consonant to earn the Free Spin!`; break;
          case 'es': msg = `⭐ COMODÍN! ${cur.name} ¡adivina una consonante para ganar el comodín!`; break;
          case 'fr': msg = `⭐ JOKER! ${cur.name} devine une consonne pour gagner le Joker !`; break;
          case 'de': msg = `⭐ JOKER! ${cur.name} errate einen Konsonanten, um den Joker zu gewinnen!`; break;
        }
        return { ...base, spinResult: result, turnState: 'waiting_letter', lastMessage: msg };
      }

      let spinValMsg = '';
      switch (state.language) {
        case 'it': spinValMsg = `💰 Girata: €${result}. Scegli una consonante!`; break;
        case 'en': spinValMsg = `💰 Spin value: €${result}. Choose a consonant!`; break;
        case 'es': spinValMsg = `💰 Valor: €${result}. ¡Elige una consonante!`; break;
        case 'fr': spinValMsg = `💰 Valeur : €${result}. Choisis une consonne !`; break;
        case 'de': spinValMsg = `💰 Drehung: €${result}. Wähle einen Konsonanten!`; break;
      }
      return { ...base, spinResult: result, turnState: 'waiting_letter', lastMessage: spinValMsg };
    }

    case 'USE_JOLLY': {
      const cur = state.players[state.currentPlayerIndex];
      const players = state.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, hasJolly: false } : p);
      let msg = '';
      if (state.spinResult === 'Bancarotta') {
        switch (state.language) {
          case 'it': msg = `⭐ Jolly usato! ${cur.name} evita la bancarotta!`; break;
          case 'en': msg = `⭐ Free Spin used! ${cur.name} avoids bankruptcy!`; break;
          case 'es': msg = `⭐ ¡Comodín usado! ¡${cur.name} evita la quiebra!`; break;
          case 'fr': msg = `⭐ Joker utilisé ! ${cur.name} évite la banqueroute !`; break;
          case 'de': msg = `⭐ Joker benutzt! ${cur.name} entgeht dem Bankrott!`; break;
        }
      } else {
        switch (state.language) {
          case 'it': msg = `⭐ Jolly usato! ${cur.name} mantiene il turno!`; break;
          case 'en': msg = `⭐ Free Spin used! ${cur.name} keeps their turn!`; break;
          case 'es': msg = `⭐ ¡Comodín usado! ¡${cur.name} mantiene el turno!`; break;
          case 'fr': msg = `⭐ Joker utilisé ! ${cur.name} garde son tour !`; break;
          case 'de': msg = `⭐ Joker benutzt! ${cur.name} behält den Zug!`; break;
        }
      }
      return { ...state, players, turnState: 'waiting_spin', spinResult: null, lastMessage: msg };
    }

    case 'SKIP_JOLLY': {
      const cur = state.players[state.currentPlayerIndex];
      const base = { ...state, spinResult: null, targetWedgeIndex: null };
      if (state.spinResult === 'Bancarotta') {
        const players = state.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, score: 0 } : p);
        let bMsg = '';
        switch (state.language) {
          case 'it': bMsg = `💀 BANCAROTTA! ${cur.name} perde tutto!`; break;
          case 'en': bMsg = `💀 BANKRUPT! ${cur.name} loses everything!`; break;
          case 'es': bMsg = `💀 ¡QUIEBRA! ¡${cur.name} lo pierde todo!`; break;
          case 'fr': bMsg = `💀 BANQUEROUTE ! ${cur.name} perd tout !`; break;
          case 'de': bMsg = `💀 BANKROTT! ${cur.name} verliert alles!`; break;
        }
        return nextPlayer({ ...base, players, lastMessage: bMsg });
      }
      let pMsg = '';
      switch (state.language) {
        case 'it': pMsg = '➡️ Passa!'; break;
        case 'en': pMsg = '➡️ Lost turn!'; break;
        case 'es': pMsg = '➡️ ¡Pierde turno!'; break;
        case 'fr': pMsg = '➡️ Tour passé !'; break;
        case 'de': pMsg = '➡️ Aussetzen!'; break;
      }
      return nextPlayer({ ...base, lastMessage: pMsg });
    }

    case 'GUESS_CONSONANT': {
      if (!state.currentPhrase) return state;
      const letter = action.payload;
      const count = state.currentPhrase.text.toUpperCase().split('').filter(c => c === letter).length;
      const isJollyFree = state.spinResult === 'Jolly';
      const cur = state.players[state.currentPlayerIndex];
      if (count > 0) {
        const earned = (!isJollyFree && typeof state.spinResult === 'number') ? count * state.spinResult : 0;
        const players = state.players.map((p, i) => i === state.currentPlayerIndex
          ? { ...p, score: p.score + earned, hasJolly: isJollyFree ? true : p.hasJolly }
          : p
        );
        let msg = '';
        if (isJollyFree) {
          switch (state.language) {
            case 'it': msg = `✅ ${count}× "${letter}"! ${cur.name} conquista il Jolly ⭐!`; break;
            case 'en': msg = `✅ ${count}× "${letter}"! ${cur.name} earns the Free Spin ⭐!`; break;
            case 'es': msg = `✅ ${count}× "${letter}"! ¡${cur.name} gana el comodín ⭐!`; break;
            case 'fr': msg = `✅ ${count}× "${letter}" ! ${cur.name} remporte le Joker ⭐ !`; break;
            case 'de': msg = `✅ ${count}× "${letter}"! ${cur.name} gewinnt den Joker ⭐!`; break;
          }
        } else {
          switch (state.language) {
            case 'it': msg = `✅ ${count}× "${letter}" = €${earned}! Ancora a ${cur.name}`; break;
            case 'en': msg = `✅ ${count}× "${letter}" = €${earned}! Still ${cur.name}'s turn`; break;
            case 'es': msg = `✅ ${count}× "${letter}" = €${earned}! Turno de ${cur.name}`; break;
            case 'fr': msg = `✅ ${count}× "${letter}" = €${earned} ! Encore à ${cur.name}`; break;
            case 'de': msg = `✅ ${count}× "${letter}" = €${earned}! Weiterhin ${cur.name} am Zug`; break;
          }
        }
        let wheelValues = state.wheelValues;
        if (isJollyFree) {
          wheelValues = state.wheelValues.map(v => v === 'Jolly' ? 500 : v);
        }
        return { ...state, guessedConsonants: [...state.guessedConsonants, letter], players, wheelValues, turnState: 'waiting_spin', spinResult: null, lastMessage: msg };
      }
      let noMsg = '';
      switch (state.language) {
        case 'it': noMsg = `❌ Nessuna "${letter}"!`; break;
        case 'en': noMsg = `❌ No "${letter}"!`; break;
        case 'es': noMsg = `❌ ¡Ninguna "${letter}"!`; break;
        case 'fr': noMsg = `❌ Aucune "${letter}" !`; break;
        case 'de': noMsg = `❌ Kein "${letter}"!`; break;
      }
      return nextPlayer({ ...state, guessedConsonants: [...state.guessedConsonants, letter], lastMessage: noMsg });
    }

    case 'BUY_VOWEL': {
      if (!state.currentPhrase) return state;
      const letter = action.payload;
      const cur = state.players[state.currentPlayerIndex];
      if (cur.score < 500) return state;
      const count = state.currentPhrase.text.toUpperCase().split('').filter(c => c === letter).length;
      const players = state.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, score: p.score - 500 } : p);
      if (count > 0) {
        let yesMsg = '';
        switch (state.language) {
          case 'it': yesMsg = `✅ ${count}× "${letter}" (−€500). Ancora a ${cur.name}`; break;
          case 'en': yesMsg = `✅ ${count}× "${letter}" (−€500). Still ${cur.name}'s turn`; break;
          case 'es': yesMsg = `✅ ${count}× "${letter}" (−€500). Turno de ${cur.name}`; break;
          case 'fr': yesMsg = `✅ ${count}× "${letter}" (−500 €). Encore à ${cur.name}`; break;
          case 'de': yesMsg = `✅ ${count}× "${letter}" (−500 €). Weiterhin ${cur.name} am Zug`; break;
        }
        return { ...state, guessedVowels: [...state.guessedVowels, letter], players, turnState: 'waiting_spin', lastMessage: yesMsg };
      }
      let noVowelMsg = '';
      switch (state.language) {
        case 'it': noVowelMsg = `❌ Nessuna "${letter}" (−€500).`; break;
        case 'en': noVowelMsg = `❌ No "${letter}" (−€500).`; break;
        case 'es': noVowelMsg = `❌ ¡Ninguna "${letter}"! (−€500).`; break;
        case 'fr': noVowelMsg = `❌ Aucune "${letter}" (−500 €).`; break;
        case 'de': noVowelMsg = `❌ Kein "${letter}" (−500 €).`; break;
      }
      return nextPlayer({ ...state, guessedVowels: [...state.guessedVowels, letter], players, lastMessage: noVowelMsg });
    }

    case 'SOLVE_PHRASE': {
      if (!state.currentPhrase) return state;
      const clean = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '');
      if (clean(action.payload) === clean(state.currentPhrase.text)) {
        const cur = state.players[state.currentPlayerIndex];
        const players = state.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, totalScore: p.totalScore + p.score } : p);
        let winMsg = '';
        switch (state.language) {
          case 'it': winMsg = `🎉 ${cur.name} ha indovinato!`; break;
          case 'en': winMsg = `🎉 ${cur.name} solved it!`; break;
          case 'es': winMsg = `🎉 ¡${cur.name} ha acertado!`; break;
          case 'fr': winMsg = `🎉 ${cur.name} a trouvé !`; break;
          case 'de': winMsg = `🎉 ${cur.name} hat gelöst!`; break;
        }
        return { ...state, status: 'round_over', players, winnerId: cur.id, lastMessage: winMsg };
      }
      let failMsg = '';
      switch (state.language) {
        case 'it': failMsg = '❌ Soluzione sbagliata!'; break;
        case 'en': failMsg = '❌ Wrong solution!'; break;
        case 'es': failMsg = '❌ ¡Solución incorrecta!'; break;
        case 'fr': failMsg = '❌ Mauvaise solution !'; break;
        case 'de': failMsg = '❌ Falsche Lösung!'; break;
      }
      return nextPlayer({ ...state, lastMessage: failMsg });
    }

    case 'NEXT_ROUND': {
      if (state.currentRound >= state.maxRounds) return { ...state, status: 'game_over' };
      const nextRound = state.currentRound + 1;
      const phrase = getRandomPhrase(state.language, state.difficulty, state.usedPhraseIds);
      let startMsg = '';
      switch (state.language) {
        case 'it': startMsg = `🎬 Round ${nextRound} — Inizia!`; break;
        case 'en': startMsg = `🎬 Round ${nextRound} — Begins!`; break;
        case 'es': startMsg = `🎬 ¡Ronda ${nextRound} — Comienza!`; break;
        case 'fr': startMsg = `🎬 Manche ${nextRound} — Commence !`; break;
        case 'de': startMsg = `🎬 Runde ${nextRound} — Start!`; break;
      }
      return {
        ...state, status: 'playing', currentRound: nextRound, currentPhrase: phrase,
        guessedConsonants: [], guessedVowels: [], turnState: 'waiting_spin', spinResult: null,
        winnerId: null, players: state.players.map(p => ({ ...p, score: 0 })),
        lastMessage: startMsg,
        usedPhraseIds: [...state.usedPhraseIds, phrase.id], targetWedgeIndex: null,
        wheelValues: [...WEDGE_VALUES],
      };
    }

    case 'TIMEOUT_PASS': {
      const cur = state.players[state.currentPlayerIndex];
      let msg = '';
      switch (state.language) {
        case 'it': msg = `⏰ Tempo scaduto per ${cur.name}!`; break;
        case 'en': msg = `⏰ Time's up for ${cur.name}!`; break;
        case 'es': msg = `⏰ ¡Tiempo agotado para ${cur.name}!`; break;
        case 'fr': msg = `⏰ Temps écoulé pour ${cur.name} !`; break;
        case 'de': msg = `⏰ Zeit abgelaufen für ${cur.name}!`; break;
      }
      return nextPlayer({ ...state, lastMessage: msg });
    }

    case 'FORCE_SKIP_TURN': {
      let msg = '';
      switch (state.language) {
        case 'it': msg = '⚠️ Sblocco: Turno passato forzatamente!'; break;
        case 'en': msg = '⚠️ Recovery: Turn skipped by force!'; break;
        case 'es': msg = '⚠️ Recuperación: ¡Turno saltado a la fuerza!'; break;
        case 'fr': msg = '⚠️ Récupération : Tour passé de force !'; break;
        case 'de': msg = '⚠️ Wiederherstellung: Zug erzwungen übersprungen!'; break;
      }
      return nextPlayer({ ...state, targetWedgeIndex: null, spinResult: null, botDeclaration: null, lastMessage: msg });
    }

    case 'FORCE_RESOLVE_ROUND': {
      if (!state.currentPhrase) return state;
      const cur = state.players[state.currentPlayerIndex];
      const players = state.players.map((p, i) => i === state.currentPlayerIndex ? { ...p, totalScore: p.totalScore + p.score } : p);
      let winMsg = '';
      switch (state.language) {
        case 'it': winMsg = `🎉 Risoluzione forzata! Vince ${cur.name}!`; break;
        case 'en': winMsg = `🎉 Forced solve! Winner is ${cur.name}!`; break;
        case 'es': winMsg = `🎉 ¡Resolución forzada! ¡Gana ${cur.name}!`; break;
        case 'fr': winMsg = `🎉 Résolution forcée ! ${cur.name} gagne !`; break;
        case 'de': winMsg = `🎉 Auflösung erzwungen! Es gewinnt ${cur.name}!`; break;
      }
      return { ...state, status: 'round_over', players, winnerId: cur.id, lastMessage: winMsg };
    }

    case 'FORCE_REROLL_PHRASE': {
      const phrase = getRandomPhrase(state.language, state.difficulty, state.usedPhraseIds);
      let msg = '';
      switch (state.language) {
        case 'it': msg = '🔄 Frase rigenerata per emergenza!'; break;
        case 'en': msg = '🔄 Phrase rerolled due to emergency!'; break;
        case 'es': msg = '🔄 ¡Frase regenerada por emergencia!'; break;
        case 'fr': msg = '🔄 Phrase régénérée en urgence !'; break;
        case 'de': msg = '🔄 Phrase wegen Notfalls neu gewürfelt!'; break;
      }
      return {
        ...state,
        currentPhrase: phrase,
        guessedConsonants: [],
        guessedVowels: [],
        turnState: 'waiting_spin',
        spinResult: null,
        targetWedgeIndex: null,
        botDeclaration: null,
        lastMessage: msg,
        usedPhraseIds: [...state.usedPhraseIds, phrase.id]
      };
    }

    case 'FORCE_SET_SPIN': {
      let msg = '';
      switch (state.language) {
        case 'it': msg = '⚡ Sblocco: Turno resettato a Gira!'; break;
        case 'en': msg = '⚡ Recovery: Turn reset to Spin!'; break;
        case 'es': msg = '⚡ Recuperación: ¡Turno restablecido a Girar!'; break;
        case 'fr': msg = '⚡ Récupération : Tour réinitialisé à Tourner !'; break;
        case 'de': msg = '⚡ Wiederherstellung: Zug zurückgesetzt auf Drehen!'; break;
      }
      return {
        ...state,
        turnState: 'waiting_spin',
        spinResult: null,
        targetWedgeIndex: null,
        botDeclaration: null,
        lastMessage: msg
      };
    }

    case 'RESTART_ROUND': {
      if (!state.currentPhrase) return state;
      let msg = '';
      switch (state.language) {
        case 'it': msg = '🔄 Round riavviato!'; break;
        case 'en': msg = '🔄 Round restarted!'; break;
        case 'es': msg = '🔄 ¡Ronda reiniciada!'; break;
        case 'fr': msg = '🔄 Manche redémarrée !'; break;
        case 'de': msg = '🔄 Runde neu gestartet!'; break;
      }
      return {
        ...state,
        guessedConsonants: [],
        guessedVowels: [],
        turnState: 'waiting_spin',
        spinResult: null,
        targetWedgeIndex: null,
        botDeclaration: null,
        players: state.players.map(p => ({ ...p, score: 0 })),
        lastMessage: msg
      };
    }

    default: return state;
  }
};

// ─── CONTEXT ─────────────────────────────────────────────────────────────────

interface GameCtx { state: GameState; dispatch: React.Dispatch<GameAction> }
const GameContext = createContext<GameCtx | null>(null);
const useGame = () => { const c = useContext(GameContext); if (!c) throw new Error('No GameContext'); return c; };

// ─── BOT LOGIC ────────────────────────────────────────────────────────────────

const LANG_CONSONANTS: Record<Language, string[]> = {
  it: ['R','T','S','N','L','C','M','P','D','V','G','F','B','Z','H','Q','X','K','Y','W','J'],
  en: ['T','N','S','H','R','D','L','C','M','W','F','G','Y','P','B','V','K','J','X','Q','Z'],
  es: ['S','R','N','D','L','C','T','M','P','B','G','V','Y','Q','H','F','Z','J','X','W','K'],
  fr: ['S','T','R','N','L','D','C','M','P','G','B','V','F','Q','H','X','Z','Y','W','K','J'],
  de: ['N','R','S','T','D','L','C','G','H','M','B','W','F','K','Z','P','V','J','Y','X','Q'],
};

const getBotAction = (state: GameState): GameAction | null => {
  if (state.status !== 'playing' || !state.currentPhrase) return null;
  const cur = state.players[state.currentPlayerIndex];
  if (cur.type !== 'bot') return null;

  if (state.turnState === 'jolly_choice') return { type: 'USE_JOLLY' };

  if (state.turnState === 'waiting_spin') {
    const txt = state.currentPhrase.text.toUpperCase().replace(/ /g, '');
    const revealed = txt.split('').filter(c => state.guessedConsonants.includes(c) || state.guessedVowels.includes(c)).length;
    const pct = revealed / txt.length;

    const phraseConsonants = state.currentPhrase.text.toUpperCase().split('').filter(c => CONSONANTS.includes(c));
    const remainingConsons = phraseConsonants.filter(c => !state.guessedConsonants.includes(c));
    const hasCons = remainingConsons.length > 0;

    // If no consonants left, bot MUST either solve or buy vowel (if it has money)
    if (!hasCons) {
      if (cur.score >= 500) {
        const unrevealedVowels = VOWELS.filter(v => !state.guessedVowels.includes(v));
        if (unrevealedVowels.length > 0) {
          let vowel = unrevealedVowels[Math.floor(Math.random() * unrevealedVowels.length)];
          const usefulVowels = unrevealedVowels.filter(v => state.currentPhrase!.text.toUpperCase().includes(v));
          if (usefulVowels.length > 0) {
            vowel = usefulVowels[0];
          }
          return { type: 'BUY_VOWEL', payload: vowel };
        }
      }
      // If it cannot buy a vowel, it must try to solve
      return { type: 'SOLVE_PHRASE', payload: state.currentPhrase.text };
    }
    
    // Check solve
    if (state.difficulty === 'hard' && pct >= 0.5) return { type: 'SOLVE_PHRASE', payload: state.currentPhrase.text };
    if (state.difficulty === 'medium' && pct >= 0.75 && Math.random() > 0.4) return { type: 'SOLVE_PHRASE', payload: state.currentPhrase.text };
    
    // Check buy vowel
    if (cur.score >= 500) {
      const unrevealedVowels = VOWELS.filter(v => !state.guessedVowels.includes(v));
      if (unrevealedVowels.length > 0) {
        let shouldBuy = false;
        if (state.difficulty === 'hard') {
          shouldBuy = Math.random() < 0.65;
        } else if (state.difficulty === 'medium') {
          shouldBuy = Math.random() < 0.45;
        } else {
          shouldBuy = Math.random() < 0.25;
        }
        
        if (shouldBuy) {
          let vowel = unrevealedVowels[Math.floor(Math.random() * unrevealedVowels.length)];
          if (state.difficulty === 'hard') {
            const usefulVowels = unrevealedVowels.filter(v => state.currentPhrase!.text.toUpperCase().includes(v));
            if (usefulVowels.length > 0) {
              vowel = usefulVowels[0];
            }
          }
          return { type: 'BUY_VOWEL', payload: vowel };
        }
      }
    }
    
    return { type: 'SPIN_WHEEL' };
  }

  if (state.turnState === 'waiting_letter') {
    const freq = LANG_CONSONANTS[state.language];
    const available = freq.filter(c => !state.guessedConsonants.includes(c));
    if (available.length === 0) return { type: 'SPIN_WHEEL' };
    let letter = available[0];
    if (state.difficulty === 'easy') letter = available[Math.floor(Math.random() * available.length)];
    else if (state.difficulty === 'hard') {
      const useful = available.filter(c => state.currentPhrase!.text.toUpperCase().includes(c));
      if (useful.length > 0) letter = useful[0];
    }
    return { type: 'GUESS_CONSONANT', payload: letter };
  }
  return null;
};

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const card = (opts?: Partial<React.CSSProperties>): React.CSSProperties => ({
  background: EA.surface,
  border: `1px solid ${EA.outline}`,
  borderRadius: EA.lg,
  ...opts,
});

const primaryBtn: React.CSSProperties = {
  background: EA.primary,
  color: '#fff',
  border: 'none',
  borderBottom: `3px solid ${EA.primaryHov}`,
  borderRadius: EA.md,
  fontFamily: EA.fHead,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.12s',
  letterSpacing: '0.05em',
};

const labelTxt: React.CSSProperties = {
  fontFamily: EA.fLabel,
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: EA.onMuted,
  display: 'block',
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: EA.md,
  border: `1px solid ${EA.outline2}`,
  background: EA.surface2,
  color: EA.onBg,
  fontSize: 14,
  fontFamily: EA.fBody,
  fontWeight: 600,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  paddingRight: 38,
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%230052FF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '14px',
};

const optionStyle: React.CSSProperties = { background: EA.surface2, color: EA.onBg };

// ─── BOARD ───────────────────────────────────────────────────────────────────

const Board = ({ phrase, revealed }: { phrase: Phrase | null; revealed: string[] }) => {
  const { state } = useGame();
  const t = TRANSLATIONS[state.language];
  const base: React.CSSProperties = {
    ...card({ padding: '18px 16px', width: '100%', maxWidth: 960, margin: '0 auto', minHeight: 152 }),
    boxShadow: `0 0 0 1px ${EA.outline}, 0 4px 32px rgba(0,82,255,0.1)`,
  };

  if (!phrase) return (
    <div style={base}>
      <p style={{ color: EA.onMuted, textAlign: 'center', fontSize: 22, fontWeight: 800, letterSpacing: 8, margin: 0, fontFamily: EA.fHead }}>{t.spinning.toUpperCase()}</p>
    </div>
  );

  return (
    <div style={base}>
      {/* Category badge */}
      <div style={{ marginBottom: 14 }}>
        <span style={{
          display: 'inline-block',
          background: EA.primaryDim,
          border: `1px solid ${EA.primary}55`,
          borderRadius: EA.full,
          padding: '3px 12px',
          fontFamily: EA.fLabel,
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#60A5FA',
        }}>{phrase.category}</span>
      </div>

      {/* Letter grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 12px' }}>
        {phrase.text.split(' ').map((word, wi) => (
          <div key={wi} style={{ display: 'flex', gap: 3 }}>
            {word.split('').map((char, ci) => {
              const show = revealed.includes(char);
              return (
                <motion.div
                  key={ci}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: show ? 360 : 0 }}
                  transition={{ duration: 0.32 }}
                  style={{
                    width: 36, height: 48,
                    background: show ? '#fff' : EA.surface2,
                    border: `1.5px solid ${show ? EA.primary : EA.outline}`,
                    borderRadius: EA.sm,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900,
                    fontFamily: EA.fHead,
                    color: show ? EA.bg : 'transparent',
                    boxShadow: show ? `0 0 12px ${EA.primary}44` : 'none',
                    transition: 'background 0.3s, border-color 0.3s',
                  }}
                >{char}</motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── KEYBOARD ─────────────────────────────────────────────────────────────────

const VOWELS = ['A','E','I','O','U'];
const CONSONANTS = ['B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z'];

const KeyboardPanel = ({ disabled, canBuyVowel, onLetter }: {
  disabled: boolean; canBuyVowel: boolean; onLetter: (l: string, v: boolean) => void;
}) => {
  const { state } = useGame();
  const lang = state.language;

  const vowelsLabel = lang === 'it' ? 'Vocali'
                    : lang === 'en' ? 'Vowels'
                    : lang === 'es' ? 'Vocales'
                    : lang === 'fr' ? 'Voyelles'
                    : 'Vokale';

  const consonantsLabel = lang === 'it' ? 'Consonanti'
                        : lang === 'en' ? 'Consonants'
                        : lang === 'es' ? 'Consonantes'
                        : lang === 'fr' ? 'Consonnes'
                        : 'Konsonanten';

  const key = (_l: string, used: boolean, isVowel: boolean): React.CSSProperties => {
    const isBotActiveLetter = state.botDeclaration?.type === 'letter' && state.botDeclaration?.value === _l;

    if (isBotActiveLetter) {
      return {
        width: isVowel ? 48 : 38,
        height: isVowel ? 52 : 44,
        border: 'none',
        borderRadius: EA.sm,
        fontFamily: EA.fHead,
        fontWeight: 900,
        fontSize: isVowel ? 20 : 16,
        cursor: 'not-allowed',
        background: EA.tertiary,
        color: '#121214',
        transform: 'scale(1.2)',
        boxShadow: `0 0 20px ${EA.tertiary}`,
        zIndex: 10,
        transition: 'all 0.2s',
      };
    }

    return {
      width: isVowel ? 48 : 38,
      height: isVowel ? 52 : 44,
      border: 'none',
      borderBottom: used ? 'none' : isVowel
        ? `2px solid ${EA.secondaryHov ?? '#5b1ea0'}`
        : `2px solid ${EA.primaryHov}`,
      borderRadius: EA.sm,
      fontFamily: EA.fHead,
      fontWeight: 800,
      fontSize: isVowel ? 17 : 14,
      cursor: used || disabled || (isVowel && !canBuyVowel) ? 'not-allowed' : 'pointer',
      opacity: used ? 0.28 : (isVowel && !canBuyVowel) ? 0.45 : 1,
      background: used
        ? EA.surface2
        : isVowel
          ? EA.secondary
          : EA.primary,
      color: '#fff',
      transition: 'all 0.1s',
      boxShadow: used ? 'none' : `0 2px 8px ${isVowel ? EA.secondary : EA.primary}55`,
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: '100%' }}>
      <span style={{ ...labelTxt, marginBottom: 4 }}>{vowelsLabel} — €500</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {VOWELS.map(v => (
          <button key={v} style={key(v, state.guessedVowels.includes(v), true)}
            disabled={disabled || state.guessedVowels.includes(v) || !canBuyVowel}
            onClick={() => onLetter(v, true)}>{v}
          </button>
        ))}
      </div>
      <span style={{ ...labelTxt, marginTop: 6, marginBottom: 4 }}>{consonantsLabel}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', maxWidth: 340 }}>
        {CONSONANTS.map(c => (
          <button key={c} style={key(c, state.guessedConsonants.includes(c), false)}
            disabled={disabled || state.guessedConsonants.includes(c)}
            onClick={() => onLetter(c, false)}>{c}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── LANGUAGE SELECT ──────────────────────────────────────────────────────────

const LanguageSelect = () => {
  const { dispatch } = useGame();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${EA.primary}22 0%, ${EA.bg} 70%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 450 }}>
        
        {/* Glow badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: EA.primaryDim,
          border: `1px solid ${EA.primary}55`,
          borderRadius: EA.full,
          padding: '5px 16px',
          marginBottom: 24
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: EA.primary, display: 'inline-block', boxShadow: `0 0 8px ${EA.primary}` }} />
          <span style={{ fontFamily: EA.fLabel, fontWeight: 600, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#60A5FA' }}>Gira la Ruota Show</span>
        </div>

        {/* Multilingual Title */}
        <h1 style={{
          margin: '0 0 8px',
          fontFamily: EA.fHead,
          fontWeight: 900,
          fontSize: 'clamp(28px, 6vw, 42px)',
          letterSpacing: '-0.02em',
          textAlign: 'center',
          background: `linear-gradient(135deg, #fff 30%, ${EA.primary} 70%, ${EA.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
        }}>
          Select Language
        </h1>
        <p style={{
          margin: '0 0 40px',
          fontFamily: EA.fBody,
          color: EA.onMuted,
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Scegli la lingua • Choose your language • Elige el idioma
        </p>

        {/* Grid of buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: '100%',
        }}>
          {languages.map(lang => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${EA.primary}22`, borderColor: EA.primary }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: lang.code })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 24px',
                background: EA.surface,
                border: `1.5px solid ${EA.outline}`,
                borderRadius: EA.lg,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 28 }}>{lang.flag}</span>
              <span style={{ fontFamily: EA.fBody, fontSize: 16, fontWeight: 700, color: EA.onBg }}>{lang.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── LOBBY ────────────────────────────────────────────────────────────────────

const Lobby = () => {
  const { state, dispatch } = useGame();
  const [localMode, setLocalMode] = useState<GameMode>('1_round');
  const [localDifficulty, setLocalDifficulty] = useState<Difficulty>('easy');
  const [playerMode, setPlayerMode] = useState<'bots' | 'friends' | 'online'>('bots');
  const [friendNames, setFriendNames] = useState(['', '']);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const language = state.language;
  const t = TRANSLATIONS[language];

  const gameTitle = language === 'it' ? 'Il gioco delle lettere'
                  : language === 'en' ? 'The game of letters'
                  : language === 'es' ? 'El juego de las letras'
                  : language === 'fr' ? 'Le jeu des lettres'
                  : 'Das Buchstabenspiel';

  const humanName = state.players.find(p => p.id === state.myPlayerId)?.name ?? '';
  const mode = state.isOnline ? state.mode : localMode;
  const difficulty = state.isOnline ? state.difficulty : localDifficulty;

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 8px',
    border: `1.5px solid ${active ? EA.primary : EA.outline}`,
    borderRadius: EA.md,
    fontFamily: EA.fBody,
    fontWeight: 700,
    fontSize: 13,
    background: active ? EA.primaryDim : 'transparent',
    color: active ? EA.primary : EA.onMuted,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = async () => {
    if (!db) return;
    const code = generateRoomCode();
    const myId = state.myPlayerId;
    const name = humanName || t.you;
    const initialPlayers = [makeHuman(myId, name)];
    
    const newLobbyState: GameState = {
      status: 'lobby',
      mode: localMode,
      difficulty: localDifficulty,
      language: state.language,
      players: initialPlayers,
      currentPlayerIndex: 0,
      currentRound: 1,
      maxRounds: localMode === '1_round' ? 1 : localMode === 'half_game' ? 3 : 5,
      currentPhrase: null,
      guessedConsonants: [],
      guessedVowels: [],
      spinResult: null,
      turnState: 'waiting_spin',
      winnerId: null,
      lastMessage: 'Stanza creata! In attesa di altri giocatori...',
      usedPhraseIds: [],
      targetWedgeIndex: null,
      botDeclaration: null,
      wheelValues: [...WEDGE_VALUES],
      isOnline: true,
      roomCode: code,
      myPlayerId: myId,
      hostId: myId,
    };

    try {
      await set(ref(db, `rooms/${code}/state`), newLobbyState);
      dispatch({
        type: 'SET_ONLINE_INFO',
        payload: { isOnline: true, roomCode: code, myPlayerId: myId, hostId: myId }
      });
    } catch (err) {
      console.error("Error creating room:", err);
      setOnlineError("Errore durante la creazione della stanza.");
    }
  };

  const handleJoinRoom = async () => {
    if (!db) return;
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) return;
    setOnlineError(null);
    
    try {
      const snapshot = await get(ref(db, `rooms/${code}/state`));
      if (!snapshot.exists()) {
        setOnlineError(t.roomNotFound);
        return;
      }
      const remoteState = snapshot.val();
      if (remoteState.status !== 'lobby') {
        setOnlineError(t.roomNotFound);
        return;
      }
      const playersList = remoteState.players || [];
      if (playersList.length >= 3) {
        setOnlineError(t.roomFull);
        return;
      }
      
      const myId = state.myPlayerId;
      const name = humanName || t.you;
      
      const updatedPlayers = [...playersList, makeHuman(myId, name)];
      
      await set(ref(db, `rooms/${code}/state/players`), updatedPlayers);
      
      dispatch({
        type: 'SET_ONLINE_INFO',
        payload: { isOnline: true, roomCode: code, myPlayerId: myId, hostId: remoteState.hostId }
      });
    } catch (err) {
      console.error("Error joining room:", err);
      setOnlineError("Errore di connessione.");
    }
  };

  const handleLeaveRoom = async () => {
    if (!state.roomCode) return;
    const code = state.roomCode;
    
    dispatch({
      type: 'SET_ONLINE_INFO',
      payload: { isOnline: false, roomCode: null, myPlayerId: state.myPlayerId, hostId: null }
    });

    if (!db) return;
    try {
      if (state.myPlayerId === state.hostId) {
        await remove(ref(db, `rooms/${code}`));
      } else {
        const updatedPlayers = state.players.filter(p => p.id !== state.myPlayerId);
        await set(ref(db, `rooms/${code}/state/players`), updatedPlayers);
      }
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  };

  const handleModeChange = (newMode: GameMode) => {
    if (db && state.isOnline && state.roomCode) {
      set(ref(db, `rooms/${state.roomCode}/state/mode`), newMode);
      set(ref(db, `rooms/${state.roomCode}/state/maxRounds`), newMode === '1_round' ? 1 : newMode === 'half_game' ? 3 : 5);
    } else {
      setLocalMode(newMode);
    }
  };

  const handleDifficultyChange = (newDiff: Difficulty) => {
    if (db && state.isOnline && state.roomCode) {
      set(ref(db, `rooms/${state.roomCode}/state/difficulty`), newDiff);
    } else {
      setLocalDifficulty(newDiff);
    }
  };

  const handleStart = async () => {
    if (state.isOnline) {
      if (!db || state.myPlayerId !== state.hostId || !state.roomCode) return;
      
      let players = [...state.players];
      if (players.length < 3) {
        if (players.length === 1) {
          players.push(makeBot('bot_1', '🤖 Bot Alfa'));
          players.push(makeBot('bot_2', '🤖 Bot Beta'));
        } else if (players.length === 2) {
          players.push(makeBot('bot_1', '🤖 Bot Alfa'));
        }
      }

      const phrase = getRandomPhrase(state.language, state.difficulty, []);
      const maxRounds = state.mode === '1_round' ? 1 : state.mode === 'half_game' ? 3 : 5;
      
      let startMsg = '';
      switch (state.language) {
        case 'it': startMsg = '🎬 Inizia il gioco! In bocca al lupo!'; break;
        case 'en': startMsg = '🎬 Game starts! Good luck!'; break;
        case 'es': startMsg = '🎬 ¡Empieza el juego! ¡Buena suerte!'; break;
        case 'fr': startMsg = '🎬 Le jeu commence ! Bonne chance !'; break;
        case 'de': startMsg = '🎬 Das Spiel beginnt! Viel Glück!'; break;
      }

      const newPlayingState: GameState = {
        ...state,
        status: 'playing',
        players: players.map(p => ({ ...p, score: 0, totalScore: 0, hasJolly: false })),
        currentRound: 1,
        maxRounds,
        currentPhrase: phrase,
        guessedConsonants: [],
        guessedVowels: [],
        currentPlayerIndex: 0,
        turnState: 'waiting_spin',
        spinResult: null,
        winnerId: null,
        lastMessage: startMsg,
        usedPhraseIds: [phrase.id],
        targetWedgeIndex: null,
        botDeclaration: null,
        wheelValues: [...WEDGE_VALUES],
      };

      await set(ref(db, `rooms/${state.roomCode}/state`), newPlayingState);
    } else {
      let players: Player[];
      if (playerMode === 'bots') {
        players = [
          makeHuman(state.myPlayerId, humanName || t.you),
          makeBot('bot_1', '🤖 Bot Alfa'),
          makeBot('bot_2', '🤖 Bot Beta'),
        ];
      } else {
        players = [
          makeHuman(state.myPlayerId, humanName || t.you),
          makeHuman('player_2', friendNames[0].trim() || t.playerXName(2)),
          makeHuman('player_3', friendNames[1].trim() || t.playerXName(3)),
        ];
      }
      dispatch({ type: 'SET_PLAYERS', payload: players });
      setTimeout(() => dispatch({ type: 'START_GAME', payload: { mode: localMode, language, difficulty: localDifficulty } }), 0);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${EA.primary}22 0%, ${EA.bg} 70%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 900 }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: EA.primaryDim, border: `1px solid ${EA.primary}55`, borderRadius: EA.full, padding: '5px 16px', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: EA.primary, display: 'inline-block', boxShadow: `0 0 8px ${EA.primary}` }} />
            <span style={{ fontFamily: EA.fLabel, fontWeight: 600, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#60A5FA' }}>{gameTitle}</span>
          </div>

          <h1 style={{
            margin: 0,
            fontSize: 'clamp(40px, 7vw, 68px)',
            fontWeight: 900,
            fontFamily: EA.fHead,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            background: `linear-gradient(135deg, #fff 30%, ${EA.primary} 70%, ${EA.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {t.lobbyTitle}
          </h1>
          <p style={{ margin: '10px 0 0', fontFamily: EA.fBody, color: EA.onMuted, fontSize: 15 }}>
            {t.lobbySubtitle}
          </p>

          {/* Change Language button */}
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => dispatch({ type: 'RESET_TO_LANGUAGE_SELECT' })}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${EA.outline}`,
                borderRadius: EA.full,
                padding: '6px 16px',
                color: EA.onBg,
                fontFamily: EA.fLabel,
                fontWeight: 600,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = EA.primary;
                e.currentTarget.style.background = EA.primaryDim;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = EA.outline;
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              {t.changeLanguage}
            </button>
          </div>
        </div>

        {/* ── Card ── */}
        <div style={{
          ...card({ padding: 36 }),
          boxShadow: `0 0 0 1px ${EA.outline}, 0 32px 80px rgba(0,0,0,0.6)`,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>

            {/* LEFT – Players */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${EA.outline}` }}>
                <h2 style={{ margin: 0, fontFamily: EA.fHead, fontWeight: 800, fontSize: 16, color: EA.onBg }}>{t.players}</h2>
                <span style={{ fontFamily: EA.fLabel, fontSize: 10, letterSpacing: 2, color: EA.onMuted, textTransform: 'uppercase' }}>
                  {state.isOnline ? `${state.players.length} / 3` : '3 / 3'}
                </span>
              </div>

              {/* Opponent toggle */}
              {!state.isOnline && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  <button style={tabBtn(playerMode === 'bots')} onClick={() => setPlayerMode('bots')}>{t.vsBots}</button>
                  <button style={tabBtn(playerMode === 'friends')} onClick={() => setPlayerMode('friends')}>{t.withFriends}</button>
                  <button style={tabBtn(playerMode === 'online')} onClick={() => setPlayerMode('online')}>{t.online}</button>
                </div>
              )}

              {/* Your name (when not in online room) */}
              {!state.isOnline && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelTxt}>{t.yourName}</label>
                  <input
                    value={humanName}
                    onChange={e => dispatch({ type: 'UPDATE_PLAYER_NAME', payload: { id: state.myPlayerId, name: e.target.value } })}
                    placeholder={`${t.yourName}...`} maxLength={15}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = EA.primary)}
                    onBlur={e => (e.target.style.borderColor = EA.outline2)}
                  />
                </div>
              )}

              {/* Off-line Bot panel */}
              {!state.isOnline && playerMode === 'bots' && (
                <div style={{ ...card({ padding: '14px 16px', background: EA.surface2 }), marginTop: 4 }}>
                  <p style={{ margin: 0, fontFamily: EA.fBody, fontSize: 13, color: EA.onMuted, lineHeight: 1.7 }}>
                    {t.botDisclaimer}
                  </p>
                </div>
              )}

              {/* Off-line Friends inputs */}
              {!state.isOnline && playerMode === 'friends' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[0, 1].map(i => (
                    <div key={i}>
                      <label style={labelTxt}>{t.players} {i + 2}</label>
                      <input
                        value={friendNames[i]}
                        onChange={e => { const n = [...friendNames]; n[i] = e.target.value; setFriendNames(n); }}
                        placeholder={t.playerXName(i + 2)} maxLength={15}
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = EA.primary)}
                        onBlur={e => (e.target.style.borderColor = EA.outline2)}
                      />
                    </div>
                  ))}
                  <p style={{ margin: 0, fontFamily: EA.fBody, fontSize: 12, color: `${EA.onMuted}88`, fontStyle: 'italic' }}>
                    {t.passDevice}
                  </p>
                </div>
              )}

              {/* Online Multiplayer Lobby Setup */}
              {!state.isOnline && playerMode === 'online' && (
                db ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                    <button
                      onClick={handleCreateRoom}
                      style={{
                        ...primaryBtn,
                        padding: '12px 0',
                        fontSize: 14,
                        boxShadow: `0 4px 14px ${EA.primary}33`,
                      }}
                    >
                      {t.createRoom}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <input
                        value={roomCodeInput}
                        onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                        placeholder={t.enterRoomCode}
                        maxLength={5}
                        style={{ ...inputStyle, flex: 1, textAlign: 'center', letterSpacing: '0.15em', fontWeight: 700 }}
                      />
                      <button
                        onClick={handleJoinRoom}
                        style={{
                          ...primaryBtn,
                          background: EA.secondary,
                          borderBottomColor: EA.secondaryHov,
                          padding: '12px 20px',
                          fontSize: 14,
                          boxShadow: `0 4px 14px ${EA.secondary}33`,
                        }}
                      >
                        {t.connect}
                      </button>
                    </div>

                    {onlineError && (
                      <p style={{ margin: 0, fontFamily: EA.fBody, fontSize: 13, color: EA.error, fontWeight: 600, textAlign: 'center' }}>
                        {onlineError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ ...card({ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.08)', border: `1px solid ${EA.error}44` }), marginTop: 8 }}>
                    <p style={{ margin: 0, fontFamily: EA.fBody, fontSize: 13, color: EA.error, fontWeight: 600, lineHeight: 1.6 }}>
                      {state.language === 'it'
                        ? "⚠️ La modalità online non è configurata. Per giocare online, inserisci i parametri del database nel file .env (in locale) o nelle impostazioni di Vercel."
                        : "⚠️ Online mode is not configured. To play online, please set the database environment variables in your local .env file or Vercel dashboard."}
                    </p>
                  </div>
                )
              )}

              {/* Online Active Waiting Lobby Room */}
              {state.isOnline && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Room code display */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: EA.surface2, border: `1.5px solid ${EA.outline}`, borderRadius: EA.md, padding: '12px 16px'
                  }}>
                    <div>
                      <span style={{ fontFamily: EA.fLabel, fontSize: 11, color: EA.onMuted, textTransform: 'uppercase' }}>{t.roomCode}</span>
                      <div style={{ fontFamily: EA.fHead, fontWeight: 900, fontSize: 22, color: EA.tertiary, letterSpacing: '0.1em', marginTop: 2 }}>{state.roomCode}</div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(state.roomCode || '');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.04)', border: `1px solid ${EA.outline2}`, borderRadius: EA.sm,
                        color: EA.onBg, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: EA.fBody, fontWeight: 700, fontSize: 12, transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    >
                      {copied ? <Check size={14} color={EA.success} /> : <Copy size={14} />}
                      {copied ? t.copied : t.copyCode}
                    </button>
                  </div>

                  {/* Player slots */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Array.from({ length: 3 }).map((_, idx) => {
                      const p = state.players[idx];
                      return (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: p ? (p.id === state.myPlayerId ? EA.primaryDim : EA.surface2) : 'rgba(255,255,255,0.01)',
                          border: `1px dashed ${p ? (p.id === state.myPlayerId ? EA.primary : EA.outline) : EA.outline}`,
                          borderRadius: EA.md, padding: '10px 14px', height: 48
                        }}>
                          <Users size={16} color={p ? EA.primary : EA.onMuted} />
                          {p ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                              <span style={{ fontFamily: EA.fBody, fontWeight: 700, fontSize: 13, color: EA.onBg }}>
                                {p.name} {p.id === state.myPlayerId ? `(${t.you})` : ''}
                              </span>
                              {p.id === state.hostId && (
                                <span style={{ background: EA.tertiaryDim, border: `1px solid ${EA.tertiary}`, color: EA.tertiary, borderRadius: EA.sm, padding: '2px 6px', fontFamily: EA.fLabel, fontSize: 9, fontWeight: 700 }}>HOST</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontFamily: EA.fBody, fontSize: 13, color: EA.onMuted, fontStyle: 'italic' }}>
                              {t.waitingPlayers}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Disconnect/Leave Room */}
                  <button
                    onClick={handleLeaveRoom}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${EA.error}33`, borderRadius: EA.md,
                      color: EA.error, padding: '12px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: EA.fBody, fontWeight: 700, fontSize: 13, transition: 'all 0.2s', marginTop: 12
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    <LogOut size={14} />
                    {t.leaveRoom}
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT – Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${EA.outline}` }}>
                <h2 style={{ margin: 0, fontFamily: EA.fHead, fontWeight: 800, fontSize: 16, color: EA.onBg }}>{t.settings}</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
                <div>
                  <label style={labelTxt}>{t.mode}</label>
                  <select
                    value={mode}
                    onChange={e => handleModeChange(e.target.value as GameMode)}
                    disabled={state.isOnline && state.myPlayerId !== state.hostId}
                    style={selectStyle}
                  >
                    <option value="1_round" style={optionStyle}>{t.singleRound}</option>
                    <option value="half_game" style={optionStyle}>{t.halfGame}</option>
                    <option value="full_game" style={optionStyle}>{t.fullGame}</option>
                  </select>
                </div>

                <div>
                  <label style={labelTxt}>{t.difficulty}</label>
                  <select
                    value={difficulty}
                    onChange={e => handleDifficultyChange(e.target.value as Difficulty)}
                    disabled={state.isOnline && state.myPlayerId !== state.hostId}
                    style={selectStyle}
                  >
                    <option value="easy" style={optionStyle}>{t.easy}</option>
                    <option value="medium" style={optionStyle}>{t.medium}</option>
                    <option value="hard" style={optionStyle}>{t.hard}</option>
                  </select>
                </div>
              </div>

              {/* Action Button: Play Now or Waiting Host */}
              {state.isOnline && state.myPlayerId !== state.hostId ? (
                <div style={{
                  background: EA.surface2, border: `1.5px solid ${EA.outline}`, borderRadius: EA.lg,
                  padding: '17px 0', fontSize: 14, fontFamily: EA.fHead, fontWeight: 700, color: EA.onMuted,
                  textAlign: 'center', marginTop: 28, textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>
                  {t.waitingHost}
                </div>
              ) : (
                <motion.button
                  onClick={handleStart}
                  whileTap={{ scale: 0.97, y: 2 }}
                  style={{
                    ...primaryBtn,
                    width: '100%',
                    padding: '17px 0',
                    fontSize: 16,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderRadius: EA.lg,
                    marginTop: 28,
                    boxShadow: `0 4px 20px ${EA.primary}55`,
                  }}
                >
                  {t.playNow}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────

const GameScreen = ({ wheelRotation, isSpinning }: { wheelRotation: number; isSpinning: boolean }) => {
  const { state, dispatch } = useGame();
  const [solveModal, setSolveModal] = useState(false);
  const [solveInput, setSolveInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [showRecovery, setShowRecovery] = useState(false);

  const t = TRANSLATIONS[state.language];

  const cur = state.players[state.currentPlayerIndex];
  const isHumanTurn = cur?.type === 'human';
  const isMyTurn = state.isOnline ? cur?.id === state.myPlayerId : cur?.type === 'human';
  const canBuyVowel = (cur?.score ?? 0) >= 500;
  const revealed = [...state.guessedConsonants, ...state.guessedVowels];

  const phraseConsonants = state.currentPhrase?.text.toUpperCase().split('').filter(c => CONSONANTS.includes(c)) ?? [];
  const remainingConsons = phraseConsonants.filter(c => !state.guessedConsonants.includes(c));
  const hasCons = remainingConsons.length > 0;

  const handleSolve = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SOLVE_PHRASE', payload: solveInput });
    setSolveModal(false);
    setSolveInput('');
  };

  useEffect(() => {
    setTimeLeft(15);
  }, [state.currentPlayerIndex, state.turnState, solveModal]);

  useEffect(() => {
    if (state.status !== 'playing' || !isHumanTurn || isSpinning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (isMyTurn) {
            dispatch({ type: 'TIMEOUT_PASS' });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.status, isHumanTurn, isSpinning, state.currentPlayerIndex, state.turnState, solveModal, dispatch, isMyTurn]);

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse 80% 50% at 50% -5%, ${EA.primary}1a 0%, ${EA.bg} 65%)`,
      padding: '12px 16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>

      {/* ── Top bar ── */}
      <div style={{
        width: '100%', maxWidth: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        ...card({ padding: '10px 20px', borderRadius: EA.md }),
        backdropFilter: 'blur(10px)',
      }}>
        <span style={{ fontFamily: EA.fLabel, fontWeight: 700, fontSize: 12, letterSpacing: '0.12em', color: EA.primary, textTransform: 'uppercase' }}>
          {t.roundXofY(state.currentRound, state.maxRounds)}
        </span>
        <motion.span
          key={state.lastMessage}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: EA.fBody, fontWeight: 600, fontSize: 14, color: EA.onSurface, flex: 1, textAlign: 'center', padding: '0 16px' }}
        >
          {state.lastMessage}
        </motion.span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isMyTurn && (state.turnState === 'waiting_spin' || state.turnState === 'waiting_letter' || state.turnState === 'jolly_choice') && !isSpinning && (
            <motion.span
              animate={timeLeft <= 5 ? { scale: [1, 1.05, 1], opacity: [1, 0.6, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{
                fontFamily: EA.fLabel, fontSize: 12, fontWeight: 800,
                color: timeLeft <= 5 ? EA.error : EA.tertiary,
                background: timeLeft <= 5 ? 'rgba(239,68,68,0.15)' : 'rgba(255,215,0,0.15)',
                border: `1px solid ${timeLeft <= 5 ? EA.error : EA.tertiary}`,
                borderRadius: EA.sm, padding: '3px 8px',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              ⏱️ {timeLeft}s
            </motion.span>
          )}
          <span style={{ fontFamily: EA.fLabel, fontSize: 11, color: EA.onMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {cur?.name}
          </span>
          <button onClick={() => setShowRecovery(true)}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${EA.error}55`,
              borderRadius: EA.sm,
              padding: '4px 10px',
              fontFamily: EA.fLabel,
              fontSize: 10,
              fontWeight: 700,
              color: EA.error,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
          >
            <LifeBuoy size={11} style={{ animation: 'spin 12s linear infinite' }} />
            {t.unlockBtn}
          </button>
        </div>
      </div>

      {/* ── Board ── */}
      <Board phrase={state.currentPhrase} revealed={revealed} />

      {/* ── Spinning wheel overlay ── */}
      <AnimatePresence>
        {isSpinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(10,10,18,0.95)',
              backdropFilter: 'blur(14px)',
              zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24,
            }}
          >
            <div style={{ fontFamily: EA.fLabel, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: EA.primary, opacity: 0.7 }}>
              {t.spinning}
            </div>
            <WheelSVG rotation={wheelRotation} size={500} language={state.language} wheelValues={state.wheelValues} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main grid ── */}
      <div style={{ width: '100%', maxWidth: 1000, display: 'grid', gridTemplateColumns: '210px 1fr 260px', gap: 14 }}>

        {/* Players */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.players.map((p, i) => {
            const isActive = i === state.currentPlayerIndex;
            return (
              <motion.div key={p.id} animate={{ scale: isActive ? 1.02 : 1 }}
                style={{
                  ...card({
                    padding: '14px 16px',
                    border: `1.5px solid ${isActive ? EA.primary : EA.outline}`,
                    background: isActive ? EA.primaryDim : EA.surface,
                  }),
                  boxShadow: isActive ? `0 0 20px ${EA.primary}33` : 'none',
                  transition: 'all 0.3s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: EA.fBody, fontWeight: 700, fontSize: 13, color: EA.onBg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{p.name}</span>
                  {isActive && (
                    <span style={{ background: EA.primary, color: '#fff', borderRadius: EA.full, padding: '2px 8px', fontFamily: EA.fLabel, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t.turn}</span>
                  )}
                </div>
                <div style={{ fontFamily: EA.fHead, fontWeight: 900, fontSize: 22, color: EA.tertiary, letterSpacing: '-0.02em' }}>
                  €{p.score.toLocaleString()}
                </div>
                <div style={{ fontFamily: EA.fLabel, fontSize: 10, color: EA.onMuted, letterSpacing: '0.08em', marginTop: 2 }}>
                  {t.totalScore} €{p.totalScore.toLocaleString()}
                </div>
                {p.hasJolly && (
                  <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, background: `rgba(34,197,94,0.1)`, border: `1px solid rgba(34,197,94,0.3)`, borderRadius: EA.full, padding: '2px 10px' }}>
                    <span style={{ fontFamily: EA.fLabel, fontSize: 9, fontWeight: 700, color: EA.success, letterSpacing: '0.1em' }}>⭐ JOLLY</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Center – Wheel + controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <WheelSVG rotation={wheelRotation} size={270} language={state.language} wheelValues={state.wheelValues} />

          {/* Jolly choice */}
          {state.turnState === 'jolly_choice' && isMyTurn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ ...card({ padding: '16px 20px', border: `1.5px solid ${EA.success}55`, background: 'rgba(22,163,74,0.08)' }), width: '100%', textAlign: 'center' }}
            >
              <p style={{ margin: '0 0 12px', fontFamily: EA.fHead, fontWeight: 800, fontSize: 15, color: EA.success }}>{t.freeSpinChoice}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => dispatch({ type: 'USE_JOLLY' })}
                  style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: EA.md, background: EA.success, color: '#fff', fontFamily: EA.fHead, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {t.yes}
                </button>
                <button onClick={() => dispatch({ type: 'SKIP_JOLLY' })}
                  style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: EA.md, background: EA.error, color: '#fff', fontFamily: EA.fHead, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {t.no}
                </button>
              </div>
            </motion.div>
          )}

          {/* Spin / Solve buttons */}
          {state.turnState === 'waiting_spin' && !hasCons && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${EA.error}44`,
              borderRadius: EA.md,
              padding: '10px 14px',
              fontFamily: EA.fBody,
              fontSize: 13,
              color: EA.error,
              textAlign: 'center',
              fontWeight: 600,
              width: '100%',
              marginBottom: 4,
            }}>
              {t.noConsonantsWarning}
            </div>
          )}

          {state.turnState === 'waiting_spin' && (
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={() => isMyTurn && hasCons && dispatch({ type: 'SPIN_WHEEL' })} disabled={!isMyTurn || !hasCons}
                style={{
                  ...primaryBtn,
                  flex: 1, padding: '13px 0', fontSize: 14,
                  opacity: (isMyTurn && hasCons) ? 1 : 0.4,
                  cursor: (isMyTurn && hasCons) ? 'pointer' : 'not-allowed',
                  boxShadow: (isMyTurn && hasCons) ? `0 4px 16px ${EA.primary}55` : 'none',
                }}>
                {t.spin}
              </button>
              <button onClick={() => isMyTurn && setSolveModal(true)} disabled={!isMyTurn}
                style={{
                  flex: 1, padding: '13px 0', fontSize: 14,
                  border: 'none',
                  borderBottom: `2px solid ${EA.secondaryHov}`,
                  borderRadius: EA.md,
                  background: EA.secondary,
                  color: '#fff',
                  fontFamily: EA.fHead,
                  fontWeight: 700,
                  cursor: isMyTurn ? 'pointer' : 'not-allowed',
                  opacity: isMyTurn ? 1 : 0.4,
                  boxShadow: isMyTurn ? `0 4px 16px ${EA.secondary}55` : 'none',
                }}>
                {t.solve}
              </button>
            </div>
          )}

          {state.turnState === 'waiting_action' && (
            <div style={{ fontFamily: EA.fLabel, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: EA.onMuted }}>
              {t.wheelSpinningText}
            </div>
          )}

          {!isMyTurn && (state.turnState === 'waiting_spin' || state.turnState === 'waiting_letter') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: EA.fBody, fontSize: 13, color: '#A78BFA', fontWeight: 600 }}>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>⏳</motion.span>
              {cur?.type === 'bot' 
                ? t.thinking(cur?.name ?? '') 
                : (state.language === 'it' ? `In attesa del turno di ${cur?.name}...`
                  : state.language === 'en' ? `Waiting for ${cur?.name}'s turn...`
                  : state.language === 'es' ? `Esperando el turno de ${cur?.name}...`
                  : state.language === 'fr' ? `En attente du tour de ${cur?.name}...`
                  : `Warten auf den Zug von ${cur?.name}...`)}
            </div>
          )}
        </div>

        {/* Right – Keyboard */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(state.turnState === 'waiting_letter' || state.turnState === 'waiting_spin') && (
            <KeyboardPanel
              disabled={!isMyTurn || state.turnState !== 'waiting_letter'}
              canBuyVowel={canBuyVowel}
              onLetter={(l, v) => { if (isMyTurn) dispatch(v ? { type: 'BUY_VOWEL', payload: l } : { type: 'GUESS_CONSONANT', payload: l }); }}
            />
          )}
        </div>
      </div>

      {/* ── Solve Modal ── */}
      <AnimatePresence>
        {solveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(10,10,18,0.4)',
              backdropFilter: 'blur(1px)',
              zIndex: 100,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              padding: '20px 20px 60px'
            }}>
            <motion.form onSubmit={handleSolve} initial={{ scale: 0.88, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ ...card({ padding: 40, border: `2px solid ${EA.primary}`, maxWidth: 520, width: '100%' }), boxShadow: `0 24px 80px rgba(0,0,0,0.9), 0 0 40px ${EA.primary}22` }}>
              <h2 style={{ margin: '0 0 24px', fontFamily: EA.fHead, fontWeight: 900, fontSize: 22, textAlign: 'center', letterSpacing: '-0.02em', color: EA.onBg }}>{t.solveTitle}</h2>
              <input value={solveInput} onChange={e => setSolveInput(e.target.value)} autoFocus
                placeholder={t.writeHere}
                style={{ ...inputStyle, fontSize: 20, textAlign: 'center', textTransform: 'uppercase', fontWeight: 800, background: '#fff', color: '#000', border: `2px solid ${EA.primary}`, marginBottom: 20 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setSolveModal(false)}
                  style={{ flex: 1, padding: 14, border: `1px solid ${EA.outline}`, borderRadius: EA.md, background: EA.surface2, color: EA.onSurface, fontFamily: EA.fBody, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  {t.cancel}
                </button>
                <button type="submit"
                  style={{ ...primaryBtn, flex: 1, padding: 14, fontSize: 14, boxShadow: `0 4px 16px ${EA.primary}55` }}>
                  {t.confirm}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Round/Game Over overlay ── */}
      <AnimatePresence>
        {(state.status === 'round_over' || state.status === 'game_over') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,15,0.96)', backdropFilter: 'blur(14px)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.6, y: 60 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.35 }}
              style={{ textAlign: 'center', maxWidth: 620, width: '100%' }}>

              {/* Title */}
              <h1 style={{
                margin: '0 0 8px',
                fontFamily: EA.fHead,
                fontWeight: 900,
                fontSize: 'clamp(40px, 8vw, 66px)',
                letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, #fff 20%, ${EA.primary} 60%, ${EA.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {state.status === 'game_over' ? t.gameOverTitle : t.roundOverTitle}
              </h1>
              <p style={{ fontFamily: EA.fBody, fontWeight: 700, fontSize: 20, color: EA.onSurface, margin: '0 0 32px' }}>
                {t.winnerIs(state.players.find(p => p.id === state.winnerId)?.name ?? t.nobody)}
              </p>

              {/* Scoreboard */}
              <div style={{ ...card({ padding: 24, marginBottom: 32, background: EA.surface }), boxShadow: `0 0 0 1px ${EA.outline}` }}>
                {[...state.players].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < 2 ? `1px solid ${EA.outline}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: i === 0 ? EA.tertiary : i === 1 ? '#52525b' : '#3f3f46',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: EA.fHead, fontWeight: 900, fontSize: 13,
                        color: i === 0 ? '#1a1000' : '#fff',
                        boxShadow: i === 0 ? `0 0 16px ${EA.tertiary}88` : 'none',
                      }}>{i + 1}</span>
                      <span style={{ fontFamily: EA.fBody, fontWeight: 700, fontSize: 16, color: EA.onBg }}>{p.name}</span>
                    </div>
                    <span style={{ fontFamily: EA.fHead, fontWeight: 900, fontSize: 20, color: EA.tertiary }}>€{p.totalScore.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Action button */}
              {state.status === 'round_over' ? (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => dispatch({ type: 'NEXT_ROUND' })}
                  style={{ ...primaryBtn, padding: '16px 56px', fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: `0 6px 28px ${EA.primary}55` }}>
                  {t.nextRound}
                </motion.button>
              ) : (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => window.location.reload()}
                  style={{
                    padding: '16px 56px', fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase',
                    border: 'none', borderBottom: `3px solid ${EA.secondaryHov}`,
                    borderRadius: EA.md, background: EA.secondary, color: '#fff',
                    fontFamily: EA.fHead, fontWeight: 700, cursor: 'pointer',
                    boxShadow: `0 6px 28px ${EA.secondary}55`,
                  }}>
                  {t.newGame}
                </motion.button>
              )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bot Declaration Banner ── */}
      <AnimatePresence>
        {state.botDeclaration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            style={{
              position: 'fixed',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(26, 26, 30, 0.96)',
              border: `2px solid ${state.botDeclaration.type === 'letter' ? EA.tertiary : EA.primary}`,
              borderRadius: EA.lg,
              padding: '16px 28px',
              boxShadow: `0 10px 40px rgba(0,0,0,0.65), 0 0 25px ${state.botDeclaration.type === 'letter' ? EA.tertiary : EA.primary}44`,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              backdropFilter: 'blur(10px)',
            }}
          >
            {state.botDeclaration.type === 'spin' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: 24 }}
              >
                🎡
              </motion.div>
            )}
            {state.botDeclaration.type === 'letter' && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  width: 38, height: 38, borderRadius: EA.sm,
                  background: EA.tertiary, color: EA.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: EA.fHead, fontWeight: 900, fontSize: 20,
                  boxShadow: `0 0 15px ${EA.tertiary}`,
                }}
              >
                {state.botDeclaration.value}
              </motion.div>
            )}
            {state.botDeclaration.type === 'solve' && (
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ fontSize: 24 }}
              >
                🧩
              </motion.div>
            )}
            {state.botDeclaration.type === 'jolly' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ fontSize: 24 }}
              >
                ⭐
              </motion.div>
            )}
            <span style={{ fontFamily: EA.fHead, fontWeight: 800, fontSize: 16, color: EA.onBg, letterSpacing: '-0.01em' }}>
              {state.lastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recovery Modal ── */}
      <AnimatePresence>
        {showRecovery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(10,10,18,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 150,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20
            }}>
            <motion.div initial={{ scale: 0.88, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 20 }}
              style={{ ...card({ padding: 30, border: `2px solid ${EA.error}`, maxWidth: 460, width: '100%' }), boxShadow: `0 24px 80px rgba(0,0,0,0.9), 0 0 40px ${EA.error}22` }}>
              
              <h2 style={{ margin: '0 0 10px', fontFamily: EA.fHead, fontWeight: 900, fontSize: 20, textAlign: 'center', color: EA.error }}>
                {t.recoveryTitle}
              </h2>
              <p style={{ margin: '0 0 24px', fontFamily: EA.fBody, fontSize: 13, color: EA.onSurface, textAlign: 'center', lineHeight: 1.5 }}>
                {t.recoverySubtitle}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                <button onClick={() => { dispatch({ type: 'FORCE_SKIP_TURN' }); setShowRecovery(false); }}
                  style={{
                    padding: 12, border: 'none', borderRadius: EA.md, background: EA.surface2, color: EA.onBg,
                    fontFamily: EA.fBody, fontWeight: 700, fontSize: 13, textAlign: 'left', cursor: 'pointer',
                    borderLeft: `4px solid ${EA.tertiary}`, transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = EA.surface3; }}
                  onMouseLeave={e => { e.currentTarget.style.background = EA.surface2; }}
                >
                  {t.forceSkipTurn}
                </button>

                <button onClick={() => { dispatch({ type: 'FORCE_RESOLVE_ROUND' }); setShowRecovery(false); }}
                  style={{
                    padding: 12, border: 'none', borderRadius: EA.md, background: EA.surface2, color: EA.onBg,
                    fontFamily: EA.fBody, fontWeight: 700, fontSize: 13, textAlign: 'left', cursor: 'pointer',
                    borderLeft: `4px solid ${EA.success}`, transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = EA.surface3; }}
                  onMouseLeave={e => { e.currentTarget.style.background = EA.surface2; }}
                >
                  {t.forceResolveRound}
                </button>

                <button onClick={() => { dispatch({ type: 'FORCE_REROLL_PHRASE' }); setShowRecovery(false); }}
                  style={{
                    padding: 12, border: 'none', borderRadius: EA.md, background: EA.surface2, color: EA.onBg,
                    fontFamily: EA.fBody, fontWeight: 700, fontSize: 13, textAlign: 'left', cursor: 'pointer',
                    borderLeft: `4px solid ${EA.primary}`, transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = EA.surface3; }}
                  onMouseLeave={e => { e.currentTarget.style.background = EA.surface2; }}
                >
                  {t.forceRerollPhrase}
                </button>

                <button onClick={() => { dispatch({ type: 'FORCE_SET_SPIN' }); setShowRecovery(false); }}
                  style={{
                    padding: 12, border: 'none', borderRadius: EA.md, background: EA.surface2, color: EA.onBg,
                    fontFamily: EA.fBody, fontWeight: 700, fontSize: 13, textAlign: 'left', cursor: 'pointer',
                    borderLeft: `4px solid #a855f7`, transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = EA.surface3; }}
                  onMouseLeave={e => { e.currentTarget.style.background = EA.surface2; }}
                >
                  {t.forceSetSpin}
                </button>

                <button onClick={() => { dispatch({ type: 'RESTART_ROUND' }); setShowRecovery(false); }}
                  style={{
                    padding: 12, border: 'none', borderRadius: EA.md, background: EA.surface2, color: EA.onBg,
                    fontFamily: EA.fBody, fontWeight: 700, fontSize: 13, textAlign: 'left', cursor: 'pointer',
                    borderLeft: `4px solid #f97316`, transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = EA.surface3; }}
                  onMouseLeave={e => { e.currentTarget.style.background = EA.surface2; }}
                >
                  {t.restartRound}
                </button>
              </div>

              <button onClick={() => setShowRecovery(false)}
                style={{
                  width: '100%', padding: 12, border: `1px solid ${EA.outline}`, borderRadius: EA.md,
                  background: EA.surface, color: EA.onSurface, fontFamily: EA.fBody, fontWeight: 600, fontSize: 13, cursor: 'pointer'
                }}
              >
                {t.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────

const SimpleGameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const isSyncingRef = useRef(false);

  // Sync state FROM Firebase
  useEffect(() => {
    if (!db || !state.isOnline || !state.roomCode) return;

    const roomRef = ref(db, `rooms/${state.roomCode}/state`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        isSyncingRef.current = true;
        dispatch({ type: 'SYNC_STATE', payload: data });
        // After dispatching locally, reset the sync ref
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 50);
      } else {
        // Room deleted by Host or connection lost
        dispatch({
          type: 'SET_ONLINE_INFO',
          payload: { isOnline: false, roomCode: null, myPlayerId: state.myPlayerId, hostId: null }
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [state.isOnline, state.roomCode, state.myPlayerId]);

  // Wrapped dispatch to sync TO Firebase
  const safeDispatch = (action: GameAction) => {
    if (action.type === 'SYNC_STATE') {
      dispatch(action);
      return;
    }

    if (action.type === 'SET_ONLINE_INFO') {
      dispatch(action);
      return;
    }

    // Run reducer locally to get the next state
    const nextState = gameReducer(state, action);

    if (db && state.isOnline && state.roomCode && !isSyncingRef.current) {
      // Write to Firebase, clearing myPlayerId for other clients
      set(ref(db, `rooms/${state.roomCode}/state`), {
        ...nextState,
        myPlayerId: ''
      });
    } else {
      dispatch(action);
    }
  };

  // Bot logic: only the host processes bot actions when online
  useEffect(() => {
    const cur = state.players[state.currentPlayerIndex];
    if (!cur || cur.type !== 'bot' || state.status !== 'playing') return;

    // Only host runs bot actions
    if (state.isOnline && state.hostId !== state.myPlayerId) return;

    if (state.botDeclaration) {
      const delay = state.botDeclaration.type === 'letter' ? 1800 : 1500;
      const t = setTimeout(() => {
        safeDispatch(state.botDeclaration!.action);
      }, delay);
      return () => clearTimeout(t);
    }

    const action = getBotAction(state);
    if (!action) return;

    let type: 'spin' | 'letter' | 'solve' | 'jolly' = 'spin';
    let value: string | undefined = undefined;

    if (action.type === 'SPIN_WHEEL') {
      type = 'spin';
    } else if (action.type === 'GUESS_CONSONANT' || action.type === 'BUY_VOWEL') {
      type = 'letter';
      value = action.payload;
    } else if (action.type === 'SOLVE_PHRASE') {
      type = 'solve';
      value = action.payload;
    } else if (action.type === 'USE_JOLLY' || action.type === 'SKIP_JOLLY') {
      type = 'jolly';
    }

    const delayBeforeDecl = state.difficulty === 'hard' ? 400 : state.difficulty === 'medium' ? 800 : 1200;
    const t = setTimeout(() => {
      safeDispatch({
        type: 'DECLARE_BOT_ACTION',
        payload: { type, value, action }
      });
    }, delayBeforeDecl);

    return () => clearTimeout(t);
  }, [state.currentPlayerIndex, state.turnState, state.status, state.difficulty, state.spinResult, state.botDeclaration, state.isOnline, state.hostId, state.myPlayerId]);

  return <GameContext.Provider value={{ state, dispatch: safeDispatch }}>{children}</GameContext.Provider>;
};

const WheelController = ({ setWheelRotation, setIsSpinning }: {
  setWheelRotation: React.Dispatch<React.SetStateAction<number>>;
  setIsSpinning: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { state, dispatch } = useGame();
  const processedWedgeRef = React.useRef<number | null>(null);
  const stateRef = React.useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (state.targetWedgeIndex === null) {
      processedWedgeRef.current = null;
      return;
    }
    if (processedWedgeRef.current === state.targetWedgeIndex) {
      return;
    }
    processedWedgeRef.current = state.targetWedgeIndex;
    const idx = state.targetWedgeIndex;
    setIsSpinning(true);

    const center = idx * (360 / NUM_WEDGES) + (360 / NUM_WEDGES) / 2;
    const target = (360 - center + (Math.random() * 8 - 4)) % 360;

    setWheelRotation(cur => {
      const norm = cur % 360;
      let diff = target - norm;
      if (diff <= 0) diff += 360;
      return cur + 1800 + diff;
    });

    const t = setTimeout(() => {
      setIsSpinning(false);
      
      const latestState = stateRef.current;
      const isOnline = latestState.isOnline;
      const curPlayer = latestState.players[latestState.currentPlayerIndex];
      const isMyTurn = curPlayer?.id === latestState.myPlayerId;
      const isBotTurn = curPlayer?.type === 'bot';
      const isHost = latestState.hostId === latestState.myPlayerId;

      if (!isOnline || isMyTurn || (isBotTurn && isHost)) {
        dispatch({ type: 'WHEEL_STOPPED' });
      }
    }, 4700);

    return () => clearTimeout(t);
  }, [state.targetWedgeIndex, dispatch, setWheelRotation, setIsSpinning]);

  return null;
};

const AppInner = ({ wheelRotation, isSpinning }: { wheelRotation: number; isSpinning: boolean }) => {
  const { state } = useGame();
  if (state.status === 'language_select') {
    return <LanguageSelect />;
  }
  return state.status === 'lobby'
    ? <Lobby />
    : <GameScreen wheelRotation={wheelRotation} isSpinning={isSpinning} />;
};

const RootApp = () => {
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  return (
    <SimpleGameProvider>
      <WheelController setWheelRotation={setWheelRotation} setIsSpinning={setIsSpinning} />
      <AppInner wheelRotation={wheelRotation} isSpinning={isSpinning} />
    </SimpleGameProvider>
  );
};

export default RootApp;
