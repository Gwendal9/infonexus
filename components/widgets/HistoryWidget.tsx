import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface HistoryEvent {
  year: number;
  text: string;
}

// Events indexed by "MM-DD"
const HISTORY_EVENTS: Record<string, HistoryEvent[]> = {
  '01-01': [
    { year: 1804, text: "Haïti déclare son indépendance, première république noire libre." },
    { year: 1999, text: "L'euro est officiellement lancé comme monnaie dans 11 pays européens." },
  ],
  '01-15': [
    { year: 2001, text: "Lancement de Wikipédia, encyclopédie libre et collaborative." },
    { year: 1759, text: "Le British Museum ouvre ses portes au public à Londres." },
  ],
  '02-06': [
    { year: 1958, text: "Catastrophe aérienne de Munich : l'équipe de Manchester United décimée." },
    { year: 1952, text: "Élisabeth II devient reine du Royaume-Uni." },
  ],
  '02-10': [
    { year: 1996, text: "Deep Blue bat Kasparov aux échecs pour la première fois." },
    { year: 1863, text: "Alanson Crane brevète l'extincteur." },
  ],
  '02-11': [
    { year: 1990, text: "Nelson Mandela est libéré après 27 ans de prison." },
    { year: 2011, text: "Moubarak démissionne en Égypte après 18 jours de révolution." },
  ],
  '02-14': [
    { year: 1876, text: "Alexander Graham Bell dépose le brevet du téléphone." },
    { year: 2005, text: "YouTube est fondé par Chad Hurley, Steve Chen et Jawed Karim." },
  ],
  '02-15': [
    { year: 1564, text: "Naissance de Galilée, astronome et physicien italien." },
    { year: 1971, text: "Le Royaume-Uni adopte le système décimal pour sa monnaie." },
  ],
  '02-17': [
    { year: 1600, text: "Giordano Bruno est brûlé vif pour ses théories héliocentristes." },
    { year: 1933, text: "Newsweek est fondé aux États-Unis." },
  ],
  '02-18': [
    { year: 1930, text: "Découverte de la planète Pluton par Clyde Tombaugh." },
    { year: 2001, text: "Mort de Dale Earnhardt lors des 500 miles de Daytona." },
  ],
  '02-19': [
    { year: 1945, text: "Débarquement américain sur l'île d'Iwo Jima (Pacifique, WWII)." },
    { year: 1473, text: "Naissance de Nicolas Copernic, astronome polonais." },
  ],
  '02-20': [
    { year: 1962, text: "John Glenn devient le premier Américain à orbiter autour de la Terre." },
    { year: 1792, text: "George Washington signe l'acte fondateur du service postal américain." },
  ],
  '02-21': [
    { year: 1965, text: "Assassinat de Malcolm X à New York." },
    { year: 1848, text: "Publication du Manifeste du Parti communiste par Marx et Engels." },
  ],
  '02-22': [
    { year: 1732, text: "Naissance de George Washington, premier président des États-Unis." },
    { year: 1997, text: "Annonce du clonage de la brebis Dolly." },
  ],
  '02-23': [
    { year: 1945, text: "Photographie emblématique du drapeau américain planté à Iwo Jima." },
    { year: 1836, text: "Début du siège de Fort Alamo au Texas." },
  ],
  '02-24': [
    { year: 1582, text: "Promulgation du calendrier grégorien par le pape Grégoire XIII." },
    { year: 2022, text: "Invasion de l'Ukraine par la Russie." },
  ],
  '02-25': [
    { year: 1986, text: "Chute du régime de Ferdinand Marcos aux Philippines." },
    { year: 1964, text: "Cassius Clay (Muhammad Ali) devient champion du monde de boxe." },
  ],
  '02-26': [
    { year: 1993, text: "Attentat à la bombe au World Trade Center de New York." },
    { year: 1935, text: "Robert Watson-Watt présente le premier radar fonctionnel." },
  ],
  '02-27': [
    { year: 1933, text: "Incendie du Reichstag à Berlin, prétexte au régime nazi." },
    { year: 1560, text: "Traité d'Édimbourg mettant fin à la présence française en Écosse." },
  ],
  '02-28': [
    { year: 1953, text: "Watson et Crick découvrent la double hélice de l'ADN." },
    { year: 1986, text: "Assassinat d'Olof Palme, Premier ministre suédois." },
  ],
  '02-29': [
    { year: 1504, text: "Christophe Colomb prédit l'éclipse lunaire pour tromper les Jamaïcains." },
    { year: 1960, text: "Séisme catastrophique d'Agadir au Maroc." },
  ],
  '03-08': [
    { year: 1917, text: "Début de la Révolution de Février en Russie." },
    { year: 1975, text: "L'ONU proclame le 8 mars Journée internationale des femmes." },
  ],
  '03-14': [
    { year: 1879, text: "Naissance d'Albert Einstein à Ulm, en Allemagne." },
    { year: 2018, text: "Mort de Stephen Hawking, physicien théoricien." },
  ],
  '04-12': [
    { year: 1961, text: "Youri Gagarine devient le premier homme dans l'espace." },
    { year: 1981, text: "Première navette spatiale Columbia lancée par la NASA." },
  ],
  '04-15': [
    { year: 1912, text: "Le Titanic coule après avoir heurté un iceberg." },
    { year: 2019, text: "Incendie de Notre-Dame de Paris." },
  ],
  '05-01': [
    { year: 1886, text: "Grève générale à Chicago, origine de la Fête du travail." },
    { year: 1994, text: "Ayrton Senna se tue au Grand Prix de Saint-Marin." },
  ],
  '06-06': [
    { year: 1944, text: "Débarquement allié en Normandie (D-Day)." },
    { year: 1984, text: "Tetris est créé par Alexeï Pajitnov." },
  ],
  '06-18': [
    { year: 1815, text: "Bataille de Waterloo, défaite finale de Napoléon." },
    { year: 1940, text: "Appel du 18 Juin du général de Gaulle." },
  ],
  '07-04': [
    { year: 1776, text: "Déclaration d'indépendance des États-Unis." },
    { year: 2012, text: "Découverte du boson de Higgs au CERN." },
  ],
  '07-14': [
    { year: 1789, text: "Prise de la Bastille, début de la Révolution française." },
    { year: 2015, text: "La sonde New Horizons survole Pluton." },
  ],
  '07-20': [
    { year: 1969, text: "Neil Armstrong marche sur la Lune." },
    { year: 1976, text: "Viking 1 se pose sur Mars." },
  ],
  '08-06': [
    { year: 1945, text: "Bombe atomique sur Hiroshima." },
    { year: 1991, text: "Tim Berners-Lee met en ligne le premier site web." },
  ],
  '09-11': [
    { year: 2001, text: "Attentats du World Trade Center à New York." },
    { year: 1973, text: "Coup d'État au Chili, mort de Salvador Allende." },
  ],
  '10-29': [
    { year: 1929, text: "Krach boursier de Wall Street, début de la Grande Dépression." },
    { year: 1969, text: "Premier message envoyé via ARPANET, ancêtre d'Internet." },
  ],
  '11-09': [
    { year: 1989, text: "Chute du mur de Berlin." },
    { year: 1799, text: "Coup d'État du 18 Brumaire par Napoléon Bonaparte." },
  ],
  '11-11': [
    { year: 1918, text: "Armistice de la Première Guerre mondiale." },
    { year: 2000, text: "Incendie du tunnel du Mont-Blanc." },
  ],
  '12-25': [
    { year: 1991, text: "Dissolution de l'URSS, Gorbatchev démissionne." },
    { year: 2021, text: "Lancement du télescope spatial James Webb." },
  ],
};

// Fallback events for dates not in the database
const FALLBACK_EVENTS: HistoryEvent[] = [
  { year: 1969, text: "Premier alunissage : Neil Armstrong et Buzz Aldrin marchent sur la Lune." },
  { year: 1989, text: "La chute du mur de Berlin marque la fin de la guerre froide en Europe." },
  { year: 1953, text: "Watson et Crick découvrent la structure en double hélice de l'ADN." },
];

interface HistoryWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

export function HistoryWidget({ compact, expanded }: HistoryWidgetProps) {
  const colors = useColors();
  const styles = createStyles(colors, compact, expanded);

  const { events, dateLabel } = useMemo(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const key = `${month}-${day}`;
    const label = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    return {
      events: HISTORY_EVENTS[key] || FALLBACK_EVENTS,
      dateLabel: label,
    };
  }, []);

  if (compact) {
    const event = events[0];
    return (
      <WidgetContainer title="Aujourd'hui" icon="time" iconColor="#8E44AD" compact>
        <View style={styles.compactContent}>
          <Text style={styles.compactYear}>{event.year}</Text>
          <Text style={styles.compactText} numberOfLines={3}>{event.text}</Text>
        </View>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title={`Ce jour — ${dateLabel}`} icon="time" iconColor="#8E44AD" expanded={expanded}>
      <View style={styles.list}>
        {events.map((event, i) => (
          <View key={i} style={styles.eventItem}>
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{event.year}</Text>
            </View>
            <Text style={styles.eventText}>{event.text}</Text>
          </View>
        ))}
      </View>
    </WidgetContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, compact?: boolean, expanded?: boolean) =>
  StyleSheet.create({
    compactContent: { flex: 1, justifyContent: 'center', gap: 2 },
    compactYear: { ...typography.caption, fontWeight: '700', color: '#8E44AD' },
    compactText: { ...typography.small, color: colors.textSecondary, lineHeight: 14 },
    list: { gap: spacing.md },
    eventItem: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    yearBadge: {
      backgroundColor: '#8E44AD' + '18',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: 8,
      minWidth: 52,
      alignItems: 'center',
    },
    yearText: {
      ...typography.caption,
      fontWeight: '700',
      color: '#8E44AD',
    },
    eventText: {
      ...(expanded ? typography.body : typography.caption),
      color: colors.textPrimary,
      flex: 1,
      lineHeight: expanded ? 22 : 18,
    },
  });
