import React, { useMemo, useState } from 'react'
import { SEMINAR_EMAIL } from './constants'

type FormState = {
  name: string
  email: string
  phone: string
  org: string
  message: string
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  org: '',
  message: '',
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function App() {
  const [form, setForm] = useState<FormState>(initialState)
  const [status, setStatus] = useState<'idle' | 'error' | 'sending'>('idle')

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {}

    if (!form.name.trim()) e.name = 'Укажите имя'
    if (!form.email.trim()) e.email = 'Укажите email'
    else if (!isValidEmail(form.email)) e.email = 'Неверный формат email'

    if (!form.message.trim()) e.message = 'Добавьте сообщение'

    return e
  }, [form])

  const canSubmit = Object.keys(errors).length === 0

  function onChange<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatus('idle')
  }

  function buildMailto() {
    const subject = encodeURIComponent('Заявка на семинар')

    const bodyLines = [
      `Имя: ${form.name}`,
      `Email: ${form.email}`,
      `Телефон: ${form.phone || '-'}`,
      `Организация: ${form.org || '-'}`,
      `Сообщение: ${form.message}`,
      '',
      '—',
      'Отправлено с формы на сайте',
    ]

    const body = encodeURIComponent(bodyLines.join('\n'))

    return `mailto:${SEMINAR_EMAIL}?subject=${subject}&body=${body}`
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      setStatus('error')
      return
    }

    setStatus('sending')
    const url = buildMailto()
    window.location.href = url

    // Важно: почта откроется/сработает у клиента пользователя.
    // Мы не можем надежно узнать результат отправки через mailto.
  }

  return (
    <div className="page">
      <main className="card">
        <h1>Заявка на семинар</h1>
        <p className="muted">Заполните форму — мы подготовим заявку и откроем письмо в вашем почтовом клиенте.</p>

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="grid">
            <label className="field">
              <span>Имя *</span>
              <input
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Например, Иван"
              />
              {status === 'error' && errors.name && <small className="error">{errors.name}</small>}
            </label>

            <label className="field">
              <span>Email *</span>
              <input
                value={form.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="name@example.com"
                inputMode="email"
              />
              {status === 'error' && errors.email && <small className="error">{errors.email}</small>}
            </label>

            <label className="field">
              <span>Телефон</span>
              <input
                value={form.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="+7 ..."
              />
            </label>

            <label className="field">
              <span>Организация</span>
              <input
                value={form.org}
                onChange={(e) => onChange('org', e.target.value)}
                placeholder="Компания/учебное заведение"
              />
            </label>
          </div>

          <label className="field">
            <span>Сообщение *</span>
            <textarea
              value={form.message}
              onChange={(e) => onChange('message', e.target.value)}
              placeholder="Коротко: цель участия, интересующая тема и т.д."
              rows={5}
            />
            {status === 'error' && errors.message && <small className="error">{errors.message}</small>}
          </label>

          <button className="btn" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Открываем письмо…' : 'Отправить заявку'}
          </button>

          <div className="hint">
            * Поля обязательны. Отправка осуществляется через mailto и зависит от настроек почтового клиента.
          </div>
        </form>
      </main>
    </div>
  )
}

