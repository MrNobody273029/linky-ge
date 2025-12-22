import { cookies } from 'next/headers';

export function getTheme(): 'light' | 'dark' {
  const v = cookies().get('theme')?.value;
  return v === 'dark' ? 'dark' : 'light';
}
