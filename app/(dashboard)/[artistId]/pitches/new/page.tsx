import { PitchForm } from '@/components/dashboard/PitchForm'

export default function NewPitchPage({ params }: { params: { artistId: string } }) {
  return <PitchForm artistId={params.artistId} />
}
