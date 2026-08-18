import type { BioProfile, SubjectAppearance } from '../types'

const shoulderScale: Record<BioProfile['bodyType'], number> = {
  Lean: 0.92,
  Athletic: 1.08,
  Average: 1,
  Heavy: 1.16,
}

const faceScale: Record<SubjectAppearance['faceConcept'], number> = {
  Oval: 1,
  Round: 1.08,
  Square: 1.02,
  Heart: 0.95,
  Long: 0.92,
}

const hairShape: Record<SubjectAppearance['hairstyle'], string> = {
  Bald: '0% 0% 50% 50%',
  Buzz: '46% 46% 40% 40%',
  Short: '48% 48% 34% 34%',
  Medium: '52% 52% 28% 28%',
  Long: '52% 52% 20% 20%',
  Ponytail: '55% 55% 18% 18%',
  Bun: '52% 52% 22% 22%',
  Afro: '58% 58% 38% 38%',
}

export function SubjectReconstruction({
  appearance,
  bioProfile,
  name,
}: {
  appearance: SubjectAppearance
  bioProfile: BioProfile
  name: string
}) {
  const isFemale = appearance.sex === 'Female'
  const beardVisible = !isFemale && appearance.facialHair !== 'None'

  return (
    <div className="recon-stage">
      <div className="recon-grid" />
      <div className="scan-ring" />
      <div
        className="recon-model"
        style={{
          ['--skin' as string]: appearance.skinTone,
          ['--hair' as string]: appearance.hairColor,
          ['--eyes' as string]: appearance.eyeColor,
          ['--shoulder-scale' as string]: `${shoulderScale[bioProfile.bodyType]}`,
          ['--face-scale' as string]: `${faceScale[appearance.faceConcept]}`,
          ['--hair-shape' as string]: hairShape[appearance.hairstyle],
        }}
      >
        <div className="recon-head">
          {appearance.hairstyle !== 'Bald' && <div className="recon-hair" />}
          <div className="recon-eyes">
            <span />
            <span />
          </div>
          <div className="recon-nose" />
          <div className="recon-mouth" />
          {beardVisible && <div className={`recon-beard ${appearance.facialHair.toLowerCase().replace(/\s+/g, '-')}`} />}
        </div>
        <div className="recon-neck" />
        <div className="recon-torso" />
      </div>
      <div className="recon-readout">
        <span>{name}</span>
        <span>{appearance.sex}</span>
        <span>{appearance.faceConcept}</span>
        <span>{bioProfile.bodyType}</span>
      </div>
    </div>
  )
}