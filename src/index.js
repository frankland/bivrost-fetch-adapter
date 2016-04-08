const DEFAULT_OPTIONS = {
  responseType: 'json'
};

const DEFAULT_INTERCEPTORS = {
  request: () => {},
  response: response => {
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(response);
    }
  }
};

export default function fetchAdapter(config = {}) {
  let options = {
    ...DEFAULT_OPTIONS,
    ...(config.options || {})
  };

  const interceptors = {
    ...DEFAULT_INTERCEPTORS,
    ...(config.interceptors || {})
  };

  return function(url, requestOptions = {}) {
    const config = {
      ...options,
      headers: new Headers(requestOptions.headers || {})
    };

    if (requestOptions.body) {
      if (requestOptions.body instanceof FormData) {
        config.body = requestOptions.body;
      } else {
        config.body = JSON.stringify(requestOptions.body);
      }
    }

    let queryString = '';
    if (requestOptions.query) {
      const query = requestOptions.query;
      queryString = Object.keys(query)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
        .join('&');
    }

    const request = new Request(`${url}${queryString ? `?${queryString}` : ''}`, {
      method: requestOptions.verb,
      ...config
    });

    interceptors.request(request);

    return fetch(request)
      .then(response => {
        return interceptors.response(response);
      });
  }
};
