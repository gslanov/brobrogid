import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/ui/PageHeader'
import { formatPrice } from '@/shared/lib/utils'
import type { SubscriptionPlan } from '@/data/types'

const PLANS: Array<{ plan: SubscriptionPlan; price: number; features: string[] }> = [
  { plan: '1week', price: 299, features: ['\u041E\u0444\u0444\u043B\u0430\u0439\u043D \u043A\u0430\u0440\u0442\u044B', '\u0413\u043E\u043B\u043E\u0441\u043E\u0432\u0430\u044F \u043E\u0437\u0432\u0443\u0447\u043A\u0430', '\u0410\u0432\u0442\u043E-\u043F\u043B\u0430\u043D \u0434\u043D\u044F', '\u0411\u0435\u0437 \u0440\u0435\u043A\u043B\u0430\u043C\u044B'] },
  { plan: '2weeks', price: 499, features: ['\u0412\u0441\u0451 \u0438\u0437 1 \u043D\u0435\u0434.', '+ \u041F\u0440\u0435\u043C\u0438\u0443\u043C \u043C\u0435\u0441\u0442\u0430', '+ \u0411\u0435\u0437\u043B\u0438\u043C\u0438\u0442 \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0439', '+ \u041C\u0430\u0440\u0448\u0440\u0443\u0442\u044B'] },
  { plan: '3weeks', price: 699, features: ['\u0412\u0441\u0451 \u0438\u0437 2 \u043D\u0435\u0434.', '+ \u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0444\u043E\u0442\u043E', '+ \u0421\u043A\u0438\u0434\u043A\u0438 \u043D\u0430 \u0442\u0443\u0440\u044B', '+ VIP \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430'] },
]

export default function SubscriptionPage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<SubscriptionPlan>('2weeks')

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <PageHeader title={t('subscription.title')} showBack />

      <div className="px-4 py-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{'\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0432\u0441\u0451'}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{'\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u043E\u0442 \u043F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u044F \u043F\u043E \u041E\u0441\u0435\u0442\u0438\u0438'}</p>
        </div>

        <div className="space-y-3">
          {PLANS.map((p) => (
            <button
              key={p.plan}
              onClick={() => setSelected(p.plan)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${selected === p.plan ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-md' : 'border-[var(--color-border)] bg-white'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-base">{t(`subscription.${p.plan}`)}</h3>
                <span className="text-xl font-bold text-[var(--color-primary)]">{formatPrice(p.price)}</span>
              </div>
              <ul className="space-y-1">
                {p.features.map((f, i) => (
                  <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <span className="text-green-500">{'\u2713'}</span> {f}
                  </li>
                ))}
              </ul>
              {p.plan === '2weeks' && (
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-[var(--color-accent)] text-white text-[11px] font-bold rounded-full">{'\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0439'}</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => alert(t('subscription.comingSoon', 'Скоро! Оплата будет доступна в следующем обновлении'))}
          className="w-full mt-6 py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm"
        >
          {t('subscription.subscribe')} {'\u2022'} {formatPrice(PLANS.find((p) => p.plan === selected)!.price)}
        </button>
        <p className="text-center text-xs text-[var(--color-text-secondary)] mt-2">{'\u041E\u043F\u043B\u0430\u0442\u0430 \u0447\u0435\u0440\u0435\u0437 \u0421\u0411\u041F'}</p>
      </div>
    </div>
  )
}
