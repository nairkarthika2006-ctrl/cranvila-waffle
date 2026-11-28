import { useState } from 'react'
import { api } from '../api.js'
import { PHONE, PHONE_LINK, EMAIL, ADDRESS, MAP_QUERY } from '../data.js'
import { useI18n } from '../context/I18n.jsx'

export default function Contact() {
  const { t } = useI18n()
  const [form, setForm] = useState({ name: '', phone: '', message: '', enquiryType: 'general', eventDate: '', guests: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErrors({}); setFormError(''); setSent(false)
    try {
      await api.contact(form)
      setSent(true)
      setForm({ name: '', phone: '', message: '', enquiryType: 'general', eventDate: '', guests: '' })
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(t(err.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section className="phead"><div className="wrap"><h1>{t('Contact')}</h1><p>{t('Questions, party orders or feedback. We reply fast.')}</p></div></section>
      <section className="sec">
        <div className="wrap split top">
          <div className="card">
            <h3>{t('Call to order')}</h3>
            <a className="bigcall" href={PHONE_LINK}>{PHONE}</a>
            <p>{t('Daily 11 am to 11 pm')}</p>
            <h3>{t('Visit')}</h3>
            <p>{ADDRESS[0]}<br />{ADDRESS[1]}</p>
            <h3>{t('Email')}</h3>
            <p><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          </div>
          <form className="card" onSubmit={submit} noValidate>
            <h3>{t('Send a message')}</h3>
            <label htmlFor="n">{t('Name')}</label>
            <input id="n" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} />
            {errors.name && <p className="ferr">{t(errors.name)}</p>}
            <label htmlFor="p">{t('Phone')}</label>
            <input id="p" type="tel" value={form.phone} onChange={set('phone')} aria-invalid={!!errors.phone} />
            {errors.phone && <p className="ferr">{t(errors.phone)}</p>}
            <label htmlFor="m">{t('Message')}</label>
            <textarea id="m" rows="4" value={form.message} onChange={set('message')} aria-invalid={!!errors.message} />
            {errors.message && <p className="ferr">{t(errors.message)}</p>}
            <label htmlFor="etype">{t('Enquiry type')}</label>
            <select id="etype" value={form.enquiryType} onChange={set('enquiryType')}>
              <option value="general">{t('General question')}</option>
              <option value="bulk">{t('Bulk / party order')}</option>
              <option value="scheduled">{t('Scheduled birthday or event')}</option>
            </select>
            {form.enquiryType !== 'general' && (
              <>
                <label htmlFor="edate">{t('Event date')}</label>
                <input id="edate" type="datetime-local" value={form.eventDate} onChange={set('eventDate')} />
                <label htmlFor="eguests">{t('Expected guests')}</label>
                <input id="eguests" type="number" min="10" value={form.guests} onChange={set('guests')} placeholder={t('e.g. 40')} />
              </>
            )}
            {formError && <p className="ferr" role="alert">{formError}</p>}
            <button className="btn gold" type="submit" disabled={busy}>{busy ? t('Sending...') : t('Send message')}</button>
            {sent && <p className="ok" role="status">{t('Thanks, your message was sent. We will call you shortly.')}</p>}
          </form>
        </div>
        <div className="wrap mapwrap">
          <iframe
            className="map"
            title={t('Cranvila Waffle on Google Maps')}
            src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="btns">
            <a className="btn gold sm" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_QUERY)}`} target="_blank" rel="noreferrer">{t('Get directions')}</a>
            <a className="btn outline sm" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`} target="_blank" rel="noreferrer">{t('Open in Google Maps')}</a>
          </div>
        </div>
      </section>
    </>
  )
}
