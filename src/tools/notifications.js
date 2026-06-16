import { notifications } from '@mantine/notifications'
import i18n from './i18n'

const t = i18n.t.bind(i18n)

export function notifyError(message) {
  notifications.show({
    title: t('Error'),
    message: String(message),
    color: 'red',
  })
}

export function notifySuccess(message) {
  notifications.show({
    title: t('Success'),
    message: String(message),
    color: 'green',
  })
}
