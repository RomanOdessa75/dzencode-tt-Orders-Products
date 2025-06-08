const connections = [];

self.onconnect = function (e) {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = function (event) {
    connections.forEach((p) => {
      if (p !== port) {
        p.postMessage(event.data);
      }
    });
  };

  port.start();
};
