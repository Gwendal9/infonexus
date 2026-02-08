export interface KeywordGroup {
  category: string;
  keywords: string[];
}

/**
 * 100 topic groups with 5-10 curated French keywords each.
 * Covers the most common news interests.
 */
const KEYWORD_GROUPS: KeywordGroup[] = [
  // ── Tech & numérique ──────────────────────────────────────
  { category: 'Téléphone', keywords: ['téléphone', 'smartphone', 'iPhone', 'Android', 'Samsung', 'mobile', 'Pixel', 'Xiaomi', '5G'] },
  { category: 'Ordinateur', keywords: ['ordinateur', 'PC', 'laptop', 'processeur', 'carte graphique', 'RAM', 'MacBook', 'Windows'] },
  { category: 'Tablette', keywords: ['tablette', 'iPad', 'Galaxy Tab', 'stylet', 'liseuse', 'Kindle', 'e-ink'] },
  { category: 'Intelligence artificielle', keywords: ['intelligence artificielle', 'IA', 'ChatGPT', 'machine learning', 'deep learning', 'OpenAI', 'LLM', 'Claude', 'Gemini'] },
  { category: 'Tech', keywords: ['tech', 'Apple', 'Google', 'Microsoft', 'startup', 'innovation', 'application', 'logiciel', 'Silicon Valley'] },
  { category: 'Cybersécurité', keywords: ['cybersécurité', 'hacker', 'piratage', 'données', 'RGPD', 'vie privée', 'ransomware', 'antivirus', 'phishing'] },
  { category: 'Crypto', keywords: ['crypto', 'Bitcoin', 'Ethereum', 'blockchain', 'NFT', 'DeFi', 'altcoin', 'Web3', 'Binance', 'stablecoin'] },
  { category: 'Jeux vidéo', keywords: ['jeux vidéo', 'gaming', 'PlayStation', 'Xbox', 'Nintendo', 'PC gaming', 'esport', 'Steam', 'Twitch'] },
  { category: 'Réalité virtuelle', keywords: ['réalité virtuelle', 'VR', 'casque VR', 'Meta Quest', 'réalité augmentée', 'AR', 'métavers', 'immersif'] },
  { category: 'Robotique', keywords: ['robotique', 'robot', 'automatisation', 'drone', 'cobot', 'Boston Dynamics', 'humanoïde', 'industriel'] },
  { category: 'Programmation', keywords: ['programmation', 'développeur', 'code', 'Python', 'JavaScript', 'open source', 'GitHub', 'framework'] },
  { category: 'Réseaux sociaux', keywords: ['réseaux sociaux', 'Instagram', 'TikTok', 'X Twitter', 'Facebook', 'influenceur', 'viral', 'algorithme'] },
  { category: 'Cloud', keywords: ['cloud', 'AWS', 'Azure', 'Google Cloud', 'SaaS', 'hébergement', 'serveur', 'datacenter'] },

  // ── Sciences ───────────────────────────────────────────────
  { category: 'Sciences', keywords: ['science', 'recherche', 'découverte', 'laboratoire', 'physique', 'chimie', 'biologie', 'CNRS', 'expérience'] },
  { category: 'Espace', keywords: ['espace', 'NASA', 'SpaceX', 'astronaute', 'satellite', 'fusée', 'Mars', 'astronomie', 'ISS', 'orbite'] },
  { category: 'Médecine', keywords: ['médecine', 'hôpital', 'chirurgie', 'diagnostic', 'patient', 'médecin', 'traitement', 'essai clinique'] },
  { category: 'Génétique', keywords: ['génétique', 'ADN', 'gène', 'CRISPR', 'génome', 'mutation', 'héréditaire', 'thérapie génique'] },
  { category: 'Archéologie', keywords: ['archéologie', 'fouilles', 'fossile', 'antiquité', 'vestiges', 'civilisation', 'pyramide', 'excavation'] },
  { category: 'Océan', keywords: ['océan', 'mer', 'sous-marin', 'corail', 'plongée', 'marée', 'biodiversité marine', 'abysses'] },
  { category: 'Mathématiques', keywords: ['mathématiques', 'algorithme', 'théorème', 'statistiques', 'probabilité', 'calcul', 'géométrie'] },
  { category: 'Psychologie', keywords: ['psychologie', 'cerveau', 'neuroscience', 'comportement', 'thérapie', 'trouble', 'cognition', 'mémoire'] },

  // ── Sport ──────────────────────────────────────────────────
  { category: 'Football', keywords: ['football', 'Ligue 1', 'Premier League', 'Champions League', 'PSG', 'Mbappé', 'FIFA', 'ballon', 'transfert'] },
  { category: 'Rugby', keywords: ['rugby', 'Top 14', 'XV de France', 'Six Nations', 'essai', 'mêlée', 'Coupe du monde', 'ovale'] },
  { category: 'Tennis', keywords: ['tennis', 'Roland-Garros', 'Wimbledon', 'ATP', 'WTA', 'Grand Chelem', 'raquette', 'set'] },
  { category: 'Cyclisme', keywords: ['cyclisme', 'Tour de France', 'vélo', 'étape', 'peloton', 'Giro', 'Vuelta', 'maillot jaune'] },
  { category: 'Basketball', keywords: ['basketball', 'NBA', 'basket', 'dunk', 'panier', 'LeBron', 'Wembanyama', 'playoffs'] },
  { category: 'Natation', keywords: ['natation', 'piscine', 'crawl', 'nage', 'Jeux olympiques', 'record', 'bassin', 'plongeon'] },
  { category: 'Athlétisme', keywords: ['athlétisme', 'sprint', 'marathon', 'saut', 'lancer', 'piste', '100 mètres', 'décathlon'] },
  { category: 'Formule 1', keywords: ['Formule 1', 'F1', 'Grand Prix', 'pilote', 'écurie', 'circuit', 'podium', 'Verstappen', 'Hamilton'] },
  { category: 'MMA', keywords: ['MMA', 'UFC', 'combat', 'arts martiaux', 'octogone', 'KO', 'poids', 'Gane'] },
  { category: 'Handball', keywords: ['handball', 'hand', 'Experts', 'championnat', 'gardien', 'tir', 'sélection', 'LNH'] },
  { category: 'Ski', keywords: ['ski', 'alpin', 'slalom', 'descente', 'neige', 'station', 'Coupe du monde', 'biathlon'] },
  { category: 'Surf', keywords: ['surf', 'vague', 'planche', 'spot', 'compétition', 'surfeur', 'reef', 'swell'] },
  { category: 'Jeux olympiques', keywords: ['Jeux olympiques', 'JO', 'olympique', 'médaille', 'athlète', 'cérémonie', 'Paris 2024', 'CIO'] },
  { category: 'Golf', keywords: ['golf', 'parcours', 'green', 'birdie', 'PGA', 'Ryder Cup', 'club', 'putt'] },
  { category: 'Boxe', keywords: ['boxe', 'ring', 'round', 'champion', 'poids lourd', 'uppercut', 'ceinture', 'KO'] },
  { category: 'Escalade', keywords: ['escalade', 'bloc', 'falaise', 'grimpe', 'voie', 'prise', 'alpinisme', 'paroi'] },

  // ── Culture & divertissement ───────────────────────────────
  { category: 'Cinéma', keywords: ['cinéma', 'film', 'acteur', 'réalisateur', 'Oscar', 'Cannes', 'streaming', 'Netflix', 'blockbuster'] },
  { category: 'Séries TV', keywords: ['série', 'saison', 'épisode', 'Netflix', 'Disney+', 'HBO', 'streaming', 'showrunner', 'cliffhanger'] },
  { category: 'Musique', keywords: ['musique', 'concert', 'album', 'artiste', 'rap', 'rock', 'Spotify', 'festival', 'single'] },
  { category: 'Livres', keywords: ['livre', 'roman', 'auteur', 'best-seller', 'lecture', 'littérature', 'édition', 'bibliothèque', 'prix littéraire'] },
  { category: 'Manga', keywords: ['manga', 'anime', 'One Piece', 'shonen', 'seinen', 'japanimation', 'mangaka', 'tome', 'Naruto'] },
  { category: 'BD', keywords: ['bande dessinée', 'BD', 'Astérix', 'comics', 'Angoulême', 'dessinateur', 'planche', 'album'] },
  { category: 'Théâtre', keywords: ['théâtre', 'pièce', 'scène', 'comédien', 'mise en scène', 'représentation', 'Molière', 'spectacle'] },
  { category: 'Photographie', keywords: ['photographie', 'photo', 'appareil photo', 'objectif', 'retouche', 'Lightroom', 'Nikon', 'Canon', 'exposition'] },
  { category: 'Art', keywords: ['art', 'peinture', 'sculpture', 'exposition', 'musée', 'galerie', 'artiste', 'œuvre', 'contemporain'] },
  { category: 'Podcast', keywords: ['podcast', 'audio', 'émission', 'écoute', 'épisode', 'micro', 'interview', 'Spotify'] },
  { category: 'Documentaire', keywords: ['documentaire', 'reportage', 'investigation', 'enquête', 'société', 'ARTE', 'récit', 'témoignage'] },

  // ── Politique & société ────────────────────────────────────
  { category: 'Politique', keywords: ['politique', 'élection', 'gouvernement', 'président', 'parlement', 'loi', 'réforme', 'sénat', 'Assemblée'] },
  { category: 'Géopolitique', keywords: ['géopolitique', 'diplomatie', 'conflit', 'OTAN', 'ONU', 'sanctions', 'alliance', 'guerre', 'traité'] },
  { category: 'Justice', keywords: ['justice', 'procès', 'tribunal', 'avocat', 'verdict', 'condamnation', 'cour', 'enquête', 'magistrat'] },
  { category: 'Sécurité', keywords: ['sécurité', 'police', 'gendarmerie', 'délinquance', 'surveillance', 'terrorisme', 'attentat', 'prévention'] },
  { category: 'Immigration', keywords: ['immigration', 'migrant', 'frontière', 'asile', 'réfugié', 'visa', 'intégration', 'régularisation'] },
  { category: 'Europe', keywords: ['Europe', 'Union européenne', 'UE', 'Bruxelles', 'Commission', 'eurodéputé', 'directive', 'Parlement européen'] },
  { category: 'Afrique', keywords: ['Afrique', 'continent africain', 'Sahel', 'Maghreb', 'développement', 'Union africaine', 'Franc CFA'] },
  { category: 'États-Unis', keywords: ['États-Unis', 'USA', 'Maison-Blanche', 'Congrès', 'président américain', 'Wall Street', 'Washington'] },

  // ── Économie & finance ─────────────────────────────────────
  { category: 'Économie', keywords: ['économie', 'bourse', 'inflation', 'PIB', 'emploi', 'croissance', 'entreprise', 'startup', 'récession'] },
  { category: 'Bourse', keywords: ['bourse', 'CAC 40', 'action', 'indice', 'trader', 'marché', 'hausse', 'baisse', 'dividende'] },
  { category: 'Immobilier', keywords: ['immobilier', 'logement', 'appartement', 'maison', 'loyer', 'crédit', 'investissement', 'propriétaire', 'DPE'] },
  { category: 'Banque', keywords: ['banque', 'taux', 'crédit', 'épargne', 'BCE', 'prêt', 'livret', 'fintech', 'néobanque'] },
  { category: 'Emploi', keywords: ['emploi', 'chômage', 'recrutement', 'salaire', 'CDI', 'freelance', 'télétravail', 'carrière', 'Pôle emploi'] },
  { category: 'Fiscalité', keywords: ['impôt', 'fiscalité', 'taxe', 'TVA', 'déclaration', 'niche fiscale', 'prélèvement', 'ISF', 'cotisation'] },
  { category: 'Assurance', keywords: ['assurance', 'mutuelle', 'sinistre', 'cotisation', 'contrat', 'indemnisation', 'franchise', 'prime'] },
  { category: 'Retraite', keywords: ['retraite', 'pension', 'cotisation', 'réforme', 'trimestre', 'annuité', 'Agirc-Arrco', 'départ'] },

  // ── Environnement & énergie ────────────────────────────────
  { category: 'Environnement', keywords: ['environnement', 'climat', 'écologie', 'réchauffement', 'pollution', 'biodiversité', 'CO2', 'durable'] },
  { category: 'Énergie', keywords: ['énergie', 'nucléaire', 'renouvelable', 'solaire', 'éolien', 'pétrole', 'électricité', 'hydrogène', 'EDF'] },
  { category: 'Véhicule électrique', keywords: ['véhicule électrique', 'voiture électrique', 'Tesla', 'batterie', 'borne de recharge', 'autonomie', 'BEV', 'hybride'] },
  { category: 'Recyclage', keywords: ['recyclage', 'déchet', 'tri', 'plastique', 'économie circulaire', 'compost', 'consigne', 'zéro déchet'] },
  { category: 'Agriculture', keywords: ['agriculture', 'paysan', 'récolte', 'bio', 'pesticide', 'PAC', 'élevage', 'exploitation', 'agroécologie'] },
  { category: 'Eau', keywords: ['eau', 'sécheresse', 'nappe phréatique', 'irrigation', 'barrage', 'potable', 'ressource', 'inondation'] },

  // ── Lifestyle ──────────────────────────────────────────────
  { category: 'Cuisine', keywords: ['cuisine', 'recette', 'gastronomie', 'restaurant', 'chef', 'pâtisserie', 'végétarien', 'nutrition', 'Michelin'] },
  { category: 'Mode', keywords: ['mode', 'fashion', 'vêtements', 'luxe', 'tendance', 'haute couture', 'streetwear', 'accessoires', 'défilé'] },
  { category: 'Voyage', keywords: ['voyage', 'tourisme', 'avion', 'hôtel', 'destination', 'vacances', 'road trip', 'croisière', 'backpack'] },
  { category: 'Santé', keywords: ['santé', 'médecine', 'hôpital', 'vaccination', 'bien-être', 'maladie', 'OMS', 'thérapie', 'prévention'] },
  { category: 'Fitness', keywords: ['fitness', 'musculation', 'sport', 'entraînement', 'cardio', 'salle de sport', 'CrossFit', 'running'] },
  { category: 'Yoga', keywords: ['yoga', 'méditation', 'respiration', 'posture', 'zen', 'pleine conscience', 'relaxation', 'chakra'] },
  { category: 'Beauté', keywords: ['beauté', 'cosmétique', 'maquillage', 'soin', 'peau', 'crème', 'sérum', 'routine', 'skincare'] },
  { category: 'Vin', keywords: ['vin', 'vignoble', 'cépage', 'millésime', 'dégustation', 'Bordeaux', 'Bourgogne', 'sommelier', 'vendange'] },
  { category: 'Bière', keywords: ['bière', 'brasserie', 'craft beer', 'houblon', 'IPA', 'blonde', 'brune', 'micro-brasserie'] },
  { category: 'Café', keywords: ['café', 'expresso', 'barista', 'torréfaction', 'arabica', 'robusta', 'latte', 'cappuccino'] },
  { category: 'Décoration', keywords: ['décoration', 'intérieur', 'design', 'meuble', 'aménagement', 'déco', 'IKEA', 'tendance', 'rénovation'] },
  { category: 'Jardinage', keywords: ['jardinage', 'jardin', 'plantes', 'potager', 'fleurs', 'semis', 'permaculture', 'compost', 'balcon'] },

  // ── Transport ──────────────────────────────────────────────
  { category: 'Automobile', keywords: ['automobile', 'voiture', 'véhicule', 'constructeur', 'Tesla', 'Renault', 'Peugeot', 'SUV', 'berline'] },
  { category: 'Aviation', keywords: ['aviation', 'avion', 'aéroport', 'compagnie aérienne', 'vol', 'Airbus', 'Boeing', 'pilote', 'aérien'] },
  { category: 'Ferroviaire', keywords: ['train', 'SNCF', 'TGV', 'rail', 'gare', 'cheminot', 'LGV', 'Eurostar', 'RER'] },
  { category: 'Vélo', keywords: ['vélo', 'cycliste', 'piste cyclable', 'vélo électrique', 'VAE', 'mobilité douce', 'VélO', 'cargo'] },
  { category: 'Moto', keywords: ['moto', 'motard', 'deux-roues', 'Ducati', 'Yamaha', 'Honda', 'MotoGP', 'scooter'] },
  { category: 'Maritime', keywords: ['maritime', 'bateau', 'navire', 'port', 'croisière', 'voilier', 'cargo', 'navigation'] },

  // ── Éducation & famille ────────────────────────────────────
  { category: 'Éducation', keywords: ['éducation', 'école', 'université', 'étudiant', 'formation', 'enseignement', 'diplôme', 'baccalauréat', 'Parcoursup'] },
  { category: 'Parentalité', keywords: ['parentalité', 'enfant', 'bébé', 'parent', 'naissance', 'famille', 'éducation', 'crèche', 'maternité'] },
  { category: 'Animaux', keywords: ['animaux', 'chien', 'chat', 'faune', 'nature', 'protection animale', 'adoption', 'vétérinaire', 'refuge'] },
  { category: 'Bricolage', keywords: ['bricolage', 'DIY', 'outil', 'rénovation', 'travaux', 'menuiserie', 'peinture', 'plomberie'] },

  // ── Logement & patrimoine ──────────────────────────────────
  { category: 'Location', keywords: ['location', 'locataire', 'bail', 'loyer', 'garant', 'HLM', 'logement social', 'propriétaire'] },
  { category: 'Copropriété', keywords: ['copropriété', 'syndic', 'charges', 'assemblée générale', 'lot', 'règlement', 'ravalement', 'ascenseur'] },
  { category: 'Construction', keywords: ['construction', 'chantier', 'bâtiment', 'BTP', 'béton', 'architecte', 'permis', 'maître d\'œuvre'] },

  // ── Divers ─────────────────────────────────────────────────
  { category: 'Météo', keywords: ['météo', 'température', 'pluie', 'canicule', 'orage', 'neige', 'prévision', 'climat', 'alerte'] },
  { category: 'Astronomie', keywords: ['astronomie', 'étoile', 'planète', 'télescope', 'galaxie', 'comète', 'éclipse', 'nébuleuse', 'James Webb'] },
  { category: 'Histoire', keywords: ['histoire', 'guerre mondiale', 'révolution', 'empire', 'roi', 'siècle', 'mémoire', 'patrimoine'] },
  { category: 'Philosophie', keywords: ['philosophie', 'penseur', 'éthique', 'morale', 'existentialisme', 'Sartre', 'Socrate', 'réflexion'] },
  { category: 'Religion', keywords: ['religion', 'église', 'mosquée', 'foi', 'spiritualité', 'pape', 'laïcité', 'culte'] },
  { category: 'Luxe', keywords: ['luxe', 'LVMH', 'Hermès', 'Chanel', 'joaillerie', 'haute couture', 'maroquinerie', 'montre'] },
  { category: 'Horlogerie', keywords: ['horlogerie', 'montre', 'Rolex', 'Omega', 'mouvement', 'cadran', 'complication', 'Swiss made'] },
  { category: 'Droit', keywords: ['droit', 'loi', 'juridique', 'code civil', 'avocat', 'jurisprudence', 'contrat', 'litige', 'réglementation'] },
];

/**
 * Search keyword groups matching the input text.
 * Matches on category name or individual keywords (case-insensitive).
 */
export function getSuggestedKeywords(input: string): KeywordGroup[] {
  if (!input || input.trim().length < 2) return [];

  const query = input.toLowerCase().trim();

  return KEYWORD_GROUPS.filter((group) => {
    if (group.category.toLowerCase().includes(query)) return true;
    return group.keywords.some((kw) => kw.toLowerCase().includes(query));
  });
}
