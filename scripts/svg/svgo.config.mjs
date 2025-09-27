export default {
  multipass: true,
  js2svg: { indent: 0, pretty: false },
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'cleanupIds',
    'convertStyleToAttrs',
    'convertColors',
    'sortAttrs',
    // Keep animation + style
    { name: 'removeUnknownsAndDefaults', params: { keepDataAttrs: true } },
    { name: 'removeUselessDefs', params: { keepShapes: true } },
    { name: 'removeViewBox', active: false }, // keep viewBox for scaling
  ]
}
