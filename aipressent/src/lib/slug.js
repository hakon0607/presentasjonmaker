// Gjør et presentasjonsnavn om til et trygt mappenavn i storage.
// «Verdenshavene» -> «verdenshavene», æøå -> aeoa, mellomrom -> bindestrek.
export function folderSlug(name) {
  const s = String(name || '').toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[äàáâ]/g, 'a').replace(/[öòóô]/g, 'o').replace(/[üùúû]/g, 'u').replace(/[éèêë]/g, 'e')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
  return s || 'presentasjon'
}
