import { Fragment, useEffect, useState } from 'react'
import { Button, Form, Header, Image, Modal, Select } from 'semantic-ui-react'
import ErrorMessages from '../ErrorMessages'
import { useMutateApi } from '../../utils'

export default function PlayerEditForm ({ open, onFinished, player, roles, servers }) {
  if (!player) return null

  const [inputState, setInputState] = useState({
    email: player.email || '',
    roles: player.roles.map(({ role }) => role.id),
    serverRoles: player.serverRoles
  })
  const { load, loading, data, errors } = useMutateApi({
    query: `mutation setRoles($player: UUID!, $input: SetRolesInput!) {
      setRoles(player: $player, input: $input) {
        id
        player {
          name
        }
        email
        roles {
          role {
            id
            name
          }
        }
        serverRoles {
          serverRole {
            id
            name
          }
          server {
            id
          }
        }
      }
    }`
  })

  useEffect(() => {
    if (!data) return
    if (Object.keys(data).some(key => !!data[key].id)) onFinished(data)
  }, [data])

  const onSubmit = (e) => {
    e.preventDefault()

    load({
      player: player.id,
      input: {
        roles: inputState.roles.map(id => ({ id })),
        serverRoles: inputState.serverRoles.map(role => ({ role: { id: role.serverRole.id }, server: { id: role.server.id } }))
      }
    })
  }
  const handleChange = (e, { name, value }) => setInputState({ ...inputState, [name]: value })
  const handleServerRoleChange = (e, { name, value }) => {
    const newRoles = roles
      .filter(role => value.includes(role.id))
      .map(role => ({ serverRole: { id: role.id, name: role.name }, server: { id: name } }))

    setInputState({ ...inputState, serverRoles: newRoles })
  }

  const serversDropdown = servers.map(server => ({ key: server.id, value: server.id, text: server.name }))
  const rolesDropdown = roles.map(role => ({ key: role.id, text: role.name, value: role.id }))

  return (
    <Modal
      open={open}
      onClose={onFinished}
    >
      <Header>
        <Image src={`https://crafatar.com/avatars/${player.id}?size=45&overlay=true`} fluid avatar />
        {player.player.name}
      </Header>
      <Modal.Content>
        <Form size='large' error loading={loading}>
          <ErrorMessages errors={errors} />
          <Form.Input
            fluid
            placeholder='Email'
            value={inputState.email}
            name='email'
            readOnly
          />
          <Header>Global Roles</Header>
          <Select
            required
            name='roles'
            options={rolesDropdown}
            value={inputState.roles}
            placeholder='Role'
            onChange={handleChange}
            fluid
            multiple
          />
          <Header>Server Roles</Header>
          {serversDropdown.map(server => {
            const value = inputState.serverRoles
              .filter(r => r.server.id === server.value)
              .map(({ serverRole }) => serverRole.id)

            return (
              <Fragment key={server.value}>
                <Header size='small'>{server.text}</Header>
                <Select
                  required
                  name={server.value}
                  options={rolesDropdown}
                  value={value}
                  placeholder='Role'
                  onChange={handleServerRoleChange}
                  fluid
                  multiple
                />
              </Fragment>
            )
          })}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button fluid primary size='large' content='Save' loading={loading} onClick={onSubmit} />
      </Modal.Actions>
    </Modal>
  )
}
