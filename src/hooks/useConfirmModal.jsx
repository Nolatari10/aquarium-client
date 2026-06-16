import { Modal, Button, Group, Text } from '@mantine/core'
import { useState, useCallback } from 'react'

export function useConfirmModal() {
  const [opened, setOpened] = useState(false)
  const [resolveRef, setResolveRef] = useState(null)
  const [message, setMessage] = useState('')

  const confirm = useCallback((msg) => {
    setMessage(msg)
    setOpened(true)
    return new Promise((resolve) => {
      setResolveRef(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setOpened(false)
    resolveRef?.(true)
  }, [resolveRef])

  const handleCancel = useCallback(() => {
    setOpened(false)
    resolveRef?.(false)
  }, [resolveRef])

  const ConfirmModal = (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title="Confirm action"
      size="sm"
      centered
    >
      <Text mb="md">{message}</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={handleCancel}>
          Cancel
        </Button>
        <Button color="red" onClick={handleConfirm}>
          Delete
        </Button>
      </Group>
    </Modal>
  )

  return { confirm, ConfirmModal }
}
