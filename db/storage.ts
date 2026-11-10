export async function read(key: string): Promise<string | null> {
  return localStorage.getItem(key);
}

export async function write(key: string, value: string): Promise<void> {
  localStorage.setItem(key, value);
}

export async function remove(key: string): Promise<void> {
  localStorage.removeItem(key);
}
