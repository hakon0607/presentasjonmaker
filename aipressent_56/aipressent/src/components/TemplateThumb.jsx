import SlideStage from './SlideStage'
import { templateCover } from '../lib/templates'

// Ekte forhåndsvisning: rendrer malens faktiske forside-lysbilde i 16:9.
// (Få maler nå, så det er rimelig å vise ekte lysbilder i stedet for en SVG-skisse.)
export default function TemplateThumb({ t }) {
  const cover = templateCover(t)
  return (
    <div className="tpl-thumb-stage">
      <SlideStage slide={cover} />
    </div>
  )
}
