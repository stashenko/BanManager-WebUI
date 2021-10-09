import { Loader } from 'semantic-ui-react'
import { useRouter } from 'next/router'
import DefaultLayout from '../../../components/DefaultLayout'
import PageContainer from '../../../components/PageContainer'
import PlayerNoteForm from '../../../components/PlayerNoteForm'
import ErrorLayout from '../../../components/ErrorLayout'
import { useApi, useUser } from '../../../utils'

export default function Page () {
  const router = useRouter()
  const { id } = router.query
  const { loading, data, errors } = useApi({
    query: !id
      ? null
      : `query player($id: UUID!) {
    player(player: $id) {
      id
      name
    }
    servers {
      id
      name
    }
  }`,
    variables: { id }
  })
  const { hasServerPermission } = useUser({ redirectIfFound: false, redirectTo: '/' })

  if (loading) return <Loader active />
  if (errors || !data) return <ErrorLayout errors={errors} />

  const query = `mutation createPlayerNote($input: CreatePlayerNoteInput!) {
    createPlayerNote(input: $input) {
      id
    }
  }`

  return (
    <DefaultLayout title={`Ban ${data.player.name}`}>
      <PageContainer>
        <PlayerNoteForm
          player={data.player}
          servers={data.servers.filter(server => hasServerPermission('player.notes', 'create', server.id))}
          query={query}
          parseVariables={(input) => ({
            input: {
              player: id,
              server: input.server,
              message: input.message
            }
          })}
          onFinished={() => router.push(`/player/${id}`)}
        />
      </PageContainer>
    </DefaultLayout>
  )
}
