import React, { useState } from 'react'
import { Drawer } from '@mantine/core'
import classes from './Service.module.css'
import { useService } from './useService.hook'
import { IconAddressBook, IconSettings } from '@tabler/icons-react'
import { Accounts } from '../accounts/Accounts'
import { Setup } from '../setup/Setup'
import { useDisclosure } from '@mantine/hooks'

export function Service() {
  const { state } = useService()
  const [tab, setTab] = useState('accounts')
  const [setup, { open: openSetup, close: closeSetup }] = useDisclosure(false)

  return (
    <div className={classes.service}>
      {state.layout === 'small' && (
        <>
          <div className={classes.body}>
            <div className={tab === 'setup' ? classes.show : classes.hide}>
              <div className={classes.screen}>
                <Setup />
              </div>
            </div>
            <div className={tab === 'accounts' ? classes.show : classes.hide}>
              <div className={classes.screen}>
                <Accounts openSetup={() => {}} />
              </div>
            </div>
          </div>
          <div className={classes.tabs}>
            {tab === 'accounts' && (
              <div className={classes.activeTabItem}>
                <IconAddressBook className={classes.tabIcon} />
              </div>
            )}
            {tab !== 'accounts' && (
              <div className={classes.idleTabItem} onClick={() => setTab('accounts')}>
                <IconAddressBook className={classes.tabIcon} />
              </div>
            )}
            <div className={classes.tabDivider} />
            {tab === 'setup' && (
              <div className={classes.activeTabItem}>
                <IconSettings className={classes.tabIcon} />
              </div>
            )}
            {tab !== 'setup' && (
              <div className={classes.idleTabItem} onClick={() => setTab('setup')}>
                <IconSettings className={classes.tabIcon} />
              </div>
            )}
          </div>
        </>
      )}
      {state.layout === 'large' && (
        <div className={classes.display}>
          <Accounts openSetup={openSetup} />
          <Drawer opened={setup} onClose={closeSetup} withCloseButton={false} size="550px" padding="0" position="right">
            <div style={{ height: '100vh' }}>
              <Setup />
            </div>
          </Drawer>
        </div>
      )}
    </div>
  )
}
