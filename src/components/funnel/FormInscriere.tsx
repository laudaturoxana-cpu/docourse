import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/browser';

interface FormInscriereProps {
  placeholder?: string;
  ctaText?: string;
  redirectTo?: string;
  listId?: string;
}

export default function FormInscriere({
  placeholder = 'Numele tău',
  ctaText = 'REZERVĂ-MI LOCUL',
  redirectTo = '/multumesc-grupa',
  listId,
}: FormInscriereProps) {
  const router = useRouter();
  const [nume, setNume] = useState('');
  const [email, setEmail] = useState('');
  const [numeError, setNumeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    let valid = true;
    if (!nume.trim()) {
      setNumeError('Numele este obligatoriu.');
      valid = false;
    } else {
      setNumeError('');
    }
    if (!email.trim()) {
      setEmailError('Email-ul este obligatoriu.');
      valid = false;
    } else if (!email.includes('@')) {
      setEmailError('Adresa de email nu este validă.');
      valid = false;
    } else {
      setEmailError('');
    }
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (listId) {
      try {
        await supabase.from('email_contacts').insert({
          list_id: listId,
          email: email.trim().toLowerCase(),
          full_name: nume.trim(),
          source: 'funnel',
        });
      } catch {
        // silently continue
      }
    }

    setSubmitted(true);
    setTimeout(() => router.push(redirectTo), 800);
  }

  const inputClass =
    'border border-[#B8965A] rounded px-4 py-3 w-full font-sans text-[#1B2A4A] focus:outline-none focus:ring-1 focus:ring-[#B8965A] bg-white';

  if (submitted) {
    return (
      <div className="text-[#1B2A4A] font-medium text-center py-4">
        Mulțumesc! Te contactez în curând.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3" noValidate>
      <div>
        <input
          type="text"
          placeholder={placeholder}
          value={nume}
          onChange={(e) => setNume(e.target.value)}
          className={inputClass}
        />
        {numeError && <p className="text-red-500 text-xs mt-1">{numeError}</p>}
      </div>
      <div>
        <input
          type="email"
          placeholder="Adresa ta de email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
      </div>
      <button
        type="submit"
        className="bg-[#B8965A] text-white w-full py-4 text-sm tracking-widest uppercase hover:opacity-90 transition rounded"
      >
        {ctaText}
      </button>
    </form>
  );
}
