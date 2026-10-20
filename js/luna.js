/* Thin wrapper over webOS's PalmServiceBridge (what webOSTV.js uses under the hood).
   Outside a TV every call fails gracefully so the UI can be previewed in a browser. */
var Luna = (function () {
  var available = typeof window.PalmServiceBridge !== 'undefined';
  var live = []; // bridges must stay referenced until they answer, or they get GC'd

  function call(uri, params, cb) {
    if (!available) {
      if (cb) setTimeout(function () { cb({ returnValue: false, errorText: 'Not running on webOS' }); }, 0);
      return;
    }
    var bridge = new window.PalmServiceBridge();
    live.push(bridge);
    bridge.onservicecallback = function (msg) {
      var res;
      try { res = JSON.parse(msg); } catch (e) { res = { returnValue: false, errorText: 'Bad response' }; }
      var i = live.indexOf(bridge);
      if (i >= 0) live.splice(i, 1);
      if (cb) cb(res);
    };
    bridge.call(uri, JSON.stringify(params || {}));
  }

  return {
    available: available,
    call: call,
    launch: function (id, params, cb) {
      call('luna://com.webos.applicationManager/launch', { id: id, params: params || {} }, cb);
    },
    listLaunchPoints: function (cb) {
      call('luna://com.webos.applicationManager/listLaunchPoints', {}, cb);
    },
    systemInfo: function (cb) {
      call('luna://com.webos.service.tv.systemproperty/getSystemInfo',
        { keys: ['modelName', 'firmwareVersion', 'UHD', 'sdkVersion'] }, cb);
    }
  };
})();
