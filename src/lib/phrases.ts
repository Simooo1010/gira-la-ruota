import { Phrase, Language, Difficulty } from '../types';

export const phrases: Phrase[] = [
  // ITALIANO - EASY
  { id: 'it_e_1', language: 'it', difficulty: 'easy', category: 'Proverbio', text: 'ROSSO DI SERA BEL TEMPO SI SPERA' },
  { id: 'it_e_2', language: 'it', difficulty: 'easy', category: 'Il corpo umano', text: 'LE IMPRONTE DIGITALI' },
  { id: 'it_e_3', language: 'it', difficulty: 'easy', category: 'Cibo e bevande', text: 'PIZZA MARGHERITA' },
  { id: 'it_e_4', language: 'it', difficulty: 'easy', category: 'Titolo di film', text: 'LA VITA E BELLA' },
  { id: 'it_e_5', language: 'it', difficulty: 'easy', category: 'Mestieri', text: 'IL VIGILE DEL FUOCO' },
  
  // ITALIANO - MEDIUM
  { id: 'it_m_1', language: 'it', difficulty: 'medium', category: 'Proverbio', text: 'CHI DORME NON PIGLIA PESCI' },
  { id: 'it_m_2', language: 'it', difficulty: 'medium', category: 'Cosa si fa', text: 'ANDARE A FARE LA SPESA' },
  { id: 'it_m_3', language: 'it', difficulty: 'medium', category: 'Titolo di libro', text: 'I PROMESSI SPOSI' },
  { id: 'it_m_4', language: 'it', difficulty: 'medium', category: 'Luoghi', text: 'LA TORRE DI PISA' },
  { id: 'it_m_5', language: 'it', difficulty: 'medium', category: 'Eventi Storici', text: 'LA SCOPERTA DELL AMERICA' },

  // ITALIANO - HARD
  { id: 'it_h_1', language: 'it', difficulty: 'hard', category: 'Modi di dire', text: 'AVERE LA BOTTE PIENA E LA MOGLIE UBRIACA' },
  { id: 'it_h_2', language: 'it', difficulty: 'hard', category: 'Personaggi Storici', text: 'LEONARDO DA VINCI E LA GIOCONDA' },
  { id: 'it_h_3', language: 'it', difficulty: 'hard', category: 'Titolo di film', text: 'IL BUONO IL BRUTTO E IL CATTIVO' },
  { id: 'it_h_4', language: 'it', difficulty: 'hard', category: 'Canzoni italiane', text: 'NEL BLU DIPINTO DI BLU' },
  { id: 'it_h_5', language: 'it', difficulty: 'hard', category: 'Citazioni Famosi', text: 'E PUR SI MUOVE' },

  // ENGLISH - EASY
  { id: 'en_e_1', language: 'en', difficulty: 'easy', category: 'Proverb', text: 'AN APPLE A DAY KEEPS THE DOCTOR AWAY' },
  { id: 'en_e_2', language: 'en', difficulty: 'easy', category: 'Food and Drink', text: 'HAMBURGER AND FRIES' },
  { id: 'en_e_3', language: 'en', difficulty: 'easy', category: 'Movie Title', text: 'THE LION KING' },
  { id: 'en_e_4', language: 'en', difficulty: 'easy', category: 'Animals', text: 'GOLDEN RETRIEVER' },
  { id: 'en_e_5', language: 'en', difficulty: 'easy', category: 'Things', text: 'A PAIR OF SUNGLASSES' },

  // ENGLISH - MEDIUM
  { id: 'en_m_1', language: 'en', difficulty: 'medium', category: 'Proverb', text: 'ACTIONS SPEAK LOUDER THAN WORDS' },
  { id: 'en_m_2', language: 'en', difficulty: 'medium', category: 'Famous People', text: 'MARTIN LUTHER KING JR' },
  { id: 'en_m_3', language: 'en', difficulty: 'medium', category: 'Places', text: 'THE STATUE OF LIBERTY' },
  { id: 'en_m_4', language: 'en', difficulty: 'medium', category: 'What are you doing', text: 'RIDING A BICYCLE' },
  { id: 'en_m_5', language: 'en', difficulty: 'medium', category: 'Book Title', text: 'HARRY POTTER AND THE SORCERERS STONE' },

  // ENGLISH - HARD
  { id: 'en_h_1', language: 'en', difficulty: 'hard', category: 'Idioms', text: 'BITE THE BULLET AND FACE THE CONSEQUENCES' },
  { id: 'en_h_2', language: 'en', difficulty: 'hard', category: 'Historical Events', text: 'THE FALL OF THE ROMAN EMPIRE' },
  { id: 'en_h_3', language: 'en', difficulty: 'hard', category: 'Famous Quotes', text: 'TO BE OR NOT TO BE THAT IS THE QUESTION' },
  { id: 'en_h_4', language: 'en', difficulty: 'hard', category: 'Movie Title', text: 'THE LORD OF THE RINGS THE RETURN OF THE KING' },
  { id: 'en_h_5', language: 'en', difficulty: 'hard', category: 'Science', text: 'THE THEORY OF GENERAL RELATIVITY' },
];

export const getRandomPhrase = (language: Language, difficulty: Difficulty, excludeIds: string[] = []): Phrase => {
  const filtered = phrases.filter(p => p.language === language && p.difficulty === difficulty && !excludeIds.includes(p.id));
  if (filtered.length === 0) {
    const fallback = phrases.filter(p => p.language === language && p.difficulty === difficulty);
    return fallback[Math.floor(Math.random() * fallback.length)];
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
};
