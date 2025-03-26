import React, { useState, useEffect } from 'react'
import { useContent } from './useContent.hook'
import { Modal, Box, LoadingOverlay, Text, Switch, TextInput, Button } from '@mantine/core'
import { IconSearch, IconMessagePlus, IconLabel } from '@tabler/icons-react'
import classes from './Content.module.css'
import { Channel } from '../channel/Channel'
import { Card } from '../card/Card'
import { modals } from '@mantine/modals'
import { Colors } from '../constants/Colors'

export function Content({ textCard }: { textCard: { cardId: null | string } }) {
  const { state, actions } = useContent()
  const [add, setAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [sealed, setSealed] = useState(false)
  const [subject, setSubject] = useState('')
  const [added, setAdded] = useState([] as string[])
  const cards = state.sealSet && sealed ? state.sealable : state.connected

  const openTopic = async (cardId: string) => {
    setAdding(true)
    try {
      await actions.openTopic(cardId)
    } catch (err) {
      console.log(err)
      showError()
    }
    setAdding(false)
  }

  const addTopic = async () => {
    setAdding(true)
    try {
      const id = await actions.addTopic(
        sealed,
        subject,
        added.filter((id) => Boolean(cards.find((card) => card.cardId === id)))
      )
      actions.setFocus(null, id)
      setAdd(false)
      setSealed(false)
      setAdded([])
      setSubject('')
    } catch (err) {
      console.log(err)
      showError()
    }
    setAdding(false)
  }

  const showError = () => {
    modals.openConfirmModal({
      title: state.strings.operationFailed,
      withCloseButton: true,
      overlayProps: {
        backgroundOpacity: 0.55,
        blur: 3,
      },
      children: <Text>{state.strings.tryAgain}</Text>,
      cancelProps: { display: 'none' },
      confirmProps: { display: 'none' },
    })
  }

  const contacts = cards.map((card, idx) => {
    const enable = (
      <Switch
        key="add"
        className={classes.addMember}
        size="sm"
        checked={Boolean(added.find((id) => id === card.cardId))}
        onChange={(ev) => {
          if (ev.currentTarget.checked) {
            setAdded([...added, card.cardId])
          } else {
            setAdded(added.filter((id) => id !== card.cardId))
          }
        }}
      />
    )
    return <Card key={idx} className={classes.card} imageUrl={card.imageUrl} name={card.name} handle={card.handle} node={card.node} placeholder={state.strings.name} actions={[enable]} />
  })

  const channels = state.filtered.map((channel, idx) => {
    return (
      <Channel
        key={idx}
        className={classes.channel}
        unread={channel.unread}
        focused={channel.focused}
        imageUrl={channel.imageUrl}
        subject={channel.subject}
        messagePlaceholder={`[${state.strings.sealed}]`}
        notesPlaceholder={state.strings.notes}
        subjectPlaceholder={state.strings.unknown}
        message={channel.message}
        select={() => actions.setFocus(channel.cardId, channel.channelId)}
      />
    )
  })

  useEffect(() => {
    if (textCard.cardId) {
      openTopic(textCard.cardId)
    }
  }, [textCard])

  return (
    <div className={classes.content}>
      <div className={classes.header}>
        <TextInput
          className={classes.input}
          size="sm"
          leftSectionPointerEvents="none"
          leftSection={<IconSearch size={20} />}
          placeholder={state.strings.topics}
          value={state.filter}
          onChange={(event) => actions.setFilter(event.currentTarget.value)}
        />
        {state.layout === 'small' && (
          <Button className={classes.add} leftSection={<IconMessagePlus size={20} />} onClick={() => setAdd(true)}>
            {state.strings.add}
          </Button>
        )}
      </div>
      <Box className={classes.channels} pos="relative" onClick={actions.setLoaded}>
        {channels.length === 0 && <div className={classes.none}>{state.strings.noTopics}</div>}
        {channels.length !== 0 && <div className={classes.channels}>{channels}</div>}
        <LoadingOverlay visible={!state.loaded} zIndex={1000} overlayProps={{ radius: 'sm', blur: 1 }} loaderProps={{ color: Colors.primary, type: 'dots' }} />
      </Box>
      {state.layout === 'large' && (
        <div className={classes.bar}>
          <Button className={classes.add} leftSection={<IconMessagePlus size={20} />} onClick={() => setAdd(true)}>
            {state.strings.add}
          </Button>
        </div>
      )}
      <Modal title={state.strings.newTopic} opened={add} onClose={() => setAdd(false)} overlayProps={{ backgroundOpacity: 0.65, blur: 3 }} centered>
        <div className={classes.addContainer}>
          <TextInput
            className={classes.input}
            size="sm"
            leftSectionPointerEvents="none"
            leftSection={<IconLabel size={20} />}
            placeholder={state.strings.subjectOptional}
            value={subject}
            onChange={(event) => setSubject(event.currentTarget.value)}
          />
          <div>
            <Text className={classes.members}>{state.strings.members}</Text>
            <div className={classes.addMembers}>
              {cards.length === 0 && (
                <div className={classes.noContacts}>
                  <Text className={classes.noContactsLabel}>{state.strings.noContacts}</Text>
                </div>
              )}
              {contacts}
            </div>
          </div>
          <div className={classes.addControls}>
            <div className={classes.addSealed}>
              {state.sealSet && <Switch label={state.strings.sealedTopic} size="md" labelPosition="left" onChange={(ev) => setSealed(ev.currentTarget.checked)} />}
            </div>
            <Button variant="default" onClick={() => setAdd(false)}>
              {state.strings.cancel}
            </Button>
            <Button variant="filled" onClick={addTopic} loading={adding}>
              {state.strings.create}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
