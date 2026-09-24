// EventsScreen.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ============================================================
   GOOGLE CALENDAR CONFIGURATION
   ============================================================ */

const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID || '';

const GOOGLE_CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/calendar.readonly';

const GOOGLE_GIS_SCRIPT_ID = 'forgetmenot-google-gis';

/* ============================================================
   TYPES
   ============================================================ */

type CalendarProvider = 'Google' | 'Static';

type ExternalEventData = {
  id: string;
  title: string;
  time: string;
  am: string;
  color: string;
  type: string;
  date: Date;
  location?: string;
  description?: string;
  allDay?: boolean;
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

/* ============================================================
   GOOGLE IDENTITY SERVICES TYPE BRIDGE
   ============================================================ */

declare global {
  interface Window {
    google?: any;
  }
}

/* ============================================================
   GOOGLE GIS SCRIPT LOADER
   ============================================================ */

function loadGoogleIdentityServices(): Promise<void> {
  if (Platform.OS !== 'web') {
    return Promise.reject(
      new Error(
        'Google Calendar OAuth in this implementation is available on the web.'
      )
    );
  }

  if (
    typeof window !== 'undefined' &&
    window.google?.accounts?.oauth2
  ) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Browser document is unavailable.'));
      return;
    }

    const existingScript = document.getElementById(
      GOOGLE_GIS_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(
          new Error(
            'Google Identity Services failed to load.'
          )
        )
      );
      return;
    }

    const script = document.createElement('script');

    script.id = GOOGLE_GIS_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (
        window.google?.accounts?.oauth2
      ) {
        resolve();
      } else {
        reject(
          new Error(
            'Google Identity Services loaded, but OAuth is unavailable.'
          )
        );
      }
    };

    script.onerror = () => {
      reject(
        new Error(
          'Unable to load Google Identity Services.'
        )
      );
    };

    document.head.appendChild(script);
  });
}

/* ============================================================
   GOOGLE CALENDAR OAUTH
   ============================================================ */

async function requestGoogleCalendarAccess(): Promise<string> {
  if (Platform.OS !== 'web') {
    throw new Error(
      'Google Calendar OAuth currently requires the web version of the app.'
    );
  }

  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      'Google Calendar Client ID is missing. Add EXPO_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID to your environment.'
    );
  }

  await loadGoogleIdentityServices();

  return new Promise((resolve, reject) => {
    try {
      const tokenClient =
        window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: GOOGLE_CALENDAR_SCOPE,

          callback: (
            response: GoogleTokenResponse
          ) => {
            if (response?.error) {
              reject(
                new Error(
                  response.error_description ||
                    response.error ||
                    'Google Calendar authorization was not completed.'
                )
              );
              return;
            }

            if (!response?.access_token) {
              reject(
                new Error(
                  'Google did not return a Calendar access token.'
                )
              );
              return;
            }

            resolve(response.access_token);
          },

          error_callback: (error: any) => {
            reject(
              new Error(
                error?.message ||
                  'Google Calendar authorization failed.'
              )
            );
          },
        });

      tokenClient.requestAccessToken({
        prompt: 'consent',
      });
    } catch (error: any) {
      reject(
        new Error(
          error?.message ||
            'Unable to start Google Calendar authorization.'
        )
      );
    }
  });
}

/* ============================================================
   DATE HELPERS
   ============================================================ */

function startOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(23, 59, 59, 999);

  return result;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
  }).toUpperCase();
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date: Date): {
  time: string;
  am: string;
} {
  let hours = date.getHours();
  const minutes = date.getMinutes();

  const suffix = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return {
    time: `${hours}:${String(minutes).padStart(2, '0')}`,
    am: suffix,
  };
}

/* ============================================================
   GOOGLE EVENT PARSER
   ============================================================ */

function parseGoogleEvent(
  item: any,
  index: number
): ExternalEventData | null {
  if (!item) {
    return null;
  }

  const title =
    item.summary ||
    item.title ||
    'Untitled Event';

  const colorPalette = [
    '#00F5FF',
    '#FF3EA5',
    '#A8FF00',
    '#FFD166',
    '#9C4DFF',
  ];

  const color =
    colorPalette[index % colorPalette.length];

  /* ----------------------------------------------------------
     ALL-DAY EVENT
     ---------------------------------------------------------- */

  if (item.start?.date) {
    const date = new Date(
      `${item.start.date}T00:00:00`
    );

    return {
      id: item.id || `google-${index}`,
      title,
      time: 'ALL DAY',
      am: '',
      color,
      type: 'CALENDAR',
      date,
      location: item.location,
      description: item.description,
      allDay: true,
    };
  }

  /* ----------------------------------------------------------
     TIMED EVENT
     ---------------------------------------------------------- */

  if (item.start?.dateTime) {
    const date = new Date(
      item.start.dateTime
    );

    const formatted = formatTime(date);

    return {
      id: item.id || `google-${index}`,
      title,
      time: formatted.time,
      am: formatted.am,
      color,
      type: 'CALENDAR',
      date,
      location: item.location,
      description: item.description,
      allDay: false,
    };
  }

  return null;
}

/* ============================================================
   STATIC FALLBACK DATA
   ============================================================ */

function createStaticEvents(): ExternalEventData[] {
  const today = new Date();

  const createDate = (
    offset: number,
    hour: number,
    minute: number
  ) => {
    const date = new Date(today);

    date.setDate(date.getDate() + offset);
    date.setHours(hour, minute, 0, 0);

    return date;
  };

  return [
    {
      id: 'static-1',
      title: 'Morning Planning',
      time: '9:00',
      am: 'AM',
      color: '#00F5FF',
      type: 'PLANNING',
      date: createDate(0, 9, 0),
    },
    {
      id: 'static-2',
      title: 'Project Review',
      time: '11:30',
      am: 'AM',
      color: '#FF3EA5',
      type: 'WORK',
      date: createDate(1, 11, 30),
    },
    {
      id: 'static-3',
      title: 'Lunch Meeting',
      time: '1:00',
      am: 'PM',
      color: '#A8FF00',
      type: 'MEETING',
      date: createDate(2, 13, 0),
    },
    {
      id: 'static-4',
      title: 'Design Session',
      time: '3:30',
      am: 'PM',
      color: '#FFD166',
      type: 'DESIGN',
      date: createDate(3, 15, 30),
    },
  ];
}

/* ============================================================
   EVENTS SCREEN
   ============================================================ */

export default function EventsScreen({ onNavigate = (screen: string) => console.log(`Navigating to: ${screen}`) }: { onNavigate?: (screen: string) => void }) {
  /*
   * IMPORTANT:
   *
   * There is intentionally NO Firebase auth here.
   *
   * There is intentionally NO Microsoft authentication here.
   *
   * Google Calendar OAuth belongs only to this screen.
   */

  const [calendarProvider, setCalendarProvider] =
    useState<CalendarProvider>('Static');

  const [googleAccessToken, setGoogleAccessToken] =
    useState<string | null>(null);

  const [hasPermission, setHasPermission] =
    useState(false);

  const [connectingGoogle, setConnectingGoogle] =
    useState(false);

  const [loadingEvents, setLoadingEvents] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [events, setEvents] =
    useState<ExternalEventData[]>([]);

  const [selectedDay, setSelectedDay] =
    useState(0);

  const mountedRef = useRef(true);

  // 🟢 FIX 1: ADD LOCALSTORAGE TOKEN STATE KEY NODES
    const STORAGE_KEY_TOKEN = 'forgetmenot_google_access_token';

  // Update state hooks section
 // const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

    // 🟢 FIX 2B: ADD DISCONNECT LOGIC PIPELINE
    const disconnectGoogleCalendar = useCallback(() => {
      if (Platform.OS === 'web') {
        localStorage.removeItem('forgetmenot_google_access_token');
      }
      setGoogleAccessToken(null);
      setHasPermission(false);
      setCalendarProvider('Static');
      setEvents([]);
      setErrorMessage(null);
    }, []);



  // Add this persistent check inside your component initialization
    useEffect(() => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const preservedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
        if (preservedToken) {
          console.log("🔑 Session token recovered from cache memory.");
          setGoogleAccessToken(preservedToken);
          setCalendarProvider('Google');
          setHasPermission(true);
          fetchGoogleCalendarEvents(preservedToken);
        }
      }
    }, []);

  /* ==========================================================
     CLEANUP
     ========================================================== */

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);




  /* ==========================================================
     STATIC EVENTS
     ========================================================== */

  const staticEvents = useMemo(
    () => createStaticEvents(),
    []
  );

  /* ==========================================================
     NEXT 7 DAYS
     ========================================================== */

  const days = useMemo(() => {
    const result: Date[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < 7; i++) {
      const day = new Date(today);

      day.setDate(
        today.getDate() + i
      );

      result.push(day);
    }

    return result;
  }, []);

  /* ==========================================================
     FETCH GOOGLE CALENDAR EVENTS
     ========================================================== */

  const fetchGoogleCalendarEvents = useCallback(
    async (token: string) => {
      setLoadingEvents(true);
      setErrorMessage(null);

      try {
        const now = new Date();

        const rangeStart = startOfDay(now);

        const rangeEnd = new Date(now);

        rangeEnd.setDate(
          rangeEnd.getDate() + 7
        );

        rangeEnd.setHours(
          23,
          59,
          59,
          999
        );

        const params = new URLSearchParams();

        params.set(
          'timeMin',
          rangeStart.toISOString()
        );

        params.set(
          'timeMax',
          rangeEnd.toISOString()
        );

        params.set(
          'singleEvents',
          'true'
        );

        params.set(
          'orderBy',
          'startTime'
        );

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
          {
            method: 'GET',

            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        /*
         * ------------------------------------------------------
         * TOKEN EXPIRED / INVALID
         * ------------------------------------------------------
         */

        if (response.status === 401) {
          if (mountedRef.current) {
            setGoogleAccessToken(null);
            setHasPermission(false);
            setCalendarProvider('Static');
            setEvents([]);
            setErrorMessage(
              'Your Google Calendar permission has expired. Please connect Google Calendar again.'
            );
          }

          return;
        }

        if (!response.ok) {
          const errorBody =
            await response.text();

          throw new Error(
            `Google Calendar returned ${response.status}. ${errorBody}`
          );
        }

        const data =
          await response.json();

        const parsedEvents: ExternalEventData[] =
          (data?.items || [])
            .map(
              (
                item: any,
                index: number
              ) =>
                parseGoogleEvent(
                  item,
                  index
                )
            )
            .filter(
              (
                item: ExternalEventData | null
              ): item is ExternalEventData =>
                Boolean(item)
            );

        if (mountedRef.current) {
          setEvents(parsedEvents);
          setCalendarProvider('Google');
          setHasPermission(true);
        }
      } catch (error: any) {
        console.error(
          '💥 [GOOGLE CALENDAR] Fetch failed:',
          error
        );

        if (mountedRef.current) {
          setErrorMessage(
            error?.message ||
              'Unable to load Google Calendar events.'
          );
        }
      } finally {
        if (mountedRef.current) {
          setLoadingEvents(false);
        }
      }
    },
    []
  );

  /* ==========================================================
     CONNECT GOOGLE CALENDAR
     ========================================================== */

  const connectGoogleCalendar =
    useCallback(async () => {
      if (connectingGoogle) {
        return;
      }

      setConnectingGoogle(true);
      setErrorMessage(null);

      try {
        /*
         * THIS IS THE IMPORTANT PART:
         *
         * This OAuth flow is completely independent of Firebase.
         *
         * We are NOT using:
         *
         * currentUser.stsTokenManager.accessToken
         *
         * and we are NOT using Firebase Google Auth.
         */

        const token =
          await requestGoogleCalendarAccess();

        if (!token) {
          throw new Error(
            'Google Calendar authorization did not return an access token.'
          );
        }

        if (!mountedRef.current) {
          return;
        }

        /*
         * Token exists ONLY in this EventsScreen.
         */
        // 🟢 FIX 2A: SAVE TOKEN ON SUCCESSFUL Handshake
              if (Platform.OS === 'web') {
                localStorage.setItem('forgetmenot_google_access_token', token);
          }

        setGoogleAccessToken(token);
        setCalendarProvider('Google');
        setHasPermission(true);

        /*
         * Immediately fetch calendar events
         * after Google grants permission.
         */

        await fetchGoogleCalendarEvents(
          token
        );
      } catch (error: any) {
        console.error(
          '💥 [GOOGLE OAUTH] Authorization failed:',
          error
        );

        if (mountedRef.current) {
          setHasPermission(false);
          setCalendarProvider('Static');

          setErrorMessage(
            error?.message ||
              'Google Calendar permission was not granted.'
          );
        }
      } finally {
        if (mountedRef.current) {
          setConnectingGoogle(false);
        }
      }
    }, [
      connectingGoogle,
      fetchGoogleCalendarEvents,
    ]);

  /* ==========================================================
     REFRESH
     ========================================================== */

  const refreshEvents =
    useCallback(async () => {
      setRefreshing(true);

      try {
        if (
          googleAccessToken &&
          hasPermission
        ) {
          await fetchGoogleCalendarEvents(
            googleAccessToken
          );
        }
      } finally {
        if (mountedRef.current) {
          setRefreshing(false);
        }
      }
    }, [
      googleAccessToken,
      hasPermission,
      fetchGoogleCalendarEvents,
    ]);

  /* ==========================================================
     DISPLAY EVENTS
     ========================================================== */

  const displayEvents = useMemo(() => {
    if (
      calendarProvider === 'Google' &&
      hasPermission
    ) {
      return events;
    }

    return staticEvents;
  }, [
    calendarProvider,
    events,
    hasPermission,
    staticEvents,
  ]);

  /* ==========================================================
     EVENTS FOR SELECTED DAY
     ========================================================== */

  const selectedDate =
    days[selectedDay];

  const selectedDayEvents =
    useMemo(() => {
      if (!selectedDate) {
        return [];
      }

      const selectedStart =
        startOfDay(selectedDate);

      const selectedEnd =
        endOfDay(selectedDate);

      return displayEvents
        .filter((event) => {
          const eventTime =
            event.date.getTime();

          return (
            eventTime >=
              selectedStart.getTime() &&
            eventTime <=
              selectedEnd.getTime()
          );
        })
        .sort(
          (a, b) =>
            a.date.getTime() -
            b.date.getTime()
        );
    }, [
      displayEvents,
      selectedDate,
    ]);

  /* ==========================================================
     GOOGLE CONNECTED STATE
     ========================================================== */

  const isGoogleConnected =
    calendarProvider === 'Google' &&
    hasPermission &&
    Boolean(googleAccessToken);

  /* ==========================================================
     RENDER
     ========================================================== */

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* ==================================================
              HEADER (FIXED TOP)
              ================================================== */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>FORGETMENOT AI</Text>
              <Text style={styles.title}>Events</Text>
              <Text style={styles.subtitle}>Your calendar, connected to context.</Text>
            </View>
            <View style={[styles.statusDot, isGoogleConnected ? styles.statusConnected : styles.statusOffline]} />
          </View>

          {/* ==================================================
              🟢 STEP 1: INNER WORKSPACE CONTAINER (FLEX ENGINE UNLOCKED)
              ================================================== */}
          <View style={styles.mainViewportWorkspace}>

            {/* GOOGLE CALENDAR CONNECTION CARD PANEL */}
            {!isGoogleConnected ? (
              <View style={styles.connectionCard}>
                <View style={styles.googleIcon}><Text style={styles.googleG}>G</Text></View>
                <View style={styles.connectionContent}>
                  <Text style={styles.connectionTitle}>Connect Google Calendar</Text>
                  <Text style={styles.connectionDescription}>Allow ForgetMeNot AI to read your Google Calendar events.</Text>

                  {/* Pink Environment Context Warning Container */}
                  <View style={styles.testingEnvironmentWarningBox}>
                    <Feather name="info" size={14} color="#FF3EA5" style={{ marginTop: 2 }} />
                    <Text style={styles.testingEnvironmentWarningText}>
                      This feature currently works only for our registered test user pool as the app is still in testing mode.
                      Please send your Gmail address to our developer account. After successful email confirmation, you can access your Google Calendar here.
                    </Text>
                    <Pressable onPress={() => onNavigate('contact')} style={styles.contactLinkInlinePressable}>
                      <Text style={styles.contactLinkInlineText}>Drop us an email via Contact Support →</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.permissionText}>READ-ONLY ACCESS</Text>
                </View>

                <Pressable style={[styles.grantButton, connectingGoogle && styles.grantButtonDisabled]} disabled={connectingGoogle} onPress={connectGoogleCalendar}>
                  {connectingGoogle ? <ActivityIndicator size="small" color="#000" /> : (<><Feather name="calendar" size={17} color="#000" /><Text style={styles.grantButtonText}>Grant Access</Text></>)}
                </Pressable>

                {errorMessage ? (<View style={styles.errorBox}><Feather name="alert-circle" size={16} color="#FF3EA5" /><Text style={styles.errorText}>{errorMessage}</Text></View>) : null}
                <Text style={styles.oauthExplanation}>Google will open its own secure permission window. Your existing ForgetMeNot login is not used for Calendar authorization.</Text>
              </View>
            ) : (
              <View style={styles.connectedCard}>
                <View style={styles.connectedIcon}><Feather name="check" size={20} color="#000" /></View>
                <View style={styles.connectedContent}>
                  <Text style={styles.connectedTitle}>Google Calendar Connected</Text>
                  <Text style={styles.connectedSubtitle}>Calendar events are being loaded from your Google account permanently.</Text>
                </View>

                <Pressable style={styles.refreshButton} onPress={refreshEvents}>
                  {refreshing || loadingEvents ? <ActivityIndicator size="small" color="#00F5FF" /> : <Feather name="refresh-cw" size={18} color="#00F5FF" />}
                </Pressable>
              </View>
            )}

            {/* TIMELINE DAYS CONTAINER SECTION */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TIMELINE</Text>
              <Text style={styles.providerLabel}>{isGoogleConnected ? 'GOOGLE CALENDAR' : 'LOCAL PREVIEW'}</Text>
            </View>

            <View style={{ height: 80, marginBottom: 10 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
                {days.map((day, index) => {
                  const active = selectedDay === index;
                  return (
                    <Pressable key={day.toISOString()} onPress={() => setSelectedDay(index)} style={[styles.dayCard, active && styles.dayCardActive]}>
                      <Text style={[styles.dayName, active && styles.dayNameActive]}>{index === 0 ? 'TODAY' : formatDayLabel(day)}</Text>
                      <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{day.getDate()}</Text>
                      <Text style={[styles.dayMonth, active && styles.dayMonthActive]}>{day.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* DYNAMIC SCROLLABLE REFRESH EVENT LIST */}
            <ScrollView
              style={styles.eventScroll}
              contentContainerStyle={styles.eventContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshEvents} tintColor="#00F5FF" />}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.dateHeading}>
                <Text style={styles.dateHeadingText}>{formatDateLabel(selectedDate)}</Text>
                <Text style={styles.eventCount}>{selectedDayEvents.length} EVENT{selectedDayEvents.length === 1 ? '' : 'S'}</Text>
              </View>

              {loadingEvents && isGoogleConnected ? (
                <View style={styles.loadingBox}><ActivityIndicator size="large" color="#00F5FF" /><Text style={styles.loadingText}>Loading Google Calendar...</Text></View>
              ) : selectedDayEvents.length === 0 ? (
                <View style={styles.emptyBox}><View style={styles.emptyIcon}><Feather name="calendar" size={26} color="#555" /></View><Text style={styles.emptyTitle}>No events</Text><Text style={styles.emptyText}>There are no calendar events scheduled for this day.</Text></View>
              ) : (
                selectedDayEvents.map((event) => (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={[styles.eventAccent, { backgroundColor: event.color }]} />
                    <View style={styles.eventTime}>
                      <Text style={styles.eventTimeText}>{event.time}</Text>
                      {event.am ? <Text style={styles.eventAm}>{event.am}</Text> : null}
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                      <Text style={[styles.eventType, { color: event.color }]}>{event.allDay ? 'ALL DAY' : event.type}</Text>
                    </View>
                    <View style={styles.eventChevron}><Feather name="chevron-right" size={18} color="#444" /></View>
                  </View>
                ))
              )}
            </ScrollView>

          </View> {/* 🔚 STEP 1 VIEW CLOSES HERE: SCROLLABLE SPACE IS BOUNDED */}

          {/* ==================================================
              🟢 STEP 2: STICKY VIEWPORT FOOTER STATUS BAR (LOCKED AT THE RIDGE OF NAVIGATION TABS)
              ================================================== */}
          <View style={styles.footerStatus}>
            <View style={styles.footerStatusStatusRow}>
              <View style={[styles.footerDot, { backgroundColor: isGoogleConnected ? '#A8FF00' : '#555' }]} />
              <Text style={styles.footerText}>
                {isGoogleConnected ? 'LIVE GOOGLE CALENDAR DATA' : 'CALENDAR NOT CONNECTED'}
              </Text>
            </View>

            {isGoogleConnected && (
              <View style={styles.footerConnectedContentCardRow}>
                <Pressable onPress={disconnectGoogleCalendar} style={styles.footerDisconnectLinkButton} hitSlop={8}>
                  <Text style={styles.footerDisconnectLinkText}>Disconnect & Remove Access ✖</Text>
                </Pressable>
              </View>
            )}
          </View>

        </View>
      </SafeAreaView>

  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505',
  },

   container: {
      flex: 1,
      backgroundColor: '#050505',
      paddingHorizontal: 18,
      flexDirection: 'column' // Aligns elements neatly in a vertical column grid layout tree
    },

// 🟢 NEW CLASS RULE: Binds everything except header and footer to a flexible viewport block
  mainViewportWorkspace: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden' // Prevents the scrolling section from pushing elements down past the visible screen
  },

  /* ----------------------------------------------------------
     HEADER
     ---------------------------------------------------------- */

  header: {
      paddingTop: 18,
      paddingBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },

  eyebrow: {
    color: '#00F5FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  subtitle: {
    color: '#777',
    fontSize: 13,
    marginTop: 4,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 9,
  },

  statusConnected: {
    backgroundColor: '#A8FF00',
  },

  statusOffline: {
    backgroundColor: '#444',
  },

  /* ----------------------------------------------------------
     CONNECTION CARD
     ---------------------------------------------------------- */

  connectionCard: {
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 18,
    backgroundColor: '#0B0B0B',
    padding: 16,
  },

  googleIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  googleG: {
    color: '#4285F4',
    fontSize: 23,
    fontWeight: '800',
  },

  connectionContent: {
    marginBottom: 14,
  },

  connectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },

  connectionDescription: {
    color: '#888',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 500,
  },

  permissionText: {
    color: '#00F5FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginTop: 8,
  },

  grantButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#00F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 18,
  },

  grantButtonDisabled: {
    opacity: 0.6,
  },

  grantButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },

  oauthExplanation: {
    color: '#555',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 12,
  },

  errorBox: {
    marginTop: 12,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A182B',
    backgroundColor: '#160A10',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },

  errorText: {
    flex: 1,
    color: '#FF6DB7',
    fontSize: 11,
    lineHeight: 16,
  },

  /* ----------------------------------------------------------
     CONNECTED CARD
     ---------------------------------------------------------- */

  connectedCard: {
    borderWidth: 1,
    borderColor: '#183323',
    borderRadius: 18,
    backgroundColor: '#080D09',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  connectedIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#A8FF00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  connectedContent: {
    flex: 1,
  },

  connectedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  connectedSubtitle: {
    color: '#666',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#101010',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ----------------------------------------------------------
     SECTION
     ---------------------------------------------------------- */

  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },

  providerLabel: {
    color: '#555',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* ----------------------------------------------------------
     DAYS
     ---------------------------------------------------------- */

  daysContainer: {
    gap: 8,
    paddingBottom: 3,
  },

  dayCard: {
    width: Math.min(
      67,
      (SCREEN_WIDTH - 70) / 5
    ),
    minWidth: 58,
    height: 76,
    borderRadius: 13,
    backgroundColor: '#0C0C0C',
    borderWidth: 1,
    borderColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayCardActive: {
    backgroundColor: '#071A1C',
    borderColor: '#00F5FF',
  },

  dayName: {
    color: '#555',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  dayNameActive: {
    color: '#00F5FF',
  },

  dayNumber: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 3,
  },

  dayNumberActive: {
    color: '#00F5FF',
  },

  dayMonth: {
    color: '#555',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },

  dayMonthActive: {
    color: '#00F5FF',
  },

  /* ----------------------------------------------------------
     EVENTS
     ---------------------------------------------------------- */

  eventScroll: {
    flex: 1,
    marginTop: 8,
  },

  eventContent: {
    paddingBottom: 40,
  },

  dateHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  dateHeadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  eventCount: {
    color: '#555',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  eventCard: {
    minHeight: 82,
    borderRadius: 14,
    backgroundColor: '#0B0B0B',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  eventAccent: {
    width: 3,
    alignSelf: 'stretch',
  },

  eventTime: {
    width: 74,
    paddingLeft: 14,
  },

  eventTimeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  eventAm: {
    color: '#555',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },

  eventInfo: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 8,
  },

  eventTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },

  eventMeta: {
    marginTop: 5,
  },

  eventType: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
  },

  metaText: {
    color: '#666',
    fontSize: 10,
    flex: 1,
  },

  eventChevron: {
    paddingHorizontal: 13,
  },

  /* ----------------------------------------------------------
     LOADING
     ---------------------------------------------------------- */

  loadingBox: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#666',
    fontSize: 12,
    marginTop: 12,
  },

  /* ----------------------------------------------------------
     EMPTY
     ---------------------------------------------------------- */

  emptyBox: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0D0D0D',
    borderWidth: 1,
    borderColor: '#202020',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  emptyText: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 5,
  },

  /* ----------------------------------------------------------
     FOOTER
     ---------------------------------------------------------- */

    // =========================================================================
    // 🟢 FIXED: PUSHES FOOTER UP SO IT SITS CLEANLY ABOVE THE NAVIGATION TABS
    // =========================================================================
    footerStatus: {
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: '#1C1C1C',
      backgroundColor: '#050505',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',

      // 🧠 THE MAGIC LINES: Adjust the 60 to perfectly match your tab bar's height if needed
      marginBottom: Platform.OS === 'web' ? 84 : 0,
      zIndex: 999, // Guarantees it renders over background layers
    },


  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  footerText: {
      color: '#62626a',
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.3,
    },

testingEnvironmentWarningBox: {
  marginTop: 12,
  backgroundColor: 'rgba(255, 204, 0, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 204, 0, 0.2)',
  padding: 12,
  borderRadius: 10,
  flexDirection: 'column',
  gap: 6
},
testingEnvironmentWarningBox: {
  marginTop: 12,
  backgroundColor: 'rgba(255, 62, 165, 0.05)', // Transparent pink glow scrim
  borderWidth: 1,
  borderColor: 'rgba(255, 62, 165, 0.25)', // Subtle pink boundary border
  padding: 12,
  borderRadius: 10,
  flexDirection: 'column',
  gap: 6
},
testingEnvironmentWarningText: {
  color: '#FF3EA5', // Vibrant cyberpunk pink text alignment
  fontSize: 12,
  lineHeight: 18,
  fontWeight: '500'
},
contactLinkInlinePressable: {
  marginTop: 4,
  alignSelf: 'flex-start'
},
contactLinkInlineText: {
  color: '#00F5FF',
  fontSize: 12,
  fontWeight: '700',
  textDecorationLine: 'underline'
},
footerStatusStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

footerConnectedContentCardRow: {
    marginTop: 4,
    alignItems: 'center',
  },
  footerDisconnectLinkButton: {
    paddingVertical: 2,
  },
  footerDisconnectLinkText: {
    color: '#FF3EA5',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});