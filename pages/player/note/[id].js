import { useRouter } from 'next/router'
import Loader from '../../../components/Loader'
import DefaultLayout from '../../../components/DefaultLayout'
import PageContainer from '../../../components/PageContainer'
import PlayerNoteForm from '../../../components/PlayerNoteForm'
import ErrorLayout from '../../../components/ErrorLayout'
import PageHeader from '../../../components/PageHeader'
import { fromNow, useApi } from '../../../utils'

export default function Page () {
  const router = useRouter()
  const [serverId, id] = router.query.id?.split('-') || []
  const { loading, data, errors } = useApi({
    query: !serverId || !id
      ? null
      : `query playerNote($id: ID!, $serverId: ID!) {
    playerNote(id: $id, serverId: $serverId) {
      id
      message
      created
      player {
        id
        name
      }
      server {
        id
        name
      }
    }
  }`,
    variables: { id, serverId }
  })

  if (loading) return <Loader />
  if (errors || !data) return <ErrorLayout errors={errors} />

  const query = `mutation updatePlayerNote($id: ID!, $serverId: ID!, $input: UpdatePlayerNoteInput!) {
    updatePlayerNote(id: $id, serverId: $serverId, input: $input) {
      id
    }
  }`

  return (
    <DefaultLayout title={`Update ${data.playerNote.player.name} note`}>
      <PageContainer>
        <div className='mx-auto flex flex-col w-full max-w-md px-4 py-8 sm:px-6 md:px-8 lg:px-10 text-center md:border-2 md:rounded-lg md:border-black'>
          <PageHeader title='Edit note' subTitle={`Created ${fromNow(data.playerNote.created)}`} />
          <PlayerNoteForm
            defaults={data.playerNote}
            query={query}
            parseVariables={(input) => ({
              id,
              serverId,
              input: { message: input.message }
            })}
            disableServers
            onFinished={() => router.push(`/player/${data.playerNote.player.id}`)}
          />
        </div>
      </PageContainer>
    </DefaultLayout>
  )
}
