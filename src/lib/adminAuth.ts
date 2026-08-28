import { useState, useEffect } from 'react';

// Cryptographic SHA-256 hash of 'henriq'
const ADMIN_PASSWORD_HASH = '7d0966d144193f20481721613dec28b5e42f55db345b2c7aaf958e9e1cabe09c';

export function checkIsAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('techify_admin') === 'true';
}

export function setAdminAuth(isAuth: boolean) {
  if (typeof window === 'undefined') return;
  if (isAuth) {
    localStorage.setItem('techify_admin', 'true');
  } else {
    localStorage.removeItem('techify_admin');
  }
  window.dispatchEvent(new Event('techify_admin_change'));
}

export async function validateAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const cleanPass = password.trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(cleanPass);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === ADMIN_PASSWORD_HASH;
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(checkIsAdmin);

  useEffect(() => {
    const handleAdminChange = () => {
      setIsAdmin(checkIsAdmin());
    };
    window.addEventListener('techify_admin_change', handleAdminChange);
    window.addEventListener('storage', handleAdminChange);
    return () => {
      window.removeEventListener('techify_admin_change', handleAdminChange);
      window.removeEventListener('storage', handleAdminChange);
    };
  }, []);

  return {
    isAdmin,
    login: async (pass: string) => {
      const isValid = await validateAdminPassword(pass);
      if (isValid) {
        setAdminAuth(true);
        return true;
      }
      return false;
    },
    logout: () => setAdminAuth(false)
  };
}
