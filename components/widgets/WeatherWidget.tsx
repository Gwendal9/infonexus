import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface WeatherData {
  temperature: number;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  isDay: boolean;
  windGusts: number;
  forecast?: {
    date: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    windGustsMax: number;
    precipProbability: number;
  }[];
}

const getWeatherInfo = (code: number, isDay: boolean): { icon: string; label: string } => {
  if (code === 0) return { icon: isDay ? 'sunny' : 'moon', label: 'Clair' };
  if (code <= 3) return { icon: isDay ? 'partly-sunny' : 'cloudy-night', label: 'Nuageux' };
  if (code <= 49) return { icon: 'cloud', label: 'Brumeux' };
  if (code <= 69) return { icon: 'rainy', label: 'Pluie' };
  if (code <= 79) return { icon: 'snow', label: 'Neige' };
  if (code <= 99) return { icon: 'thunderstorm', label: 'Orage' };
  return { icon: 'cloud', label: 'Variable' };
};

const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days[date.getDay()];
};

interface WeatherWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

export function WeatherWidget({ compact, expanded }: WeatherWidgetProps) {
  const colors = useColors();
  const { config } = useWidgetConfig();
  const { city, latitude, longitude, showForecast } = config.settings.weather;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const forecastDays = (showForecast || expanded) ? 5 : 1;
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_gusts_10m_max,precipitation_probability_max&timezone=auto&forecast_days=${forecastDays}`
      );

      if (!response.ok) throw new Error('Failed to fetch weather');

      const data = await response.json();

      const weatherData: WeatherData = {
        temperature: Math.round(data.current.temperature_2m),
        temperatureMax: Math.round(data.daily.temperature_2m_max[0]),
        temperatureMin: Math.round(data.daily.temperature_2m_min[0]),
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
        windGusts: Math.round(data.current.wind_gusts_10m ?? 0),
      };

      if ((showForecast || expanded) && data.daily.time.length > 1) {
        weatherData.forecast = data.daily.time.slice(1).map((date: string, i: number) => ({
          date,
          tempMax: Math.round(data.daily.temperature_2m_max[i + 1]),
          tempMin: Math.round(data.daily.temperature_2m_min[i + 1]),
          weatherCode: data.daily.weather_code[i + 1],
          windGustsMax: Math.round(data.daily.wind_gusts_10m_max?.[i + 1] ?? 0),
          precipProbability: Math.round(data.daily.precipitation_probability_max?.[i + 1] ?? 0),
        }));
      }

      setWeather(weatherData);
    } catch (err) {
      console.error('[WeatherWidget] Error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, showForecast, expanded]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const styles = createStyles(colors, compact, expanded);

  if (loading) {
    return (
      <WidgetContainer title="Météo" icon="partly-sunny" compact={compact} expanded={expanded}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </WidgetContainer>
    );
  }

  if (error || !weather) {
    return (
      <WidgetContainer title="Météo" icon="partly-sunny" compact={compact} expanded={expanded}>
        <Text style={styles.errorText}>Indisponible</Text>
      </WidgetContainer>
    );
  }

  const weatherInfo = getWeatherInfo(weather.weatherCode, weather.isDay);

  // Compact mode - minimal display for widget row
  if (compact) {
    return (
      <WidgetContainer title={city} icon="location" compact>
        <View style={styles.compactContent}>
          <Ionicons
            name={weatherInfo.icon as any}
            size={36}
            color={weather.isDay ? '#FFB800' : '#6B7280'}
          />
          <Text style={styles.compactTemp}>{weather.temperature}°</Text>
          <Text style={styles.compactCondition}>{weatherInfo.label}</Text>
          <View style={styles.compactGusts}>
            <Ionicons name="flag" size={10} color={colors.textMuted} />
            <Text style={styles.compactGustsText}>{weather.windGusts} km/h</Text>
          </View>
        </View>
      </WidgetContainer>
    );
  }

  // Normal/expanded mode
  return (
    <WidgetContainer title={city} icon="location" expanded={expanded}>
      <View style={styles.content}>
        <View style={styles.currentWeather}>
          <Ionicons
            name={weatherInfo.icon as any}
            size={expanded ? 64 : 40}
            color={weather.isDay ? '#FFB800' : '#6B7280'}
          />
          <View style={styles.info}>
            <Text style={styles.temperature}>{weather.temperature}°</Text>
            <Text style={styles.condition}>{weatherInfo.label}</Text>
            <Text style={styles.minMax}>
              Min {weather.temperatureMin}° / Max {weather.temperatureMax}°
            </Text>
            <Text style={styles.gusts}>
              Rafales : {weather.windGusts} km/h
            </Text>
          </View>
        </View>

        {(showForecast || expanded) && weather.forecast && (
          <View style={styles.forecast}>
            {weather.forecast.map((day) => {
              const dayInfo = getWeatherInfo(day.weatherCode, true);
              return (
                <View key={day.date} style={styles.forecastRow}>
                  <Text style={styles.dayName}>{getDayName(day.date)}</Text>
                  <Ionicons
                    name={dayInfo.icon as any}
                    size={expanded ? 24 : 18}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.forecastTemp}>
                    {day.tempMin}° / {day.tempMax}°
                  </Text>
                  <View style={styles.forecastDetail}>
                    <Ionicons name="flag" size={12} color={colors.textMuted} />
                    <Text style={styles.forecastDetailText}>{day.windGustsMax}</Text>
                  </View>
                  <View style={styles.forecastDetail}>
                    <Ionicons name="rainy" size={12} color={colors.textMuted} />
                    <Text style={styles.forecastDetailText}>{day.precipProbability}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </WidgetContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, compact?: boolean, expanded?: boolean) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    compactContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    compactTemp: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    compactCondition: {
      ...typography.small,
      color: colors.textMuted,
    },
    compactGusts: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    compactGustsText: {
      fontSize: 10,
      color: colors.textMuted,
    },
    content: {
      gap: spacing.md,
    },
    currentWeather: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    info: {
      flex: 1,
    },
    temperature: {
      fontSize: expanded ? 48 : 28,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    condition: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    minMax: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    gusts: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    forecast: {
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },
    forecastRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: expanded ? spacing.sm : 2,
    },
    dayName: {
      ...typography.body,
      color: colors.textMuted,
      fontWeight: '600',
      width: 36,
    },
    forecastTemp: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
      flex: 1,
    },
    forecastDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      minWidth: 44,
    },
    forecastDetailText: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
    },
    errorText: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
