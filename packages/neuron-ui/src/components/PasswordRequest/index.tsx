import React, { useRef, useCallback, useMemo } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from 'widgets/Button'
import TextField from 'widgets/TextField'
import { useDialog } from 'utils/hooks'
import { StateWithDispatch, AppActions } from 'states/stateProvider/reducer'
import { sendTransaction, deleteWallet, backupWallet } from 'states/stateProvider/actionCreators'
import styles from './passwordRequest.module.scss'

const PasswordRequest = ({
  app: {
    send: { description, generatedTx },
    loadings: { sending: isSending = false },
    passwordRequest: { walletID = '', actionType = null, password = '' },
  },
  settings: { wallets = [] },
  history,
  dispatch,
}: React.PropsWithoutRef<StateWithDispatch & RouteComponentProps>) => {
  const [t] = useTranslation()
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  useDialog({ show: actionType, dialogRef })

  const wallet = useMemo(() => wallets.find(w => w.id === walletID), [walletID, wallets])
  const onDismiss = useCallback(() => {
    dispatch({
      type: AppActions.DismissPasswordRequest,
    })
  }, [dispatch])

  const onConfirm = useCallback(() => {
    switch (actionType) {
      case 'send': {
        if (isSending) {
          break
        }
        sendTransaction({
          walletID,
          tx: generatedTx,
          description,
          password,
        })(dispatch, history)
        break
      }
      case 'delete': {
        deleteWallet({
          id: walletID,
          password,
        })(dispatch)
        break
      }
      case 'backup': {
        backupWallet({
          id: walletID,
          password,
        })(dispatch)
        break
      }
      default: {
        break
      }
    }
  }, [dispatch, walletID, password, actionType, description, history, isSending, generatedTx])

  const onChange = useCallback(
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      const { value } = e.target as HTMLInputElement
      if (/\s/.test(value)) {
        return
      }
      dispatch({
        type: AppActions.UpdatePassword,
        payload: value,
      })
    },
    [dispatch]
  )
  const disabled = !password || (actionType === 'send' && isSending)
  const onKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !disabled) {
        onConfirm()
      }
    },
    [onConfirm, disabled]
  )
  const title = t(`password-request.${actionType}.title`, { name: wallet ? wallet.name : '' })

  if (!wallet) {
    return null
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog}>
      <h2 className={styles.title} title={title} aria-label={title}>
        {title}
      </h2>
      <TextField
        label={t('password-request.password')}
        value={password}
        field="password"
        type="password"
        title={t('password-request.password')}
        onChange={onChange}
        autoFocus
        onKeyPress={onKeyPress}
      />
      <div className={styles.footer}>
        <Button label={t('common.cancel')} type="cancel" onClick={onDismiss} />
        <Button label={t('common.confirm')} type="submit" onClick={onConfirm} disabled={disabled} />
      </div>
    </dialog>
  )
}

PasswordRequest.displayName = 'PasswordRequest'
export default PasswordRequest
