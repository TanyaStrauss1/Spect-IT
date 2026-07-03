/* Branded product placeholder images (SVG data URIs) — no external placeholder CDN */
(function () {
  'use strict';

  function svg(label, accent) {
    accent = accent || '#c9a962';
    var svgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">' +
      '<rect width="300" height="300" fill="#faf9f7"/>' +
      '<rect x="24" y="24" width="252" height="252" rx="16" fill="#fff" stroke="' + accent + '" stroke-width="2"/>' +
      '<text x="150" y="130" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#1e3a5f">' + label + '</text>' +
      '<text x="150" y="168" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#5c6570">Spect-IT Shop</text>' +
      '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svgStr);
  }

  var CATEGORIES = {
    'contact-lenses': svg('Lenses', '#2d6a6a'),
    'frames': svg('Frames', '#c9a962'),
    'sunglasses': svg('Sunglasses', '#1e3a5f'),
    'reading-glasses': svg('Reading', '#a8864a')
  };

  function forProduct(name, category) {
    var cat = category || 'frames';
    var short = (name || 'Product').split(' ').slice(0, 2).join(' ');
    if (short.length > 14) short = short.slice(0, 12) + '…';
    return CATEGORIES[cat] || svg(short);
  }

  window.SpectitProductImages = {
    category: function (cat) { return CATEGORIES[cat] || CATEGORIES.frames; },
    product: forProduct
  };
})();
