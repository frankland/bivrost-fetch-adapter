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

  // https://davidwalsh.name/fetch
  // https://developers.google.com/web/updates/2015/03/introduction-to-fetch?hl=en
  return function(url, requestOptions = {}) {
    const config = {
      ...options,
      headers: new Headers(requestOptions.headers || {})
    };

    let body = null;

    if (requestOptions.query instanceof FormData) {
      body = requestOptions.query;
    } else {
      body = JSON.stringify(requestOptions.query);
    }

    if (requestOptions.verb != 'GET') {
      config.body = body;
    }

    //config.headers = new Headers(requestOptions.headers || {});

    //if (requestOptions.headers) {
    //
    //} else {
    //  config.headers = new Headers({});
    //}

    const request = new Request(url, {
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
