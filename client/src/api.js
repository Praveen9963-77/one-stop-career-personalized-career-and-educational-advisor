const configuredApiUrl = import.meta.env.VITE_API_URL;
const API_URLS = [configuredApiUrl || "http://localhost:5000/api"];
export const API_ORIGIN = API_URLS[0].replace(/\/api\/?$/, "");

function apiOrigin(apiUrl) {
  return apiUrl.replace(/\/api\/?$/, "");
}

export async function api(path, options = {}) {
  const token = localStorage.getItem("careerAdvisorToken");
  let lastError;

  for (const apiUrl of API_URLS) {
    try {
      const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      lastError = error;
      if (error.name !== "TypeError") break;
    }
  }

  throw lastError || new Error("Request failed");
}

export async function apiForm(path, formData, options = {}) {
  const token = localStorage.getItem("careerAdvisorToken");
  let lastError;

  for (const apiUrl of API_URLS) {
    try {
      const response = await fetch(`${apiOrigin(apiUrl)}${path}`, {
        ...options,
        method: options.method || "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      lastError = error;
      if (error.name !== "TypeError") break;
    }
  }

  throw lastError || new Error("Request failed");
}
