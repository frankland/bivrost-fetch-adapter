const DEFAULT_OPTIONS = {};

const DEFAULT_INTERCEPTORS = {
  response: response => {
    const headers = response.headers;
    const contentType = headers.get('content-type');

    let action = null;

    if (contentType.indexOf('application/json') != -1) {
      action = () => response.json();
    } else {
      action = () => response.text();
    }

    if (response.ok) {
      return action();
    } else {
      return Promise.reject(response);
    }
  }
};

export default function fetchAdapter(config = {}) {
  let requestAdapterOptions = {
    ...DEFAULT_OPTIONS,
    ...config
  };

  return function(url, requestOptions = {}, applicationInterceptors = {}) {
    const config = {
      ...requestAdapterOptions,
      headers: new Headers({
        ...(requestAdapterOptions.headers || {}),
        ...(requestOptions.headers || {})
      })
    };

    const interceptors = {
      ...DEFAULT_INTERCEPTORS,
      ...applicationInterceptors
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

    if (interceptors.request) {
      interceptors.request(request);
    }

    return fetch(request)
      .then(response => {
        return interceptors.response ? interceptors.response(response) : response;
      }, error => {
        return interceptors.error ? interceptors.error(error) : error;
      });
  }
};
