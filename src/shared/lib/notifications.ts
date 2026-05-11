import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

let fcmToken: string | null = null

export async function initNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  // Запрашиваем разрешение на локальные уведомления
  await LocalNotifications.requestPermissions()

  // Регистрируемся в FCM для push когда приложение убито
  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') return

  await PushNotifications.register()

  PushNotifications.addListener('registration', (token) => {
    fcmToken = token.value
    // Сохраняем токен локально для будущего использования
    localStorage.setItem('fcm_token', token.value)
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.error('FCM registration error:', err)
  })

  // Обработка входящих push когда приложение открыто
  PushNotifications.addListener('pushNotificationReceived', () => {
    // Уже показываем in-app toast через геолокацию — игнорируем дубль
  })
}

export function getFcmToken(): string | null {
  return fcmToken || localStorage.getItem('fcm_token')
}

export async function showLocalNotification(title: string, body: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now(),
        title,
        body,
        sound: undefined,
        smallIcon: 'ic_stat_icon_config_sample',
        iconColor: '#E85D26',
      },
    ],
  })
}
