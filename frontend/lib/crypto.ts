"use client";
export async function exportCryptoKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return Array.from(new Uint8Array(exported)).toString();
}

export async function importSecretKey(keyString: string): Promise<CryptoKey> {
  const keyData = new Uint8Array(keyString.split(",").map(Number));

  return window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(
  message: string,
  key: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);

  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedMessage
  );

  console.log(
    JSON.stringify({
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(ciphertext)),
    })
  );
  return JSON.stringify({
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext)),
  });
}

export async function decryptMessage(
  encryptedData: string,
  key: CryptoKey
): Promise<string> {
  const { iv, ciphertext } = JSON.parse(encryptedData);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    key,
    new Uint8Array(ciphertext)
  );

  return new TextDecoder().decode(decrypted);
}

export async function generateKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}
