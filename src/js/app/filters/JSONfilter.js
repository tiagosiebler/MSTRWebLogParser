angular.module('JSONfilter', []).filter('plainJSON', function() {
  return function(input, uppercase) {
    input = input || '';
    var out = '';

    if (typeof input == 'object') {
      out = JSON.stringify(input);
    }
    return out;
  };
});
