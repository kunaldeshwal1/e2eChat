function setCookie(
  name: string,
  value: string,
  days?: number,
  path: string = "/"
): void {
  let expires = "";

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}${expires}; path=${path}`;
}

/**
 * Gets a cookie value by name
 * @param name The name of the cookie to get
 * @returns The cookie value or null if not found
 */
function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + "=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Deletes a cookie by setting its expiration to the past
 * @param name The name of the cookie to delete
 * @param path The path of the cookie (should match the path used when setting)
 */
function deleteCookie(name: string, path: string = "/"): void {
  setCookie(name, "", -1, path);
}

export { setCookie, getCookie, deleteCookie };
