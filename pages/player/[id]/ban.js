import { useRouter } from 'next/router'
import Loader from '../../../components/Loader'
import DefaultLayout from '../../../components/DefaultLayout'
import PageContainer from '../../../components/PageContainer'
import PlayerBanForm from '../../../components/PlayerBanForm'
import ErrorLayout from '../../../components/ErrorLayout'
import PageHeader from '../../../components/PageHeader'
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
  }`,
    variables: { id }
  })
  const { hasServerPermission } = useUser({ redirectIfFound: false, redirectTo: '/' })

  if (loading) return <Loader />
  if (errors || !data) return <ErrorLayout errors={errors} />

  const query = `mutation createPlayerBan($input: CreatePlayerBanInput!) {
    createPlayerBan(input: $input) {
      id
    }
  }`

  return (
    <DefaultLayout title={`Ban ${data.player.name}`}>
      <PageContainer>
        <div className='mx-auto flex flex-col w-full max-w-md px-4 py-8 sm:px-6 md:px-8 lg:px-10 text-center md:border-2 md:rounded-lg md:border-black'>
          <PageHeader title={`Ban ${data.player.name}`} subTitle='' />
          <div className='mt-5'>
            <PlayerBanForm
              serverFilter={server => hasServerPermission('player.bans', 'create', server.id)}
              query={query}
              parseVariables={(input) => ({
                input: {
                  player: id,
                  server: input.server,
                  reason: input.reason,
                  expires: Math.floor(input.expires / 1000)
                }
              })}
              onFinished={() => router.push(`/player/${id}`)}
            />
          </div>
        </div>
      </PageContainer>
    </DefaultLayout>
  )
}
