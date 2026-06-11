const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
      return `http://${parts[0]}.localhost:5085`;
    }
  }
  return 'http://localhost:5085';
};

export const environment = {
  production: false,
  apiUrl: getApiUrl()
};