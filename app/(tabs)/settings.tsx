import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/Button';
import { useAuth } from '@/providers/AuthProvider';
import { useThemeContext, useColors } from '@/contexts/ThemeContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import {
  WIDGET_CATALOG,
  PRESET_CITIES,
  PRESET_CRYPTOS,
  PRESET_LEAGUES,
  PRESET_STOCKS,
  PRESET_ETFS,
  NEWS_CATEGORIES,
  PRESET_CURRENCIES,
  PRESET_CURRENCY_PAIRS,
  WidgetType,
} from '@/lib/widgets/types';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ThemeOption = 'light' | 'dark' | 'system';

interface CityResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export default function SettingsScreen() {
  const colors = useColors();
  const { user, signOut } = useAuth();
  const { mode, setMode } = useThemeContext();
  const { resetOnboarding } = useOnboarding();
  const {
    config,
    toggleWidget,
    updateWeatherSettings,
    updateCryptoSettings,
    updateFootballSettings,
    updateStockSettings,
    updateNewsSettings,
    updateCurrencySettings,
  } = useWidgetConfig();

  const [expandedWidget, setExpandedWidget] = useState<WidgetType | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [citySearching, setCitySearching] = useState(false);
  const [finnhubKey, setFinnhubKey] = useState('');
  const [gnewsKey, setGnewsKey] = useState('');
  const [finnhubVisible, setFinnhubVisible] = useState(false);
  const [gnewsVisible, setGnewsVisible] = useState(false);
  const [finnhubStatus, setFinnhubStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [gnewsStatus, setGnewsStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');

  // Load API keys from context on mount
  useEffect(() => {
    if (config.settings.stock.apiKey) setFinnhubKey(config.settings.stock.apiKey);
    if (config.settings.news.apiKey) setGnewsKey(config.settings.news.apiKey);
  }, [config.settings.stock.apiKey, config.settings.news.apiKey]);

  const styles = createStyles(colors);

  const themeOptions: { value: ThemeOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'light', label: 'Clair', icon: 'sunny-outline' },
    { value: 'dark', label: 'Sombre', icon: 'moon-outline' },
    { value: 'system', label: 'Système', icon: 'phone-portrait-outline' },
  ];

  const handleResetOnboarding = () => {
    Alert.alert(
      "Revoir l'onboarding",
      "Voulez-vous revoir l'écran de bienvenue ?",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', onPress: resetOnboarding },
      ]
    );
  };

  const handleToggleWidget = (widgetId: WidgetType) => {
    Haptics.selectionAsync();
    toggleWidget(widgetId);
  };

  const handleCitySelect = (city: { name: string; latitude: number; longitude: number }) => {
    Haptics.selectionAsync();
    updateWeatherSettings({
      city: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    });
    setCitySearch('');
    setCityResults([]);
  };

  const handleCitySearch = async (text: string) => {
    setCitySearch(text);
    if (text.length < 2) {
      setCityResults([]);
      return;
    }
    try {
      setCitySearching(true);
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=5&language=fr`
      );
      if (!response.ok) {
        setCityResults([]);
        return;
      }
      const data = await response.json();
      const results: CityResult[] = (data.results ?? []).map((r: any) => ({
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country ?? '',
        admin1: r.admin1,
      }));
      setCityResults(results);
    } catch {
      setCityResults([]);
    } finally {
      setCitySearching(false);
    }
  };

  const handleCryptoToggle = (crypto: typeof PRESET_CRYPTOS[0]) => {
    Haptics.selectionAsync();
    const current = config.settings.crypto.currencies;
    const isSelected = current.some((c) => c.id === crypto.id);

    if (isSelected) {
      if (current.length <= 1) return;
      updateCryptoSettings({
        currencies: current.filter((c) => c.id !== crypto.id),
      });
    } else {
      if (current.length >= 4) return;
      updateCryptoSettings({
        currencies: [...current, crypto],
      });
    }
  };

  const handleLeagueToggle = (league: typeof PRESET_LEAGUES[0]) => {
    Haptics.selectionAsync();
    const current = config.settings.football.leagues;
    const isSelected = current.some((l) => l.code === league.code);

    if (isSelected) {
      if (current.length <= 1) return;
      updateFootballSettings({
        leagues: current.filter((l) => l.code !== league.code),
      });
    } else {
      if (current.length >= 3) return;
      updateFootballSettings({
        leagues: [...current, league],
      });
    }
  };

  const handleStockToggle = (stock: typeof PRESET_STOCKS[0]) => {
    Haptics.selectionAsync();
    const current = config.settings.stock.items;
    const isSelected = current.some((s) => s.symbol === stock.symbol);

    if (isSelected) {
      if (current.length <= 1) return;
      updateStockSettings({
        items: current.filter((s) => s.symbol !== stock.symbol),
      });
    } else {
      if (current.length >= 6) return;
      updateStockSettings({
        items: [...current, stock],
      });
    }
  };

  const handleNewsCategorySelect = (category: typeof NEWS_CATEGORIES[0]) => {
    Haptics.selectionAsync();
    updateNewsSettings({ category: category.value });
  };

  const handleFinnhubKeySave = (key: string) => {
    setFinnhubKey(key);
    setFinnhubStatus('idle');
    updateStockSettings({ apiKey: key });
  };

  const handleGnewsKeySave = (key: string) => {
    setGnewsKey(key);
    setGnewsStatus('idle');
    updateNewsSettings({ apiKey: key });
  };

  const testFinnhubKey = async () => {
    if (!finnhubKey.trim()) return;
    setFinnhubStatus('testing');
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${encodeURIComponent(finnhubKey.trim())}`
      );
      const data = await res.json();
      setFinnhubStatus(res.ok && data.c && data.c > 0 ? 'valid' : 'invalid');
    } catch {
      setFinnhubStatus('invalid');
    }
  };

  const testGnewsKey = async () => {
    if (!gnewsKey.trim()) return;
    setGnewsStatus('testing');
    try {
      const res = await fetch(
        `https://gnews.io/api/v4/top-headlines?lang=fr&country=fr&max=1&token=${encodeURIComponent(gnewsKey.trim())}`
      );
      const data = await res.json();
      setGnewsStatus(res.ok && data.articles ? 'valid' : 'invalid');
    } catch {
      setGnewsStatus('invalid');
    }
  };

  const toggleExpand = (widgetId: WidgetType) => {
    Haptics.selectionAsync();
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountEmail}>{user?.email}</Text>
              <Text style={styles.accountLabel}>Connecté</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apparence</Text>
        <View style={styles.card}>
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                index < themeOptions.length - 1 && styles.optionBorder,
              ]}
              onPress={() => setMode(option.value)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, mode === option.value && styles.iconContainerActive]}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={mode === option.value ? colors.primary : colors.textMuted}
                  />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              {mode === option.value && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Widgets Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Widgets</Text>
        {WIDGET_CATALOG.map((widget) => {
          const isEnabled = config.enabled[widget.id];
          const isExpanded = expandedWidget === widget.id;

          return (
            <View key={widget.id} style={styles.widgetCard}>
              <View style={styles.widgetHeader}>
                <View style={styles.widgetInfo}>
                  <View style={[styles.widgetIconContainer, isEnabled && styles.widgetIconActive]}>
                    <Ionicons
                      name={widget.icon as any}
                      size={20}
                      color={isEnabled ? colors.primary : colors.textMuted}
                    />
                  </View>
                  <View style={styles.widgetText}>
                    <Text style={styles.widgetName}>{widget.name}</Text>
                    <Text style={styles.widgetDescription}>{widget.description}</Text>
                  </View>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={() => handleToggleWidget(widget.id)}
                  trackColor={{ false: colors.border, true: colors.primary + '50' }}
                  thumbColor={isEnabled ? colors.primary : colors.textMuted}
                />
              </View>

              {widget.hasSettings && isEnabled && (
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() => toggleExpand(widget.id)}
                >
                  <Text style={styles.settingsText}>
                    {isExpanded ? 'Masquer' : 'Personnaliser'}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}

              {/* Weather Settings */}
              {widget.id === 'weather' && isExpanded && isEnabled && (
                <View style={styles.settingsContent}>
                  <Text style={styles.settingsLabel}>Rechercher une ville</Text>
                  <TextInput
                    style={styles.citySearchInput}
                    placeholder="Tapez le nom d'une ville..."
                    placeholderTextColor={colors.textMuted}
                    value={citySearch}
                    onChangeText={handleCitySearch}
                  />
                  {citySearching && (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.sm }} />
                  )}
                  {cityResults.length > 0 && (
                    <View style={styles.cityResultsList}>
                      {cityResults.map((result, idx) => (
                        <TouchableOpacity
                          key={`${result.latitude}-${result.longitude}-${idx}`}
                          style={styles.cityResultItem}
                          onPress={() => handleCitySelect(result)}
                        >
                          <Ionicons name="location" size={16} color={colors.primary} />
                          <View style={styles.cityResultText}>
                            <Text style={styles.cityResultName}>{result.name}</Text>
                            <Text style={styles.cityResultDetail}>
                              {[result.admin1, result.country].filter(Boolean).join(', ')}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={[styles.settingsLabel, { marginTop: spacing.md }]}>Villes rapides</Text>
                  <View style={styles.optionsGrid}>
                    {PRESET_CITIES.map((city) => (
                      <TouchableOpacity
                        key={city.name}
                        style={[
                          styles.optionChip,
                          config.settings.weather.city === city.name && styles.optionChipActive,
                        ]}
                        onPress={() => handleCitySelect(city)}
                      >
                        <Text
                          style={[
                            styles.optionChipText,
                            config.settings.weather.city === city.name && styles.optionChipTextActive,
                          ]}
                        >
                          {city.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Crypto Settings */}
              {widget.id === 'crypto' && isExpanded && isEnabled && (
                <View style={styles.settingsContent}>
                  <Text style={styles.settingsLabel}>Cryptomonnaies (max 4)</Text>
                  <View style={styles.optionsGrid}>
                    {PRESET_CRYPTOS.map((crypto) => {
                      const isSelected = config.settings.crypto.currencies.some(
                        (c) => c.id === crypto.id
                      );
                      return (
                        <TouchableOpacity
                          key={crypto.id}
                          style={[
                            styles.optionChip,
                            isSelected && styles.optionChipActive,
                          ]}
                          onPress={() => handleCryptoToggle(crypto)}
                        >
                          <Text
                            style={[
                              styles.optionChipText,
                              isSelected && styles.optionChipTextActive,
                            ]}
                          >
                            {crypto.symbol}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Football Settings */}
              {widget.id === 'football' && isExpanded && isEnabled && (
                <View style={styles.settingsContent}>
                  <Text style={styles.settingsLabel}>Ligues (max 3)</Text>
                  <View style={styles.optionsGrid}>
                    {PRESET_LEAGUES.map((league) => {
                      const isSelected = config.settings.football.leagues.some(
                        (l) => l.code === league.code
                      );
                      return (
                        <TouchableOpacity
                          key={league.code}
                          style={[
                            styles.optionChip,
                            isSelected && styles.optionChipActive,
                          ]}
                          onPress={() => handleLeagueToggle(league)}
                        >
                          <Text
                            style={[
                              styles.optionChipText,
                              isSelected && styles.optionChipTextActive,
                            ]}
                          >
                            {league.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Stock Settings */}
              {widget.id === 'stock' && isExpanded && isEnabled && (
                <View style={styles.settingsContent}>
                  <Text style={styles.settingsLabel}>Clé API Finnhub</Text>
                  <View style={styles.apiKeyRow}>
                    <View style={styles.apiKeyInputWrap}>
                      <TextInput
                        style={styles.apiKeyInput}
                        placeholder="Collez votre clé API..."
                        placeholderTextColor={colors.textMuted}
                        value={finnhubKey}
                        onChangeText={handleFinnhubKeySave}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry={!finnhubVisible}
                      />
                      <TouchableOpacity
                        style={styles.apiKeyEye}
                        onPress={() => setFinnhubVisible(!finnhubVisible)}
                      >
                        <Ionicons
                          name={finnhubVisible ? 'eye-off' : 'eye'}
                          size={20}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.apiKeyTestBtn,
                        finnhubStatus === 'valid' && styles.apiKeyTestBtnValid,
                        finnhubStatus === 'invalid' && styles.apiKeyTestBtnInvalid,
                      ]}
                      onPress={testFinnhubKey}
                      disabled={finnhubStatus === 'testing' || !finnhubKey.trim()}
                    >
                      {finnhubStatus === 'testing' ? (
                        <ActivityIndicator size="small" color={colors.surface} />
                      ) : finnhubStatus === 'valid' ? (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      ) : finnhubStatus === 'invalid' ? (
                        <Ionicons name="close" size={18} color="#fff" />
                      ) : (
                        <Text style={styles.apiKeyTestText}>Tester</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  {finnhubStatus === 'valid' && (
                    <Text style={styles.apiKeyStatusOk}>Clé valide</Text>
                  )}
                  {finnhubStatus === 'invalid' && (
                    <Text style={styles.apiKeyStatusError}>Clé invalide ou erreur réseau</Text>
                  )}

                  <Text style={[styles.settingsLabel, { marginTop: spacing.md }]}>Actions (max 6)</Text>
                  <View style={styles.optionsGrid}>
                    {PRESET_STOCKS.map((stock) => {
                      const isSelected = config.settings.stock.items.some(
                        (s) => s.symbol === stock.symbol
                      );
                      return (
                        <TouchableOpacity
                          key={stock.symbol}
                          style={[
                            styles.optionChip,
                            isSelected && styles.optionChipActive,
                          ]}
                          onPress={() => handleStockToggle(stock)}
                        >
                          <Text
                            style={[
                              styles.optionChipText,
                              isSelected && styles.optionChipTextActive,
                            ]}
                          >
                            {stock.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={[styles.settingsLabel, { marginTop: spacing.md }]}>ETFs</Text>
                  <View style={styles.optionsGrid}>
                    {PRESET_ETFS.map((etf) => {
                      const isSelected = config.settings.stock.items.some(
                        (s) => s.symbol === etf.symbol
                      );
                      return (
                        <TouchableOpacity
                          key={etf.symbol}
                          style={[
                            styles.optionChip,
                            isSelected && styles.optionChipActive,
                          ]}
                          onPress={() => handleStockToggle(etf)}
                        >
                          <Text
                            style={[
                              styles.optionChipText,
                              isSelected && styles.optionChipTextActive,
                            ]}
                          >
                            {etf.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* News Settings */}
              {widget.id === 'news' && isExpanded && isEnabled && (
                <View style={styles.settingsContent}>
                  <Text style={styles.settingsLabel}>Clé API GNews</Text>
                  <View style={styles.apiKeyRow}>
                    <View style={styles.apiKeyInputWrap}>
                      <TextInput
                        style={styles.apiKeyInput}
                        placeholder="Collez votre clé API..."
                        placeholderTextColor={colors.textMuted}
                        value={gnewsKey}
                        onChangeText={handleGnewsKeySave}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry={!gnewsVisible}
                      />
                      <TouchableOpacity
                        style={styles.apiKeyEye}
                        onPress={() => setGnewsVisible(!gnewsVisible)}
                      >
                        <Ionicons
                          name={gnewsVisible ? 'eye-off' : 'eye'}
                          size={20}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.apiKeyTestBtn,
                        gnewsStatus === 'valid' && styles.apiKeyTestBtnValid,
                        gnewsStatus === 'invalid' && styles.apiKeyTestBtnInvalid,
                      ]}
                      onPress={testGnewsKey}
                      disabled={gnewsStatus === 'testing' || !gnewsKey.trim()}
                    >
                      {gnewsStatus === 'testing' ? (
                        <ActivityIndicator size="small" color={colors.surface} />
                      ) : gnewsStatus === 'valid' ? (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      ) : gnewsStatus === 'invalid' ? (
                        <Ionicons name="close" size={18} color="#fff" />
                      ) : (
                        <Text style={styles.apiKeyTestText}>Tester</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  {gnewsStatus === 'valid' && (
                    <Text style={styles.apiKeyStatusOk}>Clé valide</Text>
                  )}
                  {gnewsStatus === 'invalid' && (
                    <Text style={styles.apiKeyStatusError}>Clé invalide ou erreur réseau</Text>
                  )}

                  <Text style={[styles.settingsLabel, { marginTop: spacing.md }]}>Catégorie</Text>
                  <View style={styles.optionsGrid}>
                    {NEWS_CATEGORIES.map((cat) => {
                      const isSelected = config.settings.news.category === cat.value;
                      return (
                        <TouchableOpacity
                          key={cat.value}
                          style={[
                            styles.optionChip,
                            isSelected && styles.optionChipActive,
                          ]}
                          onPress={() => handleNewsCategorySelect(cat)}
                        >
                          <Text
                            style={[
                              styles.optionChipText,
                              isSelected && styles.optionChipTextActive,
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Currency Settings */}
              {widget.id === 'currency' && isExpanded && isEnabled && (
                <View style={styles.settingsContent}>
                  <Text style={styles.settingsLabel}>Paires de devises</Text>
                  <View style={styles.optionsGrid}>
                    {PRESET_CURRENCY_PAIRS.map((pair) => {
                      const key = `${pair.from}-${pair.to}`;
                      const isSelected = config.settings.currency.pairs.some(
                        (p) => p.from === pair.from && p.to === pair.to
                      );
                      return (
                        <TouchableOpacity
                          key={key}
                          style={[styles.optionChip, isSelected && styles.optionChipActive]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            const current = config.settings.currency.pairs;
                            const newPairs = isSelected
                              ? current.filter((p) => !(p.from === pair.from && p.to === pair.to))
                              : [...current, pair];
                            updateCurrencySettings({ pairs: newPairs });
                          }}
                        >
                          <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                            {pair.from}/{pair.to}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Other Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Autres</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.option, styles.optionBorder]} onPress={handleResetOnboarding}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle-outline" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.optionLabel}>Revoir l{"'"}onboarding</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.optionLabel}>Version</Text>
            </View>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Button title="Se déconnecter" variant="secondary" onPress={signOut} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>InfoNexus</Text>
        <Text style={styles.footerSubtext}>Votre revue de presse personnalisée</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    sectionTitle: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
      marginLeft: spacing.sm,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      gap: spacing.md,
    },
    avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountInfo: {
      flex: 1,
    },
    accountEmail: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    accountLabel: {
      ...typography.caption,
      color: colors.statusOk,
      marginTop: 2,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    optionBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainerActive: {
      backgroundColor: colors.primary + '15',
    },
    optionLabel: {
      ...typography.body,
      color: colors.textPrimary,
    },
    versionText: {
      ...typography.body,
      color: colors.textMuted,
    },
    // Widget styles
    widgetCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    widgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    widgetInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    widgetIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    widgetIconActive: {
      backgroundColor: colors.primary + '15',
    },
    widgetText: {
      flex: 1,
    },
    widgetName: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    widgetDescription: {
      ...typography.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    settingsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    settingsText: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '600',
    },
    settingsContent: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    settingsLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    optionChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionChipText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    optionChipTextActive: {
      color: colors.surface,
      fontWeight: '600',
    },
    // API key styles
    apiKeyRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
      alignItems: 'center',
    },
    apiKeyInputWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
    },
    apiKeyInput: {
      flex: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...typography.body,
      color: colors.textPrimary,
    },
    apiKeyEye: {
      paddingHorizontal: spacing.sm,
    },
    apiKeyTestBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 64,
      height: 40,
    },
    apiKeyTestBtnValid: {
      backgroundColor: '#10B981',
    },
    apiKeyTestBtnInvalid: {
      backgroundColor: '#EF4444',
    },
    apiKeyTestText: {
      ...typography.caption,
      color: '#fff',
      fontWeight: '700',
    },
    apiKeyStatusOk: {
      ...typography.caption,
      color: '#10B981',
      marginBottom: spacing.sm,
    },
    apiKeyStatusError: {
      ...typography.caption,
      color: '#EF4444',
      marginBottom: spacing.sm,
    },
    // City search styles
    citySearchInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...typography.body,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    cityResultsList: {
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: spacing.sm,
    },
    cityResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cityResultText: {
      flex: 1,
    },
    cityResultName: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    cityResultDetail: {
      ...typography.caption,
      color: colors.textMuted,
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing.xxl,
      marginBottom: spacing.xxl,
    },
    footerText: {
      ...typography.titleMd,
      color: colors.primary,
    },
    footerSubtext: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
  });
